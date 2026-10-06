"""Database seeding script for CampusPulse development & hackathon demo.

Creates:
- Departments (IT, Facilities, Academic Affairs, Hostel, Library, Administration)
- Users:
  - 1 Admin: admin@campuspulse.edu / Admin123!
  - 1 Department Head: it.head@campuspulse.edu / Head123! (IT)
  - 1 Facilities Head: facilities.head@campuspulse.edu / Head123! (Facilities)
  - 3 Staff:
    - anil.kumar@campuspulse.edu / Staff123! (IT Support, Block B, Skills: network, wifi)
    - priya.sharma@campuspulse.edu / Staff123! (Hardware/Projectors, CSE Block, Skills: projector, computer)
    - ramesh.patel@campuspulse.edu / Staff123! (Electrician/Facilities, Skills: electrical, plumbing)
  - 5 Students:
    - rahul@example.com / Student123!
    - ananya@example.com / Student123!
    - vikram@example.com / Student123!
    - sneha@example.com / Student123!
    - rohan@example.com / Student123!
  - 1 Auditor: auditor@campuspulse.edu / Auditor123!
- Services catalog with SLA configurations
- Physical campus locations with QR codes (e.g. CSE-BLOCK-F2-LAB2, BLOCK-B-F2-204)
- SLA Rules (Electrical, Lab Equipment, IT Support, Certificates, Furniture)
- Historical completed requests for ETA/Analytics
- Exact Demo Scenario:
  - Multiple students reporting WiFi/Internet failure in Block B
  - Pre-linked to Incident INC-2026-0001 (WiFi outage - Block B)
- Notifications & Feedback
"""
from datetime import datetime, timedelta, timezone
from sqlalchemy.orm import Session

from app.core.database import Base, SessionLocal, engine
from app.core.security import hash_password
from app.models.audit_log import AuditLog
from app.models.department import Department
from app.models.enums import (
    AssignmentType,
    Category,
    IncidentStatus,
    NotificationType,
    Priority,
    RequestStatus,
    SLAState,
    UserRole,
)
from app.models.feedback import Feedback
from app.models.incident import Incident, IncidentFollower
from app.models.incident_request import IncidentRequest
from app.models.location import Location
from app.models.notification import Notification
from app.models.request import Request
from app.models.request_history import RequestHistory
from app.models.service import Service
from app.models.sla_rule import SLARule
from app.models.user import User


