"""Priority engine.

The final priority is ALWAYS decided here by deterministic business rules. AI or
student-supplied priorities are treated as hints that can raise the result by at
most one level (safety issues are exempt from the cap).

Scoring (points are additive):
    base           service default / category baseline   low=10 medium=30 high=55 critical=80
    safety_risk    fire, smoke, sparks, shock, gas, flood ...   +45
    urgency        "urgent", "emergency", "asap" ...           +15
    deadline       "exam", "tomorrow", "presentation" ...      +15
    outage         "not working / down / outage"               +5
    affected       >=3 students +10, >=10 +25, >=20 +35
    location       exam hall, auditorium, hostel, whole block  +10

Thresholds: >=80 critical, >=55 high, >=30 medium, else low.
"""
import re
from dataclasses import dataclass, field

from app.models.enums import PRIORITY_RANK, Category, Priority

BASE_POINTS = {Priority.low: 10, Priority.medium: 30, Priority.high: 55, Priority.critical: 80}

CATEGORY_BASELINE = {
    Category.it_support: Priority.medium,
    Category.lab_equipment: Priority.medium,
    Category.maintenance: Priority.medium,
    Category.hostel: Priority.medium,
    Category.transport: Priority.medium,
    Category.library: Priority.low,
    Category.academic: Priority.low,
    Category.administration: Priority.low,
    Category.other: Priority.low,
}

SAFETY = re.compile(
    r"\b(fire|smoke|spark|sparks|sparking|shock|electrocut\w*|short circuit|exposed wire\w*|live wire|gas leak|"
    r"gas smell|flood\w*|injur\w*|collaps\w*|burning smell|hazard\w*|unsafe|danger\w*|bleeding|ceiling fell)\b",
    re.I,
)
URGENCY = re.compile(r"\b(urgent\w*|emergency|immediately|asap|right now|critical)\b", re.I)
DEADLINE = re.compile(r"\b(exam\w*|tomorrow|tonight|today|presentation|deadline|viva|submission|placement)\b", re.I)
OUTAGE = re.compile(r"\b(not working|down|outage|no power|no water|cannot connect|can't connect|broken)\b", re.I)
HIGH_IMPACT_PLACE = re.compile(
    r"\b(exam hall|auditorium|hostel|entire|whole (block|building|floor|campus)|all (rooms|labs|students)|"
    r"everyone|server room|main gate)\b",
    re.I,
)


@dataclass
class PriorityResult:
    priority: Priority
    reason: list[str] = field(default_factory=list)
    score: int = 0


def _level(score: int) -> Priority:
    if score >= 80:
        return Priority.critical
    if score >= 55:
        return Priority.high
    if score >= 30:
        return Priority.medium
    return Priority.low


def _bump(p: Priority, levels: int = 1) -> Priority:
    order = [Priority.low, Priority.medium, Priority.high, Priority.critical]
    return order[min(order.index(p) + levels, 3)]


def calculate(
    *,
    description: str,
    category: Category,
    location_text: str = "",
    service_default: Priority | None = None,
    affected_students: int = 1,
    hint: Priority | None = None,
    hint_source: str = "AI",
) -> PriorityResult:
    reasons: list[str] = []
    base = service_default or CATEGORY_BASELINE.get(category, Priority.low)
    score = BASE_POINTS[base]
    text = f"{description} {location_text}"

    safety = bool(SAFETY.search(text))
    if safety:
        score += 45
        reasons.append("Safety-related issue")
    if URGENCY.search(text):
        score += 15
        reasons.append("Urgent language used in the report")
    if DEADLINE.search(text):
        score += 15
        reasons.append("Upcoming academic deadline mentioned")
    if OUTAGE.search(text):
        score += 5
        reasons.append("Service is unavailable")
    if affected_students >= 20:
        score += 35
        reasons.append("Large number of students affected")
    elif affected_students >= 10:
        score += 25
        reasons.append("Many students affected")
    elif affected_students >= 3:
        score += 10
        reasons.append("Multiple students affected")
    if HIGH_IMPACT_PLACE.search(text):
        score += 10
        reasons.append("High-impact location")

    result = _level(score)

    if hint and PRIORITY_RANK[hint] > PRIORITY_RANK[result]:
        capped = hint if safety else min(hint, _bump(result), key=lambda p: PRIORITY_RANK[p])
        if capped != result:
            reasons.append(f"{hint_source} recommended higher priority ({hint.value})")
            result = capped

    if not reasons:
        reasons.append(f"Standard priority for {category.value.replace('_', ' ')} requests")
    return PriorityResult(priority=result, reason=reasons, score=score)
