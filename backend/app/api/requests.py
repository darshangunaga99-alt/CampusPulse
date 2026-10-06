"""Core Request Management routes.

POST  /requests/upload
POST  /requests/analyze
POST  /requests/check-duplicates
POST  /requests
GET   /requests/my
GET   /requests/{request_id}
GET   /requests/{request_id}/timeline
PATCH /requests/{request_id}/status
POST  /requests/{request_id}/assign
POST  /requests/{request_id}/feedback
"""
import os
import re
import uuid
from fastapi import APIRouter, Depends, File, Query, UploadFile, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import get_db
from app.core.dependencies import get_current_user, rate_limit, require_roles
from app.core.exceptions import BadRequestError, ForbiddenError, NotFoundError
from app.models.attachment import Attachment
from app.models.enums import AttachmentType, Category, Priority, RequestStatus, SLAState, UserRole
from app.models.feedback import Feedback
from app.models.location import Location
from app.models.request import Request
from app.models.service import Service
from app.models.user import User
from app.repositories import incident_repository, request_repository, user_repository
from app.schemas.common import ApiResponse, ERROR_RESPONSES, LocationIn, LocationOut, Paginated, UserRef, make_pagination, ok
from app.schemas.feedback import FeedbackOut, FeedbackRequest
from app.schemas.request import (
    AnalyzeRequest,
    AnalyzeResult,
    AssignRequest,
    AssignResult,
    AttachmentIn,
    AttachmentOut,
    CheckDuplicatesRequest,
    CreateRequest,
    CreateRequestResult,
    DuplicateCheckResult,
    IncidentRef,
    RequestDetail,
    RequestListItem,
    SortOption,
    StatusUpdateRequest,
    StatusUpdateResult,
    TimelineItem,
)
from app.services import (
    ai_service,
    assignment_service,
    audit_service,
    duplicate_service,
    history_service,
    incident_service,
    notification_service,
    sla_service,
)
from app.utils.time import utcnow

router = APIRouter(prefix="/requests", tags=["Requests"], responses=ERROR_RESPONSES)

ALLOWED_TRANSITIONS: dict[RequestStatus, set[RequestStatus]] = {
    RequestStatus.pending: {RequestStatus.assigned, RequestStatus.in_progress, RequestStatus.rejected, RequestStatus.cancelled},
    RequestStatus.assigned: {RequestStatus.in_progress, RequestStatus.pending, RequestStatus.cancelled, RequestStatus.rejected},
    RequestStatus.in_progress: {RequestStatus.completed, RequestStatus.assigned, RequestStatus.escalated, RequestStatus.cancelled, RequestStatus.rejected},
    RequestStatus.escalated: {RequestStatus.in_progress, RequestStatus.completed, RequestStatus.assigned},
    RequestStatus.completed: {RequestStatus.in_progress},  # reopened via negative feedback
    RequestStatus.rejected: set(),
    RequestStatus.cancelled: set(),
}


@router.post(
    "/upload",
    response_model=ApiResponse[AttachmentIn],
    summary="Upload image or evidence attachment",
)
async def upload_attachment(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
):
    if not file or not file.filename:
        raise BadRequestError("FILE_REQUIRED", "Please select a file to upload.")

    filename = file.filename.strip()
    ext = ("." + filename.rsplit(".", 1)[-1].lower()) if "." in filename else ""
    allowed_image_exts = {".jpg", ".jpeg", ".png", ".webp", ".gif", ".heic"}
    if ext not in allowed_image_exts:
        raise BadRequestError("INVALID_FILE_TYPE", "Please upload a JPG, PNG, or WEBP image.")

    contents = await file.read()
    size_bytes = len(contents)
    max_size_bytes = settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024
    if size_bytes > max_size_bytes:
        raise BadRequestError("FILE_TOO_LARGE", f"Image must be smaller than {settings.MAX_UPLOAD_SIZE_MB} MB.")
    if size_bytes == 0:
        raise BadRequestError("EMPTY_FILE", "The uploaded file is empty.")

    safe_name = re.sub(r"[^a-zA-Z0-9._-]", "_", os.path.basename(filename))
    stored_name = f"{uuid.uuid4().hex}_{safe_name}"
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    file_path = os.path.join(settings.UPLOAD_DIR, stored_name)

    with open(file_path, "wb") as f:
        f.write(contents)

    content_type = file.content_type or (f"image/{ext.lstrip('.')}" if ext else "application/octet-stream")

    return ok(
        AttachmentIn(
            url=f"/uploads/{stored_name}",
            type=AttachmentType.image,
            filename=filename,
            content_type=content_type,
            size_bytes=size_bytes,
        )
    )