def seed():
    print("Initializing schema...")
    Base.metadata.create_all(bind=engine)
    db: Session = SessionLocal()

    try:
        # Check if already seeded
        if db.query(User).filter_by(email="admin@campuspulse.edu").first():
            print("Database already contains seed data. Skipping.")
            return

        now = datetime.now(timezone.utc).replace(microsecond=0)

        print("Seeding departments...")
        dept_it = Department(id="dept_it", name="IT Support", code="IT", description="Campus IT and Network Services")
        dept_fac = Department(id="dept_fac", name="Facilities", code="FAC", description="Campus Electrical, Plumbing & Maintenance")
        dept_acad = Department(id="dept_acad", name="Academic Affairs", code="ACAD", description="Curriculum and Examination Operations")
        dept_hostel = Department(id="dept_hostel", name="Hostel Administration", code="HOSTEL", description="Student Residences & Dining")
        dept_lib = Department(id="dept_lib", name="Library", code="LIB", description="Central Campus Library Operations")
        dept_admin = Department(id="dept_admin", name="Administration", code="ADMIN", description="General University Administration")
        
        db.add_all([dept_it, dept_fac, dept_acad, dept_hostel, dept_lib, dept_admin])
        db.flush()

        print("Seeding users...")
        pwd_admin = hash_password("Admin123!")
        pwd_head = hash_password("Head123!")
        pwd_staff = hash_password("Staff123!")
        pwd_student = hash_password("Student123!")
        pwd_auditor = hash_password("Auditor123!")

        admin = User(id="usr_admin", name="Dr. Rajesh Admin", email="admin@campuspulse.edu", password_hash=pwd_admin, role=UserRole.admin, department_id=dept_admin.id)
        head_it = User(id="usr_head_it", name="Prof. Suresh Menon", email="it.head@campuspulse.edu", password_hash=pwd_head, role=UserRole.department_head, department_id=dept_it.id)
        head_fac = User(id="usr_head_fac", name="Mr. Arvind Verma", email="facilities.head@campuspulse.edu", password_hash=pwd_head, role=UserRole.department_head, department_id=dept_fac.id)
        
        staff_anil = User(
            id="usr_staff_anil", name="Anil Kumar", email="anil.kumar@campuspulse.edu", password_hash=pwd_staff,
            role=UserRole.staff, department_id=dept_it.id, skills=["network", "wifi", "internet", "lan"],
            home_building="Block B", is_available=True, working_hours_start=9, working_hours_end=18
        )
        staff_priya = User(
            id="usr_staff_priya", name="Priya Sharma", email="priya.sharma@campuspulse.edu", password_hash=pwd_staff,
            role=UserRole.staff, department_id=dept_it.id, skills=["projector", "computer", "lab_equipment", "hardware"],
            home_building="CSE Block", is_available=True, working_hours_start=9, working_hours_end=18
        )
        staff_ramesh = User(
            id="usr_staff_ramesh", name="Ramesh Patel", email="ramesh.patel@campuspulse.edu", password_hash=pwd_staff,
            role=UserRole.staff, department_id=dept_fac.id, skills=["electrical", "power", "plumbing", "water"],
            home_building="Facilities Annex", is_available=True, working_hours_start=8, working_hours_end=17
        )

        student_rahul = User(
            id="usr_rahul", name="Rahul Kumar", first_name="Rahul", last_name="Kumar",
            email="rahul@example.com", password_hash=pwd_student, role=UserRole.student,
            department_id=dept_acad.id, usn="4XX22CS001", course="B.E. Computer Science",
            phone_number="+91 98765 43210"
        )
        student_ananya = User(
            id="usr_ananya", name="Ananya Gupta", first_name="Ananya", last_name="Gupta",
            email="ananya@example.com", password_hash=pwd_student, role=UserRole.student,
            department_id=dept_acad.id, usn="4XX22EC014", course="B.E. Electronics & Communication",
            phone_number="+91 98765 43211"
        )
        student_vikram = User(
            id="usr_vikram", name="Vikram Rao", first_name="Vikram", last_name="Rao",
            email="vikram@example.com", password_hash=pwd_student, role=UserRole.student,
            department_id=dept_acad.id, usn="4XX22ME032", course="B.E. Mechanical Engineering",
            phone_number="+91 98765 43212"
        )
        student_sneha = User(
            id="usr_sneha", name="Sneha Patel", first_name="Sneha", last_name="Patel",
            email="sneha@example.com", password_hash=pwd_student, role=UserRole.student,
            department_id=dept_acad.id, usn="4XX22IS045", course="B.E. Information Science",
            phone_number="+91 98765 43213"
        )
        student_rohan = User(
            id="usr_rohan", name="Rohan Mehta", first_name="Rohan", last_name="Mehta",
            email="rohan@example.com", password_hash=pwd_student, role=UserRole.student,
            department_id=dept_acad.id, usn="4XX22CV019", course="B.E. Civil Engineering",
            phone_number="+91 98765 43214"
        )

        auditor = User(id="usr_auditor", name="Kavita Iyer", email="auditor@campuspulse.edu", password_hash=pwd_auditor, role=UserRole.auditor)

        db.add_all([
            admin, head_it, head_fac, staff_anil, staff_priya, staff_ramesh,
            student_rahul, student_ananya, student_vikram, student_sneha, student_rohan, auditor
        ])
        db.flush()

        print("Seeding locations...")
        loc_cse2 = Location(code="CSE-BLOCK-F2-LAB2", building="CSE Block", floor=2, room="Lab 2", latitude=12.9716, longitude=77.5946)
        loc_b204 = Location(code="BLOCK-B-F2-204", building="Block B", floor=2, room="B204", latitude=12.9722, longitude=77.5952)
        loc_b301 = Location(code="BLOCK-B-F3-301", building="Block B", floor=3, room="B301", latitude=12.9723, longitude=77.5953)
        loc_hostel_mess = Location(code="HOSTEL-A-MESS", building="Hostel Block A", floor=1, room="Mess Hall", latitude=12.9701, longitude=77.5930)
        loc_mech_lh1 = Location(code="MECH-LH1", building="Mechanical Block", floor=1, room="LH-1", latitude=12.9730, longitude=77.5960)
        db.add_all([loc_cse2, loc_b204, loc_b301, loc_hostel_mess, loc_mech_lh1])
        db.flush()

        print("Seeding services...")
        srv_wifi = Service(id="srv_001", name="WiFi & Network Access", description="Report campus wireless and wired network connection failures.", category=Category.it_support, subcategory="network", department_id=dept_it.id, default_priority=Priority.high, sla_hours=4, requires_document=False, active=True)
        srv_projector = Service(id="srv_002", name="Classroom Projector Maintenance", description="Report classroom and lab audio-visual and projector failures.", category=Category.lab_equipment, subcategory="projector", department_id=dept_it.id, default_priority=Priority.medium, sla_hours=8, requires_document=False, active=True)
        srv_electrical = Service(id="srv_003", name="Electrical Maintenance", description="Report lighting, power points, fans, and electrical faults.", category=Category.maintenance, subcategory="electrical", department_id=dept_fac.id, default_priority=Priority.high, sla_hours=2, requires_document=False, active=True)
        srv_plumbing = Service(id="srv_004", name="Plumbing & Water Supply", description="Report leaks, taps, washroom issues, and water cooler faults.", category=Category.maintenance, subcategory="plumbing", department_id=dept_fac.id, default_priority=Priority.medium, sla_hours=6, requires_document=False, active=True)
        srv_cert = Service(id="srv_005", name="Bonafide Certificate Request", description="Apply for bonafide certificates and scholarship verification.", category=Category.administration, subcategory="certificate", department_id=dept_admin.id, default_priority=Priority.low, sla_hours=48, requires_document=True, active=True)
        db.add_all([srv_wifi, srv_projector, srv_electrical, srv_plumbing, srv_cert])
        db.flush()

        print("Seeding SLA rules...")
        sla_elec_crit = SLARule(name="Electrical Safety Emergency", service_id=srv_electrical.id, category=Category.maintenance, priority=Priority.critical, first_response_minutes=15, resolution_minutes=120, working_days_only=False, active=True)
        sla_wifi_high = SLARule(name="Campus Network Outage", service_id=srv_wifi.id, category=Category.it_support, priority=Priority.high, first_response_minutes=30, resolution_minutes=240, working_days_only=False, active=True)
        sla_lab_med = SLARule(name="Lab Equipment Standard", service_id=srv_projector.id, category=Category.lab_equipment, priority=Priority.medium, first_response_minutes=60, resolution_minutes=480, working_days_only=False, active=True)
        sla_admin_norm = SLARule(name="Administrative Certificates", service_id=srv_cert.id, category=Category.administration, priority=Priority.low, first_response_minutes=240, resolution_minutes=2880, working_days_only=True, active=True)
        db.add_all([sla_elec_crit, sla_wifi_high, sla_lab_med, sla_admin_norm])
        db.flush()

        print("Seeding demo incident and requests (Prompt #48: WiFi in Block B)...")
        # Exact demo scenario
        inc_wifi = Incident(
            id="inc_001",
            incident_number="INC-2026-0001",
            title="WiFi outage - Block B",
            description="Widespread WiFi and internet disconnection in Block B floors 2 and 3.",
            status=IncidentStatus.in_progress,
            priority=Priority.high,
            priority_reason=["Multiple students affected", "Service is unavailable"],
            category=Category.it_support,
            subcategory="network",
            department_id=dept_it.id,
            building="Block B",
            floor=2,
            affected_students=3,
            created_at=now - timedelta(hours=2),
            updated_at=now - timedelta(minutes=30),
        )
        db.add(inc_wifi)
        db.flush()

        # Request 1 (Rahul)
        req_101 = Request(
            id="req_101",
            ticket_number="REQ-2026-000101",
            title="WiFi is not working in Block B",
            description="WiFi is not working in Block B. Cannot connect to eduroam or student network.",
            category=Category.it_support,
            subcategory="network",
            priority=Priority.high,
            priority_reason=["Multiple students affected", "Service is unavailable"],
            status=RequestStatus.in_progress,
            student_id=student_rahul.id,
            service_id=srv_wifi.id,
            department_id=dept_it.id,
            assigned_to_id=staff_anil.id,
            assignment_type=AssignmentType.automatic,
            building="Block B",
            floor=2,
            room="B204",
            sla_state=SLAState.normal,
            sla_deadline=now + timedelta(hours=2),
            first_response_deadline=now - timedelta(hours=1, minutes=30),
            first_response_at=now - timedelta(hours=1, minutes=45),
            created_at=now - timedelta(hours=2),
            updated_at=now - timedelta(minutes=45),
        )

        # Request 2 (Ananya)
        req_102 = Request(
            id="req_102",
            ticket_number="REQ-2026-000102",
            title="Internet is down in Block B",
            description="Internet connection is completely down in B Block second floor.",
            category=Category.it_support,
            subcategory="network",
            priority=Priority.high,
            priority_reason=["Multiple students affected", "Service is unavailable"],
            status=RequestStatus.in_progress,
            student_id=student_ananya.id,
            service_id=srv_wifi.id,
            department_id=dept_it.id,
            assigned_to_id=staff_anil.id,
            assignment_type=AssignmentType.automatic,
            building="Block B",
            floor=2,
            room="B204",
            sla_state=SLAState.normal,
            sla_deadline=now + timedelta(hours=2, minutes=15),
            created_at=now - timedelta(hours=1, minutes=45),
            updated_at=now - timedelta(minutes=40),
        )

        # Request 3 (Vikram)
        req_103 = Request(
            id="req_103",
            ticket_number="REQ-2026-000103",
            title="Cannot connect to college WiFi",
            description="Cannot connect to college WiFi in Block B room 301. Signal dropping constantly.",
            category=Category.it_support,
            subcategory="network",
            priority=Priority.high,
            priority_reason=["Multiple students affected", "Service is unavailable"],
            status=RequestStatus.in_progress,
            student_id=student_vikram.id,
            service_id=srv_wifi.id,
            department_id=dept_it.id,
            assigned_to_id=staff_anil.id,
            assignment_type=AssignmentType.automatic,
            building="Block B",
            floor=3,
            room="B301",
            sla_state=SLAState.normal,
            sla_deadline=now + timedelta(hours=2, minutes=30),
            created_at=now - timedelta(hours=1, minutes=30),
            updated_at=now - timedelta(minutes=30),
        )

        db.add_all([req_101, req_102, req_103])
        db.flush()

        # Link to incident INC-2026-0001
        db.add(IncidentRequest(incident_id=inc_wifi.id, request_id=req_101.id, similarity=0.95, linked_by="system"))
        db.add(IncidentRequest(incident_id=inc_wifi.id, request_id=req_102.id, similarity=0.93, linked_by="system"))
        db.add(IncidentRequest(incident_id=inc_wifi.id, request_id=req_103.id, similarity=0.88, linked_by="system"))
        db.add(IncidentFollower(incident_id=inc_wifi.id, user_id=student_rahul.id))
        db.add(IncidentFollower(incident_id=inc_wifi.id, user_id=student_ananya.id))

        # Timelines for req_101
        h1 = RequestHistory(request_id=req_101.id, event_type="REQUEST_CREATED", action="Request created", status="pending", actor_id=student_rahul.id, timestamp=now - timedelta(hours=2))
        h2 = RequestHistory(request_id=req_101.id, event_type="REQUEST_ASSIGNED", action="Request assigned", status="assigned", actor_id=None, comment="Assigned to Anil Kumar (automatic).", timestamp=now - timedelta(hours=1, minutes=50))
        h3 = RequestHistory(request_id=req_101.id, event_type="STATUS_CHANGED", action="Status changed", status="in_progress", actor_id=staff_anil.id, comment="Technician inspected access point B2-AP04.", timestamp=now - timedelta(hours=1, minutes=20))
        h4 = RequestHistory(request_id=req_101.id, event_type="INCIDENT_LINKED", action="Linked to incident", status="in_progress", actor_id=None, comment="Linked to incident INC-2026-0001", timestamp=now - timedelta(hours=1, minutes=15))
        db.add_all([h1, h2, h3, h4])

        # Seeding recurring projector issues in CSE Block Lab 3 for Prompt #39
        print("Seeding recurring issue data (CSE Block Lab 3 Projector)...")
        # Jan (2), Feb (5), Mar (9)
        base_time = now - timedelta(days=90)
        recurring_records = []
        for i in range(16):
            days_ago = 80 - (i * 5)
            r_dt = now - timedelta(days=max(1, days_ago))
            r = Request(
                ticket_number=f"REQ-2026-{200000 + i:06d}",
                title=f"Projector display failure in Lab 3 (#{i+1})",
                description="Projector in CSE Block Lab 3 goes black after 10 minutes of display.",
                category=Category.lab_equipment,
                subcategory="projector",
                priority=Priority.medium,
                priority_reason=["Standard priority for lab equipment requests"],
                status=RequestStatus.completed,
                student_id=student_sneha.id,
                service_id=srv_projector.id,
                department_id=dept_it.id,
                assigned_to_id=staff_priya.id,
                assignment_type=AssignmentType.automatic,
                building="CSE Block",
                floor=2,
                room="Lab 3",
                sla_state=SLAState.normal,
                sla_deadline=r_dt + timedelta(hours=8),
                resolved_at=r_dt + timedelta(hours=4),
                created_at=r_dt,
                updated_at=r_dt + timedelta(hours=4),
            )
            recurring_records.append(r)
        db.add_all(recurring_records)
        db.flush()

        # Add feedback for one completed request
        fb = Feedback(
            request_id=recurring_records[0].id,
            student_id=student_sneha.id,
            rating=5,
            comment="Technician Priya fixed the cable connection swiftly.",
            resolved=True,
            created_at=now - timedelta(days=70),
        )
        db.add(fb)

        # Notifications
        n1 = Notification(
            user_id=student_rahul.id,
            title="Request Updated",
            message="Your request REQ-2026-000101 is now in progress.",
            type=NotificationType.request_update,
            read=False,
            entity_type="request",
            entity_id=req_101.id,
            created_at=now - timedelta(minutes=45),
        )
        n2 = Notification(
            user_id=staff_anil.id,
            title="New Request Assigned",
            message=f"You have been assigned to request {req_101.ticket_number}: {req_101.title}",
            type=NotificationType.assignment,
            read=True,
            entity_type="request",
            entity_id=req_101.id,
            created_at=now - timedelta(hours=1, minutes=50),
        )
        db.add_all([n1, n2])

        db.commit()
        print("Database seeded successfully with all required users, services, demo incidents, and analytics data!")

    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed()
