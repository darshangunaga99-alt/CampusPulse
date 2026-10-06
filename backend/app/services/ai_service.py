"""AI request analysis with a deterministic rule-based fallback.

AI output is treated as a *recommendation*:
  * category / priority must be valid enum values, otherwise they are discarded;
  * department is NEVER taken from the AI – it is resolved by business routing rules;
  * final priority is computed by priority_service (AI can only nudge it).
If the provider is not configured, times out, or returns junk, the rule engine is used
and the response schema stays identical.
"""
import json
import logging
import re
from dataclasses import dataclass, field

import httpx
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.enums import PRIORITY_RANK, Category, Priority
from app.repositories import user_repository
from app.services import priority_service

log = logging.getLogger("campuspulse.ai")

# (category, subcategory, keyword regexes). Order matters only for ties.
KEYWORD_RULES: list[tuple[Category, str, list[str]]] = [
    (Category.it_support, "network", [r"wi[\s\-]?fi", r"internet", r"network", r"\blan\b", r"ethernet", r"router",
                                      r"hotspot", r"connectivity"]),
    (Category.it_support, "account", [r"password", r"\blogin\b", r"log in", r"\bportal\b", r"\bemail\b", r"\bvpn\b",
                                      r"\berp\b", r"account"]),
    (Category.lab_equipment, "projector", [r"projector", r"\bhdmi\b", r"smart ?board", r"beamer"]),
    (Category.lab_equipment, "computer", [r"computer", r"lab pc", r"\bpcs?\b", r"desktop", r"monitor", r"keyboard",
                                          r"\bmouse\b", r"\bcpu\b"]),
    (Category.lab_equipment, "printer", [r"printer", r"scanner", r"photocop\w*", r"xerox"]),
    (Category.lab_equipment, "lab_instrument", [r"oscilloscope", r"microscope", r"multimeter", r"lab equipment",
                                                r"instrument"]),
    (Category.maintenance, "plumbing", [r"water", r"\bleak\w*", r"\btap\b", r"pipe", r"drain", r"toilet",
                                        r"washroom", r"flush", r"tank"]),
    (Category.maintenance, "electrical", [r"electric\w*", r"\bpower\b", r"\blights?\b", r"\bfans?\b", r"switch",
                                          r"socket", r"wiring", r"\bwires?\b", r"spark\w*", r"short circuit",
                                          r"\bmcb\b"]),
    (Category.maintenance, "hvac", [r"\bac\b", r"air ?condition\w*", r"cooling", r"ventilation"]),
    (Category.maintenance, "furniture", [r"furniture", r"chairs?", r"desks?", r"bench\w*", r"table", r"door",
                                         r"window", r"cupboard"]),
    (Category.maintenance, "cleaning", [r"clean\w*", r"garbage", r"dust\w*", r"pest", r"cockroach\w*"]),
    (Category.library, "library", [r"library", r"\bbooks?\b", r"journal", r"borrow\w*", r"librarian"]),
    (Category.academic, "academic", [r"\bexam\w*", r"marks", r"grade\w*", r"attendance", r"timetable", r"syllabus",
                                     r"course", r"lecture", r"faculty", r"internal assessment"]),
    (Category.administration, "certificate", [r"certificate", r"bonafide", r"transcript", r"\bfees?\b",
                                              r"id card", r"scholarship", r"admission", r"\bnoc\b"]),
    (Category.hostel, "hostel", [r"hostel", r"\bmess\b", r"warden", r"roommate", r"laundry", r"room allot\w*"]),
    (Category.transport, "transport", [r"\bbus\b", r"transport", r"shuttle", r"parking", r"\broute\b", r"driver"]),
]
_COMPILED = [(c, s, [re.compile(p, re.I) for p in pats]) for c, s, pats in KEYWORD_RULES]

SUBJECT_LABELS = {
    "network": "Network connectivity issue",
    "account": "Account access issue",
    "projector": "Projector failure",
    "computer": "Computer issue",
    "printer": "Printer issue",
    "lab_instrument": "Lab instrument issue",
    "plumbing": "Water/plumbing issue",
    "electrical": "Electrical issue",
    "hvac": "Air-conditioning issue",
    "furniture": "Furniture damage",
    "cleaning": "Cleanliness issue",
    "library": "Library request",
    "academic": "Academic query",
    "certificate": "Administrative/certificate request",
    "hostel": "Hostel issue",
    "transport": "Transport issue",
}

