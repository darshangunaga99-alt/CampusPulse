"""Recurring issue detection and preventive maintenance recommendation engine.

Analyzes historical request frequency by:
- Category & subcategory
- Location (building & room)
- Temporal trends across months (increasing, stable, decreasing)

Careful language rule (Prompt #39):
Uses phrasing like 'Possible recurring issue detected in ...' and 'Recommended investigation'.
"""
from collections import defaultdict
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.enums import Category, Priority
from app.models.request import Request
from app.schemas.analytics import MonthlyCount, PreventiveRecommendation, RecurringIssue

PREVENTIVE_TASK_MAP = {
    Category.it_support: {
        "task": "Network Switch & Access Point Inspection",
        "priority": Priority.high,
        "suggested_frequency": "Monthly",
        "reason": "Repeated network connectivity drops in this sector.",
    },
    Category.lab_equipment: {
        "task": "Lab Hardware Diagnostic & Projector Lamp Inspection",
        "priority": Priority.medium,
        "suggested_frequency": "Bi-weekly",
        "reason": "Recurring hardware and peripheral failures reported by students.",
    },
    Category.maintenance: {
        "task": "Plumbing & Electrical Infrastructure Audit",
        "priority": Priority.high,
        "suggested_frequency": "Monthly",
        "reason": "Repeated utility and fixture reports in this building.",
    },
    Category.hostel: {
        "task": "Hostel Facilities & Geyser/Water Tank Maintenance",
        "priority": Priority.medium,
        "suggested_frequency": "Quarterly",
        "reason": "Accumulated residential maintenance requests.",
    },
}


def detect_recurring_issues(db: Session, min_occurrences: int = 2) -> list[RecurringIssue]:
    requests = list(db.scalars(select(Request).order_by(Request.created_at.asc())))

    # Group by (category, subcategory, building, room)
    clusters: dict[tuple, list[Request]] = defaultdict(list)
    for r in requests:
        if not r.building:
            continue
        key = (r.category, r.subcategory, r.building, r.room)
        clusters[key].append(r)

    results: list[RecurringIssue] = []
    for (cat, sub, bldg, room), req_list in clusters.items():
        if len(req_list) < min_occurrences:
            continue

        # Group by month "YYYY-MM"
        month_map: dict[str, int] = defaultdict(int)
        for r in req_list:
            m_str = r.created_at.strftime("%Y-%m")
            month_map[m_str] += 1

        sorted_months = sorted(month_map.keys())
        monthly_counts = [MonthlyCount(month=m, count=month_map[m]) for m in sorted_months]

        # Determine trend
        if len(monthly_counts) >= 2:
            first_half = sum(m.count for m in monthly_counts[: len(monthly_counts) // 2])
            second_half = sum(m.count for m in monthly_counts[len(monthly_counts) // 2 :])
            if second_half > first_half:
                trend = "increasing"
            elif second_half < first_half:
                trend = "decreasing"
            else:
                trend = "stable"
        else:
            trend = "stable"

        place_str = f"{bldg}" + (f" ({room})" if room else "")
        subject_name = sub.replace("_", " ").title() if sub else cat.value.replace("_", " ").title()

        insight = f"Possible recurring {subject_name} issue detected in {place_str}."
        rec = f"Recommended investigation into underlying {subject_name.lower()} components in {place_str}."

        results.append(
            RecurringIssue(
                category=cat,
                subcategory=sub,
                building=bldg,
                room=room,
                total_occurrences=len(req_list),
                monthly_counts=monthly_counts,
                trend=trend,
                insight=insight,
                recommendation=rec,
            )
        )

    results.sort(key=lambda x: x.total_occurrences, reverse=True)
    return results


def generate_preventive_recommendations(db: Session) -> list[PreventiveRecommendation]:
    recurring = detect_recurring_issues(db, min_occurrences=2)
    recommendations: list[PreventiveRecommendation] = []
    seen = set()

    for item in recurring:
        key = (item.category, item.building, item.room)
        if key in seen:
            continue
        seen.add(key)

        preset = PREVENTIVE_TASK_MAP.get(
            item.category,
            {
                "task": f"General {item.category.value.title()} Preventative Check",
                "priority": Priority.medium,
                "suggested_frequency": "Quarterly",
                "reason": f"Recurring requests in {item.building}.",
            },
        )

        task_name = preset["task"]
        if item.subcategory:
            task_name = f"{item.subcategory.replace('_', ' ').title()} - {task_name}"

        recommendations.append(
            PreventiveRecommendation(
                task=task_name,
                category=item.category,
                building=item.building,
                room=item.room,
                priority=preset["priority"],
                suggested_frequency=preset["suggested_frequency"],
                reason=f"{preset['reason']} ({item.total_occurrences} requests recorded, trend is {item.trend}).",
            )
        )

    # If no recurring patterns yet, return standard baseline campus checks
    if not recommendations:
        recommendations = [
            PreventiveRecommendation(
                task="Fire Extinguisher & Safety Inspection",
                category=Category.maintenance,
                building="All Academic Blocks",
                room=None,
                priority=Priority.high,
                suggested_frequency="Monthly",
                reason="Standard campus statutory safety compliance protocol.",
            ),
            PreventiveRecommendation(
                task="Computer Lab PC Diagnostics & Air Flow Check",
                category=Category.lab_equipment,
                building="CSE Block",
                room="Labs 1-4",
                priority=Priority.medium,
                suggested_frequency="Bi-weekly",
                reason="Pre-emptive maintenance before examinations.",
            ),
            PreventiveRecommendation(
                task="Water Cooler & RO Filter Servicing",
                category=Category.maintenance,
                building="Hostel Block A",
                room=None,
                priority=Priority.medium,
                suggested_frequency="Monthly",
                reason="Hygiene maintenance cycle.",
            ),
        ]

    return recommendations
