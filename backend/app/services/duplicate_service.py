"""Duplicate request detection.

Compares a new or candidate request against recent open requests using:
- Time window (default 72h)
- Category & subcategory
- Location matching (building, room, floor)
- Text similarity (token-level Jaccard similarity after phrase canonicalization)
- Associated active incidents
"""
from dataclasses import dataclass
from datetime import timedelta
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.enums import Category, RequestStatus
from app.models.request import Request
from app.repositories import incident_repository, request_repository
from app.schemas.request import DuplicateCheckResult, DuplicateMatch, IncidentRef
from app.utils.text import jaccard, normalize_place, tokens
from app.utils.time import utcnow


@dataclass
class ScoredMatch:
    request: Request
    similarity: float


def compute_similarity(
    desc1: str,
    cat1: Category | None,
    loc1: dict | None,
    desc2: str,
    cat2: Category | None,
    loc2: dict | None,
) -> float:
    # 1. Text similarity (0.0 to 1.0)
    tok1 = tokens(desc1)
    tok2 = tokens(desc2)
    text_sim = jaccard(tok1, tok2)

    # 2. Category match (bonus/penalty)
    cat_match = 1.0 if (cat1 and cat2 and cat1 == cat2) else 0.0

    # 3. Location match
    b1 = normalize_place(loc1.get("building") if loc1 else None)
    b2 = normalize_place(loc2.get("building") if loc2 else None)
    r1 = normalize_place(loc1.get("room") if loc1 else None)
    r2 = normalize_place(loc2.get("room") if loc2 else None)

    loc_sim = 0.0
    if b1 and b2 and b1 == b2:
        loc_sim += 0.6
        if r1 and r2 and r1 == r2:
            loc_sim += 0.4
        elif not r1 and not r2:
            loc_sim += 0.2
    elif not b1 and not b2:
        # Neither has building specified, location similarity is neutral
        loc_sim = 0.3

    # Weighted composite score:
    # Text: 45%, Location: 35%, Category: 20%
    score = (0.45 * text_sim) + (0.35 * loc_sim) + (0.20 * cat_match)

    # If building is completely different and both are specified, penalize score heavily
    if b1 and b2 and b1 != b2:
        score *= 0.3

    return round(min(1.0, max(0.0, score)), 2)


def check_duplicates(
    db: Session,
    description: str,
    category: Category | None = None,
    location: dict | None = None,
    exclude_request_id: str | None = None,
) -> DuplicateCheckResult:
    window_hours = settings.DUPLICATE_WINDOW_HOURS
    since = utcnow() - timedelta(hours=window_hours)
    candidates = request_repository.recent_open_requests(db, since=since, exclude_id=exclude_request_id)

    matches: list[ScoredMatch] = []
    for cand in candidates:
        cand_loc = {
            "building": cand.building,
            "floor": cand.floor,
            "room": cand.room,
        }
        sim = compute_similarity(
            desc1=description,
            cat1=category,
            loc1=location,
            desc2=f"{cand.title} {cand.description}",
            cat2=cand.category,
            loc2=cand_loc,
        )
        if sim >= settings.DUPLICATE_CONFIDENCE_THRESHOLD:
            matches.append(ScoredMatch(request=cand, similarity=sim))

    matches.sort(key=lambda m: m.similarity, reverse=True)

    if not matches:
        return DuplicateCheckResult(
            duplicate_found=False,
            confidence=0.10,
            matching_requests=[],
            incident=None,
        )

    best_match = matches[0]
    top_confidence = best_match.similarity

    # Find if any matched request is already part of an active incident
    candidate_ids = [m.request.id for m in matches]
    incidents_map = incident_repository.incidents_for_requests(db, candidate_ids)

    incident_ref: IncidentRef | None = None
    for cand_id in candidate_ids:
        if cand_id in incidents_map:
            inc = incidents_map[cand_id]
            incident_ref = IncidentRef(
                id=inc.id,
                incident_number=inc.incident_number,
                title=inc.title,
                affected_students=inc.affected_students,
            )
            break

    duplicate_items = [
        DuplicateMatch(
            id=m.request.id,
            ticket_number=m.request.ticket_number,
            title=m.request.title,
            status=m.request.status,
            created_at=m.request.created_at,
            similarity=m.similarity,
        )
        for m in matches[:5]
    ]

    return DuplicateCheckResult(
        duplicate_found=True,
        confidence=top_confidence,
        matching_requests=duplicate_items,
        incident=incident_ref,
    )