_BUILDING_RE = re.compile(r"\b(block\s+[a-z0-9]+|[a-z]{1,10}\s+block|[a-z]+\s+hostel|hostel\s+[a-z0-9]+)\b", re.I)
_ROOM_RE = re.compile(r"\b(lab\s*-?\s*\d+|room\s*[a-z]?-?\d+|[a-z]-?\d{3})\b", re.I)


@dataclass
class AnalysisResult:
    category: Category
    subcategory: str | None
    priority: Priority
    department: str
    location: dict
    summary: str
    confidence: float
    reason: list[str] = field(default_factory=list)
    source: str = "rules"  # internal: "ai" | "rules"
    priority_reason: list[str] = field(default_factory=list)

    def public(self) -> dict:
        return {
            "category": self.category,
            "subcategory": self.subcategory,
            "priority": self.priority,
            "department": self.department,
            "location": self.location,
            "summary": self.summary,
            "confidence": self.confidence,
            "reason": self.reason,
        }


# ---------------------------------------------------------------- rule engine
def classify_rules(text: str) -> tuple[Category, str | None, float, list[str]]:
    cat_scores: dict[Category, int] = {}
    sub_scores: dict[tuple[Category, str], int] = {}
    hits: dict[Category, list[str]] = {}
    for cat, sub, pats in _COMPILED:
        for p in pats:
            m = p.search(text)
            if m:
                cat_scores[cat] = cat_scores.get(cat, 0) + 1
                sub_scores[(cat, sub)] = sub_scores.get((cat, sub), 0) + 1
                hits.setdefault(cat, []).append(m.group(0).lower())
    if not cat_scores:
        return Category.other, None, 0.3, ["No specific category keywords detected"]
    ranked = sorted(cat_scores.items(), key=lambda kv: kv[1], reverse=True)
    best, best_score = ranked[0]
    second = ranked[1][1] if len(ranked) > 1 else 0
    sub = max((k for k in sub_scores if k[0] == best), key=lambda k: sub_scores[k])[1]
    confidence = min(0.9, 0.5 + 0.12 * best_score)
    if second and best_score - second <= 0:
        confidence -= 0.15
    words = ", ".join(f"'{w}'" for w in dict.fromkeys(hits[best]))
    reason = [f"Keywords {words} indicate {best.value.replace('_', ' ')}"]
    return best, sub, round(max(confidence, 0.35), 2), reason


def extract_location(text: str, given: dict | None) -> dict:
    loc = {"building": None, "floor": None, "room": None, "latitude": None, "longitude": None}
    if given:
        loc.update({k: v for k, v in given.items() if k in loc and v is not None})
    if not loc["building"]:
        m = _BUILDING_RE.search(text)
        if m:
            loc["building"] = " ".join(w.capitalize() if len(w) > 1 else w.upper() for w in m.group(0).split())
    if not loc["room"]:
        m = _ROOM_RE.search(text)
        if m:
            loc["room"] = m.group(0).strip().title()
    return loc


def _summary(description: str, sub: str | None, category: Category, loc: dict) -> str:
    label = SUBJECT_LABELS.get(sub or "", f"{category.value.replace('_', ' ').capitalize()} issue")
    where = ", ".join(str(x) for x in (loc.get("building"), loc.get("room")) if x)
    s = label + (f" in {where}" if where else "")
    if priority_service.DEADLINE.search(description):
        s += " ahead of an upcoming deadline"
    return s + "."


# ---------------------------------------------------------------- AI provider
_PROMPT = """You are the triage engine of a university campus service desk.
Classify the student's report. Respond ONLY with JSON of this exact shape:
{{"category": one of {cats}, "subcategory": short snake_case noun, "priority": one of {prios},
"summary": one sentence (max 25 words), "confidence": number 0..1, "reason": [up to 3 short strings]}}
Report: \"\"\"{text}\"\"\"
Location: {loc}"""