@router.post(
    "/analyze",
    response_model=ApiResponse[AnalyzeResult],
    dependencies=[Depends(rate_limit("ai", "RATE_LIMIT_AI_PER_MINUTE"))],
)
def analyze_request(body: AnalyzeRequest, db: Session = Depends(get_db)):
    loc_dict = body.location.model_dump() if body.location else None
    result = ai_service.analyze(db, description=body.description, location=loc_dict)
    return ok(result.public())


@router.post(
    "/check-duplicates",
    response_model=ApiResponse[DuplicateCheckResult],
)
def check_duplicate_requests(body: CheckDuplicatesRequest, db: Session = Depends(get_db)):
    loc_dict = body.location.model_dump() if body.location else None
    res = duplicate_service.check_duplicates(
        db,
        description=body.description,
        category=body.category,
        location=loc_dict,
    )
    return ok(res)


@router.post(
    "",
    response_model=ApiResponse[CreateRequestResult],
    status_code=status.HTTP_201_CREATED,
)
def create_request(
    body: CreateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # 1. Validate service if provided
    service: Service | None = None
    if body.service_id:
        service = db.get(Service, body.service_id)
        if not service:
            raise NotFoundError("SERVICE_NOT_FOUND", f"Service '{body.service_id}' was not found.")

    # 2. Location parsing & QR code fallback
    loc_in = body.location.model_dump() if body.location else {}
    if body.location_code and not loc_in.get("building"):
        loc_record = db.scalar(select(Location).where(Location.code == body.location_code.strip()))
        if loc_record:
            loc_in["building"] = loc_record.building
            loc_in["floor"] = loc_record.floor
            loc_in["room"] = loc_record.room
            loc_in["latitude"] = loc_record.latitude
            loc_in["longitude"] = loc_record.longitude

    # 3. AI analysis + priority calculation + department routing
    analysis = ai_service.analyze(
        db,
        description=f"{body.title}. {body.description}",
        location=loc_in,
        service_default=service.default_priority if service else None,
        requested_priority=body.priority,
    )

    final_category = body.category or (service.category if service else analysis.category)
    final_priority = analysis.priority
    dept = user_repository.department_for_category(db, final_category, analysis.subcategory)
    if not dept:
        dept = user_repository.find_department(db, "Administration")

    # 4. Sequential ticket number (REQ-YYYY-NNNNNN)
    year = utcnow().year
    ticket_num = request_repository.next_ticket_number(db, year)

    # 5. SLA deadlines
    now = utcnow()
    first_resp, sla_deadline = sla_service.calculate_sla_deadlines(
        db,
        start_time=now,
        service_id=service.id if service else None,
        category=final_category,
        priority=final_priority,
    )

    req = Request(
        ticket_number=ticket_num,
        title=body.title.strip(),
        description=body.description.strip(),
        category=final_category,
        subcategory=analysis.subcategory,
        priority=final_priority,
        priority_reason=analysis.priority_reason,
        status=RequestStatus.pending,
        student_id=current_user.id,
        service_id=service.id if service else None,
        department_id=dept.id,
        building=analysis.location.get("building") or loc_in.get("building"),
        floor=analysis.location.get("floor") if analysis.location.get("floor") is not None else loc_in.get("floor"),
        room=analysis.location.get("room") or loc_in.get("room"),
        latitude=loc_in.get("latitude"),
        longitude=loc_in.get("longitude"),
        location_code=body.location_code,
        ai_summary=analysis.summary,
        ai_confidence=analysis.confidence,
        first_response_deadline=first_resp,
        sla_deadline=sla_deadline,
        sla_state=SLAState.normal,
    )
    db.add(req)
    db.flush()

    # 5.5 Attachments
    if body.attachments:
        for att_in in body.attachments:
            att = Attachment(
                request_id=req.id,
                url=att_in.url,
                type=att_in.type,
                filename=att_in.filename,
                content_type=att_in.content_type,
                size_bytes=att_in.size_bytes,
                uploaded_by=current_user.id,
            )
            db.add(att)
        db.flush()

    # Timeline & audit log
    history_service.record(db, req, "REQUEST_CREATED", actor_id=current_user.id)
    history_service.record(db, req, "AI_ANALYZED", comment=analysis.summary)
    history_service.record(
        db,
        req,
        "PRIORITY_CALCULATED",
        comment=f"Priority set to {final_priority.value}: {'; '.join(analysis.priority_reason)}",
    )
    audit_service.log(db, "REQUEST_CREATED", "request", req.id, actor_id=current_user.id)

    # 6. Check duplicate and link/create Incident if clustering criteria met
    dup_result = duplicate_service.check_duplicates(
        db,
        description=f"{req.title} {req.description}",
        category=req.category,
        location={"building": req.building, "room": req.room},
        exclude_request_id=req.id,
    )

    matched_incident = None
    if dup_result.duplicate_found and dup_result.matching_requests:
        cand_reqs = [
            request_repository.get_request(db, m.id)
            for m in dup_result.matching_requests
        ]
        valid_cands = [cr for cr in cand_reqs if cr]
        matched_incident = incident_service.create_or_link_incident(
            db,
            request=req,
            matched_requests=valid_cands,
            similarity_score=dup_result.confidence,
        )

    # 7. Automated Smart Assignment
    assigned_user = None
    try:
        _, assigned_user, _ = assignment_service.assign_request(db, request=req, staff_id=None, actor=None)
    except Exception:
        # If no staff available immediately, leave as pending in department queue
        pass

    db.commit()

    inc_ref = None
    if matched_incident:
        inc_ref = IncidentRef(
            id=matched_incident.id,
            incident_number=matched_incident.incident_number,
            title=matched_incident.title,
            affected_students=matched_incident.affected_students,
        )

    return ok(
        CreateRequestResult(
            id=req.id,
            ticket_number=req.ticket_number,
            status=req.status,
            priority=req.priority,
            category=req.category,
            department=dept.name,
            created_at=req.created_at,
            sla_deadline=req.sla_deadline,
            priority_reason=req.priority_reason,
            assigned_to=UserRef.model_validate(assigned_user) if assigned_user else None,
            sla_state=req.sla_state,
            incident=inc_ref,
        )
    )


@router.get(
    "/my",
    response_model=ApiResponse[Paginated[RequestListItem]],
)
def get_my_requests(
    status: RequestStatus | None = Query(default=None),
    category: Category | None = Query(default=None),
    priority: Priority | None = Query(default=None),
    search: str | None = Query(default=None),
    sort: SortOption = Query(default="created_at_desc"),
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    stmt = select(Request).where(Request.student_id == current_user.id)
    stmt = request_repository.apply_filters(
        stmt,
        status=status,
        category=category,
        priority=priority,
        search=search,
    )

    items, total = request_repository.paginate(db, stmt, sort=sort, page=page, limit=limit)

    out_items = [
        RequestListItem(
            id=r.id,
            ticket_number=r.ticket_number,
            title=r.title,
            status=r.status,
            priority=r.priority,
            category=r.category,
            department=r.department.name if r.department else "",
            assigned_to=UserRef.model_validate(r.assigned_to) if r.assigned_to else None,
            location=LocationOut(
                building=r.building,
                floor=r.floor,
                room=r.room,
                latitude=r.latitude,
                longitude=r.longitude,
            ),
            sla_deadline=r.sla_deadline,
            sla_state=r.sla_state,
            created_at=r.created_at,
            updated_at=r.updated_at,
        )
        for r in items
    ]

    return ok(
        Paginated[RequestListItem](
            items=out_items,
            pagination=make_pagination(page=page, limit=limit, total=total),
        )
    )


@router.get(
    "/{request_id}",
    response_model=ApiResponse[RequestDetail],
)
def get_request_detail(
    request_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    req = request_repository.get_request(db, request_id)
    if not req:
        raise NotFoundError("REQUEST_NOT_FOUND", f"Request '{request_id}' was not found.")

    # Authorization check:
    # Student can only view their own requests.
    # Staff can view assigned or within their department.
    # Department Head can view requests in their department.
    # Admin / Auditor can view all.
    if current_user.role == UserRole.student and req.student_id != current_user.id:
        raise ForbiddenError("You are not authorized to view this request.")
    elif current_user.role == UserRole.staff:
        if req.assigned_to_id != current_user.id and req.department_id != current_user.department_id:
            raise ForbiddenError("You are not authorized to view requests outside your department.")
    elif current_user.role == UserRole.department_head:
        if req.department_id != current_user.department_id:
            raise ForbiddenError("You are not authorized to view requests outside your department.")

    # Calculate real-time SLA state and ETA
    sla_service.evaluate_request_sla(db, req)
    eta = sla_service.calculate_estimated_completion(db, req)

    inc = incident_repository.incident_for_request(db, req.id)
    inc_ref = (
        IncidentRef(
            id=inc.id,
            incident_number=inc.incident_number,
            title=inc.title,
            affected_students=inc.affected_students,
        )
        if inc
        else None
    )

    return ok(
        RequestDetail(
            id=req.id,
            ticket_number=req.ticket_number,
            title=req.title,
            description=req.description,
            status=req.status,
            priority=req.priority,
            category=req.category,
            department=req.department.name if req.department else "",
            assigned_to=UserRef.model_validate(req.assigned_to) if req.assigned_to else None,
            location=LocationOut(
                building=req.building,
                floor=req.floor,
                room=req.room,
                latitude=req.latitude,
                longitude=req.longitude,
            ),
            estimated_completion=eta,
            sla_deadline=req.sla_deadline,
            created_at=req.created_at,
            updated_at=req.updated_at,
            subcategory=req.subcategory,
            priority_reason=req.priority_reason,
            sla_state=req.sla_state,
            assignment_type=req.assignment_type,
            service_id=req.service_id,
            student=UserRef.model_validate(req.student),
            incident=inc_ref,
            attachments=[
                AttachmentOut(
                    id=a.id,
                    request_id=a.request_id,
                    url=a.url,
                    type=a.type,
                    filename=a.filename,
                    content_type=a.content_type,
                    size_bytes=a.size_bytes,
                    created_at=a.created_at,
                )
                for a in (req.attachments or [])
            ],
            resolved_at=req.resolved_at,
        )
    )


@router.get(
    "/{request_id}/timeline",
    response_model=ApiResponse[list[TimelineItem]],
)
def get_request_timeline(
    request_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    req = request_repository.get_request(db, request_id)
    if not req:
        raise NotFoundError("REQUEST_NOT_FOUND", f"Request '{request_id}' was not found.")

    if current_user.role == UserRole.student and req.student_id != current_user.id:
        raise ForbiddenError("You are not authorized to view this timeline.")

    events = request_repository.timeline(db, req.id)

    out = [
        TimelineItem(
            id=ev.id,
            action=ev.action,
            status=RequestStatus(ev.status) if ev.status in RequestStatus.__members__.values() else None,
            actor=UserRef(id=ev.actor.id, name=ev.actor.name) if ev.actor else UserRef(id="sys", name="System"),
            timestamp=ev.timestamp,
            comment=ev.comment,
            event_type=ev.event_type,
        )
        for ev in events
    ]
    return ok(out)


@router.patch(
    "/{request_id}/status",
    response_model=ApiResponse[StatusUpdateResult],
)
def update_request_status(
    request_id: str,
    body: StatusUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    req = request_repository.get_request(db, request_id)
    if not req:
        raise NotFoundError("REQUEST_NOT_FOUND", f"Request '{request_id}' was not found.")

    # Permissions
    if current_user.role == UserRole.student:
        # Students can only cancel their own pending/assigned request
        if req.student_id != current_user.id:
            raise ForbiddenError()
        if body.status != RequestStatus.cancelled:
            raise ForbiddenError("Students may only cancel their own requests.")
    elif current_user.role == UserRole.staff:
        if req.assigned_to_id != current_user.id and current_user.department_id != req.department_id:
            raise ForbiddenError("Staff can only update requests assigned to them or their department.")

    # Validate transition
    if body.status != req.status:
        allowed = ALLOWED_TRANSITIONS.get(req.status, set())
        # Admins have overriding power to transition
        if current_user.role != UserRole.admin and body.status not in allowed:
            raise BadRequestError(
                "INVALID_STATUS_TRANSITION",
                f"Cannot transition request status from '{req.status.value}' to '{body.status.value}'.",
            )

    old_status = req.status
    req.status = body.status
    now = utcnow()
    req.updated_at = now

    if body.status == RequestStatus.completed and not req.resolved_at:
        req.resolved_at = now
        history_service.record(db, req, "REQUEST_COMPLETED", actor_id=current_user.id, comment=body.comment)
        notification_service.notify(
            db,
            user_id=req.student_id,
            title="Request Completed",
            message=f"Your request {req.ticket_number} has been resolved. Please provide your feedback.",
            type_=notification_service.NotificationType.completion,
            entity_type="request",
            entity_id=req.id,
        )
    else:
        history_service.record(
            db,
            req,
            "STATUS_CHANGED",
            actor_id=current_user.id,
            comment=body.comment,
            meta={"from": old_status.value, "to": body.status.value},
        )
        notification_service.notify(
            db,
            user_id=req.student_id,
            title="Request Updated",
            message=f"Your request {req.ticket_number} status changed to {body.status.value.replace('_', ' ')}."
            + (f" Comment: {body.comment}" if body.comment else ""),
            type_=notification_service.NotificationType.request_update,
            entity_type="request",
            entity_id=req.id,
        )

    audit_service.log(
        db,
        "STATUS_CHANGED",
        "request",
        req.id,
        actor_id=current_user.id,
        meta={"from": old_status.value, "to": body.status.value},
    )

    db.commit()

    return ok(
        StatusUpdateResult(
            request_id=req.id,
            status=req.status,
            updated_at=req.updated_at,
        )
    )


@router.post(
    "/{request_id}/assign",
    response_model=ApiResponse[AssignResult],
)
def assign_request(
    request_id: str,
    body: AssignRequest,
    current_user: User = Depends(require_roles(UserRole.department_head, UserRole.admin, UserRole.staff)),
    db: Session = Depends(get_db),
):
    req = request_repository.get_request(db, request_id)
    if not req:
        raise NotFoundError("REQUEST_NOT_FOUND", f"Request '{request_id}' was not found.")

    _, assigned_user, a_type = assignment_service.assign_request(
        db,
        request=req,
        staff_id=body.staff_id,
        actor=current_user,
    )
    db.commit()

    return ok(
        AssignResult(
            request_id=req.id,
            assigned_to=UserRef(id=assigned_user.id, name=assigned_user.name),
            assignment_type=a_type,
        )
    )


@router.post(
    "/{request_id}/feedback",
    response_model=ApiResponse[FeedbackOut],
)
def submit_feedback(
    request_id: str,
    body: FeedbackRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    req = request_repository.get_request(db, request_id)
    if not req:
        raise NotFoundError("REQUEST_NOT_FOUND", f"Request '{request_id}' was not found.")

    if req.student_id != current_user.id:
        raise ForbiddenError("Only the student who submitted the request can provide feedback.")

    if req.status != RequestStatus.completed:
        raise BadRequestError("FEEDBACK_NOT_ALLOWED", "Feedback can only be submitted after request completion.")

    fb = Feedback(
        request_id=req.id,
        student_id=current_user.id,
        rating=body.rating,
        comment=body.comment,
        resolved=body.resolved,
    )
    db.add(fb)

    history_service.record(
        db,
        req,
        "FEEDBACK_SUBMITTED",
        actor_id=current_user.id,
        comment=f"Rating: {body.rating}/5. Resolved: {body.resolved}. {body.comment or ''}",
    )

    # Business rule: If student reports issue was NOT resolved, reopen the ticket and flag for review!
    if not body.resolved:
        req.status = RequestStatus.in_progress
        req.reopened_count += 1
        req.flagged = True
        history_service.record(
            db,
            req,
            "REQUEST_REOPENED",
            actor_id=current_user.id,
            comment="Reopened automatically due to student feedback: issue not resolved.",
        )
        if req.assigned_to_id:
            notification_service.notify(
                db,
                user_id=req.assigned_to_id,
                title="Request Reopened",
                message=f"Request {req.ticket_number} was reopened: student indicated it was not resolved.",
                type_=notification_service.NotificationType.request_update,
                entity_type="request",
                entity_id=req.id,
            )

    audit_service.log(
        db,
        "FEEDBACK_SUBMITTED",
        "request",
        req.id,
        actor_id=current_user.id,
        meta={"rating": body.rating, "resolved": body.resolved},
    )

    db.commit()

    return ok(
        FeedbackOut(
            id=fb.id,
            request_id=fb.request_id,
            rating=fb.rating,
            comment=fb.comment,
            resolved=fb.resolved,
            created_at=fb.created_at,
        )
    )