def _call_provider(description: str, location: dict | None) -> dict | None:
    provider = settings.AI_PROVIDER.lower().strip()
    if provider in ("", "none") or not settings.AI_API_KEY:
        return None
    prompt = _PROMPT.format(
        cats=[c.value for c in Category], prios=[p.value for p in Priority],
        text=description[:3000].replace('"""', "'''"), loc=json.dumps(location or {}),
    )
    try:
        with httpx.Client(timeout=settings.AI_TIMEOUT_SECONDS) as client:
            if provider == "gemini":
                model = settings.AI_MODEL or "gemini-2.0-flash"
                r = client.post(
                    f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent",
                    headers={"x-goog-api-key": settings.AI_API_KEY},
                    json={"contents": [{"parts": [{"text": prompt}]}],
                          "generationConfig": {"responseMimeType": "application/json", "temperature": 0.1}},
                )
                r.raise_for_status()
                text = r.json()["candidates"][0]["content"]["parts"][0]["text"]
            elif provider == "openai":
                model = settings.AI_MODEL or "gpt-4o-mini"
                r = client.post(
                    "https://api.openai.com/v1/chat/completions",
                    headers={"Authorization": f"Bearer {settings.AI_API_KEY}"},
                    json={"model": model, "temperature": 0.1, "response_format": {"type": "json_object"},
                          "messages": [{"role": "user", "content": prompt}]},
                )
                r.raise_for_status()
                text = r.json()["choices"][0]["message"]["content"]
            else:
                return None
        data = json.loads(text)
        return data if isinstance(data, dict) else None
    except Exception as exc:  # network errors, quota, bad JSON → fallback
        log.warning("AI provider unavailable, using rule-based fallback: %s", type(exc).__name__)
        return None


def _validate_ai(raw: dict) -> dict | None:
    """Business-rule validation of AI output. Returns None if unusable."""
    try:
        category = Category(str(raw.get("category", "")).strip().lower())
    except ValueError:
        return None
    try:
        prio = Priority(str(raw.get("priority", "")).strip().lower())
    except ValueError:
        prio = None
    sub = re.sub(r"[^a-z0-9_]", "", str(raw.get("subcategory") or "").lower().replace(" ", "_"))[:50] or None
    try:
        conf = max(0.0, min(1.0, float(raw.get("confidence", 0.7))))
    except (TypeError, ValueError):
        conf = 0.7
    reasons = [str(x)[:160] for x in (raw.get("reason") or []) if isinstance(x, (str, int, float))][:3]
    summary = str(raw.get("summary") or "").strip()[:300]
    return {"category": category, "priority": prio, "subcategory": sub, "confidence": round(conf, 2),
            "reason": reasons, "summary": summary}


# ---------------------------------------------------------------- public API
def analyze(db: Session, description: str, location: dict | None = None, *,
            service_default: Priority | None = None, affected_students: int = 1,
            requested_priority: Priority | None = None) -> AnalysisResult:
    loc = extract_location(description, location)
    loc_text = " ".join(str(v) for v in (loc.get("building"), loc.get("room")) if v)

    ai = _validate_ai(raw) if (raw := _call_provider(description, location)) else None
    if ai:
        category, sub, conf = ai["category"], ai["subcategory"], ai["confidence"]
        base_reason, hint, source = ai["reason"], ai["priority"], "ai"
        summary = ai["summary"] or _summary(description, sub, category, loc)
    else:
        category, sub, conf, base_reason = classify_rules(f"{description} {loc_text}")
        hint, source = None, "rules"
        summary = _summary(description, sub, category, loc)

    # Both AI and reporter priorities are only hints; use the stronger one.
    hints = [(p, src) for p, src in ((hint, "AI"), (requested_priority, "Reporter")) if p is not None]
    hint, hint_src = max(hints, key=lambda h: PRIORITY_RANK[h[0]]) if hints else (None, "AI")

    pr = priority_service.calculate(
        description=description, category=category, location_text=loc_text,
        service_default=service_default, affected_students=affected_students, hint=hint, hint_source=hint_src,
    )
    dept = user_repository.department_for_category(db, category, sub)
    reasons = list(dict.fromkeys(base_reason + pr.reason))[:6]
    return AnalysisResult(
        category=category, subcategory=sub, priority=pr.priority,
        department=dept.name if dept else "Administration", location=loc, summary=summary,
        confidence=conf, reason=reasons, source=source, priority_reason=pr.reason,
    )
