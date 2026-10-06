import {
  User,
  ServiceItem,
  RequestDetail,
  RequestListItem,
  RequestTimelineItem,
  IncidentItem,
  IncidentDetail,
  AnalyticsDashboard,
  DepartmentAnalytics,
  MapAnalyticsItem,
  NotificationItem,
  LocationDetail,
  AIAnalysisResult,
  DuplicateCheckResult,
} from '../types';

export const mockUsers: Record<string, User> = {
  student: {
    id: 'usr_student_01',
    name: 'Rahul Kumar',
    email: 'rahul.kumar@campus.edu',
    role: 'student',
    department: 'Computer Science',
  },
  staff: {
    id: 'usr_staff_01',
    name: 'Anil Sharma',
    email: 'anil.sharma@campus.edu',
    role: 'staff',
    department: 'IT',
  },
  department_head: {
    id: 'usr_dept_01',
    name: 'Dr. Priya Sundaram',
    email: 'priya.sundaram@campus.edu',
    role: 'department_head',
    department: 'IT Support & Systems',
  },
  admin: {
    id: 'usr_admin_01',
    name: 'Vikram Mehta',
    email: 'admin.operations@campus.edu',
    role: 'admin',
    department: 'Central Campus Operations',
  },
  auditor: {
    id: 'usr_auditor_01',
    name: 'Sneha Patel',
    email: 'sneha.patel@campus.edu',
    role: 'auditor',
    department: 'Quality & Compliance Cell',
  },
};

export const mockServices: ServiceItem[] = [
  {
    id: 'srv_001',
    name: 'Electrical & Power Maintenance',
    description: 'Report power failures, short circuits, switchboards, and fan/light fixtures.',
    category: 'maintenance',
    department: 'Facilities',
    active: true,
  },
  {
    id: 'srv_002',
    name: 'Campus Wi-Fi & LAN Network Support',
    description: 'Issues related to Wi-Fi access points, slow speed, login portal, or Ethernet ports.',
    category: 'it_support',
    department: 'IT',
    active: true,
  },
  {
    id: 'srv_003',
    name: 'Laboratory Equipment & Smart Classroom',
    description: 'Troubleshoot digital projectors, smart podiums, lab computers, oscilloscopes, and instruments.',
    category: 'lab_equipment',
    department: 'IT',
    active: true,
  },
  {
    id: 'srv_004',
    name: 'Hostel Plumbing & Water Infrastructure',
    description: 'Report water supply disruption, tap leaks, geyser issues, and drainage blockage.',
    category: 'hostel',
    department: 'Facilities',
    active: true,
  },
  {
    id: 'srv_005',
    name: 'Central Library Digital Kiosks & RFID',
    description: 'Book return kiosks, digital repository access, RFID barrier scanners.',
    category: 'library',
    department: 'Library Services',
    active: true,
  },
  {
    id: 'srv_006',
    name: 'Campus Shuttle & EV Transport',
    description: 'Shuttle delays, vehicle charging station faults, bus route tracking.',
    category: 'transport',
    department: 'Transport Office',
    active: true,
  },
  {
    id: 'srv_007',
    name: 'Academic Affairs & Grade Portal',
    description: 'ERP portal issues, transcript requests, timetable synchronization.',
    category: 'academic',
    department: 'Academic Office',
    active: true,
  },
  {
    id: 'srv_008',
    name: 'General Administration & Building Security',
    description: 'ID card reader issues, door locks, elevator maintenance, signage.',
    category: 'administration',
    department: 'Administration',
    active: true,
  },
];

export const mockRequests: RequestDetail[] = [
  {
    id: 'req_123',
    ticket_number: 'REQ-2026-000123',
    title: 'Projector failure in CSE Lab 2 before presentation',
    description: 'Projector in CSE Lab 2 is not turning on. The status LED blinks red and we have a graded capstone review scheduled at 2:00 PM today.',
    status: 'in_progress',
    priority: 'high',
    category: 'lab_equipment',
    department: 'IT',
    assigned_to: {
      id: 'usr_staff_01',
      name: 'Anil Sharma',
    },
    location: {
      building: 'CSE Block',
      floor: 2,
      room: 'Lab 2',
      latitude: 12.9716,
      longitude: 77.5946,
    },
    estimated_completion: '2026-10-06T14:30:00Z',
    sla_deadline: '2026-10-06T16:00:00Z',
    created_at: '2026-10-06T09:15:00Z',
    updated_at: '2026-10-06T10:45:00Z',
  },
  {
    id: 'req_124',
    ticket_number: 'REQ-2026-000124',
    title: 'High-voltage spark from Main Distribution Board',
    description: 'Audible sparking and burning smell from electrical panel near Mechanical Workshop B04.',
    status: 'escalated',
    priority: 'critical',
    category: 'maintenance',
    department: 'Facilities',
    assigned_to: {
      id: 'usr_staff_02',
      name: 'Kavita Reddy',
    },
    location: {
      building: 'Mechanical Workshop',
      floor: 1,
      room: 'B04',
      latitude: 12.9725,
      longitude: 77.5960,
    },
    estimated_completion: '2026-10-06T12:00:00Z',
    sla_deadline: '2026-10-06T11:30:00Z',
    created_at: '2026-10-06T08:00:00Z',
    updated_at: '2026-10-06T10:00:00Z',
  },
  {
    id: 'req_125',
    ticket_number: 'REQ-2026-000125',
    title: 'Wi-Fi mesh router dropping packets in Hostel Block C',
    description: 'Students in 3rd floor wing experiencing DNS timeouts and severe packet loss since morning.',
    status: 'assigned',
    priority: 'medium',
    category: 'it_support',
    department: 'IT',
    assigned_to: {
      id: 'usr_staff_01',
      name: 'Anil Sharma',
    },
    location: {
      building: 'Hostel Block C',
      floor: 3,
      room: 'Wing B Corridor',
      latitude: 12.9701,
      longitude: 77.5932,
    },
    estimated_completion: '2026-10-06T18:00:00Z',
    sla_deadline: '2026-10-07T09:00:00Z',
    created_at: '2026-10-06T07:30:00Z',
    updated_at: '2026-10-06T08:15:00Z',
  },
  {
    id: 'req_126',
    ticket_number: 'REQ-2026-000126',
    title: 'Air conditioning water leak over server rack',
    description: 'AC unit in Data Center Room 102 is leaking condensation water onto the secondary networking rack.',
    status: 'in_progress',
    priority: 'critical',
    category: 'maintenance',
    department: 'Facilities',
    assigned_to: {
      id: 'usr_staff_03',
      name: 'Manoj Verma',
    },
    location: {
      building: 'Tech Tower',
      floor: 1,
      room: 'Server Room 102',
      latitude: 12.9738,
      longitude: 77.5951,
    },
    estimated_completion: '2026-10-06T13:00:00Z',
    sla_deadline: '2026-10-06T13:30:00Z',
    created_at: '2026-10-06T09:45:00Z',
    updated_at: '2026-10-06T10:10:00Z',
  },
  {
    id: 'req_127',
    ticket_number: 'REQ-2026-000127',
    title: 'Library RFID return gate scanning error',
    description: 'RFID sensor at Main Entrance fails to mark books as returned, causing false overdue fines.',
    status: 'completed',
    priority: 'medium',
    category: 'library',
    department: 'Library Services',
    assigned_to: {
      id: 'usr_staff_04',
      name: 'Deepak Joshi',
    },
    location: {
      building: 'Central Library',
      floor: 1,
      room: 'Main Turnstile',
      latitude: 12.9710,
      longitude: 77.5955,
    },
    estimated_completion: '2026-10-05T17:00:00Z',
    sla_deadline: '2026-10-06T10:00:00Z',
    created_at: '2026-10-05T11:00:00Z',
    updated_at: '2026-10-05T16:45:00Z',
  },
  {
    id: 'req_128',
    ticket_number: 'REQ-2026-000128',
    title: 'Broken window latch in Biotech Seminar Hall',
    description: 'Left side glass window latch is loose and rattling loudly during rain.',
    status: 'pending',
    priority: 'low',
    category: 'maintenance',
    department: 'Facilities',
    assigned_to: null,
    location: {
      building: 'BioTech Complex',
      floor: 2,
      room: 'Seminar Hall B',
      latitude: 12.9721,
      longitude: 77.5972,
    },
    estimated_completion: null,
    sla_deadline: '2026-10-08T18:00:00Z',
    created_at: '2026-10-06T10:00:00Z',
    updated_at: '2026-10-06T10:00:00Z',
  },
];

export const mockTimelines: Record<string, RequestTimelineItem[]> = {
  req_123: [
    {
      id: 'hist_001',
      action: 'Request submitted',
      status: 'pending',
      actor: { id: 'usr_student_01', name: 'Rahul Kumar' },
      timestamp: '2026-10-06T09:15:00Z',
      comment: 'Initial submission via natural language intake.',
    },
    {
      id: 'hist_002',
      action: 'AI analysis & smart routing completed',
      status: 'pending',
      actor: { id: 'sys_ai', name: 'CampusPulse AI Core' },
      timestamp: '2026-10-06T09:15:05Z',
      comment: 'Categorized as lab_equipment, urgency increased due to same-day capstone presentation.',
    },
    {
      id: 'hist_003',
      action: 'Assigned to IT specialist',
      status: 'assigned',
      actor: { id: 'usr_dept_01', name: 'Dr. Priya Sundaram' },
      timestamp: '2026-10-06T09:30:00Z',
      comment: 'Assigned to Anil Sharma (Specialization: Classroom Hardware).',
    },
    {
      id: 'hist_004',
      action: 'Technician dispatched to CSE Lab 2',
      status: 'in_progress',
      actor: { id: 'usr_staff_01', name: 'Anil Sharma' },
      timestamp: '2026-10-06T10:45:00Z',
      comment: 'Replacing HDMI controller module and lamp assembly on-site.',
    },
  ],
  req_124: [
    {
      id: 'hist_101',
      action: 'Request created',
      status: 'pending',
      actor: { id: 'usr_staff_05', name: 'Lab Assistant' },
      timestamp: '2026-10-06T08:00:00Z',
      comment: 'Urgent electrical hazard reported.',
    },
    {
      id: 'hist_102',
      action: 'Immediate auto-escalation triggered',
      status: 'escalated',
      actor: { id: 'sys_ai', name: 'SLA Safety Engine' },
      timestamp: '2026-10-06T10:00:00Z',
      comment: 'SLA threshold reached for critical safety issue. Escalated to Chief Engineer.',
    },
  ],
};

export const mockIncidents: IncidentDetail[] = [
  {
    id: 'inc_001',
    incident_number: 'INC-2026-0001',
    title: 'Core Switch Fiber Cut & Wi-Fi Outage in Block B & C',
    status: 'in_progress',
    priority: 'high',
    department: 'IT',
    affected_students: 42,
    linked_requests: ['req_101', 'req_102', 'req_103', 'req_125'],
    location: {
      building: 'Hostel Block C',
      floor: 1,
      room: 'Switch Room 101',
      latitude: 12.9701,
      longitude: 77.5932,
    },
    created_at: '2026-10-06T06:30:00Z',
  },
  {
    id: 'inc_002',
    incident_number: 'INC-2026-0002',
    title: 'Main Water Supply Valve Breakdown - South Zone',
    status: 'investigating',
    priority: 'critical',
    department: 'Facilities',
    affected_students: 120,
    linked_requests: ['req_201', 'req_202', 'req_203'],
    location: {
      building: 'Mechanical Workshop',
      floor: 0,
      room: 'Pump House 3',
      latitude: 12.9725,
      longitude: 77.5960,
    },
    created_at: '2026-10-06T08:15:00Z',
  },
  {
    id: 'inc_003',
    incident_number: 'INC-2026-0003',
    title: 'ERP Portal Payment Gateway Downtime',
    status: 'resolved',
    priority: 'medium',
    department: 'Academic Office',
    affected_students: 85,
    linked_requests: ['req_301', 'req_302'],
    location: {
      building: 'Tech Tower',
      floor: 3,
      room: 'Data Center',
      latitude: 12.9738,
      longitude: 77.5951,
    },
    created_at: '2026-10-05T14:00:00Z',
  },
];

export const mockDashboardAnalytics: AnalyticsDashboard = {
  total_requests: 1250,
  pending: 120,
  in_progress: 210,
  completed: 850,
  overdue: 70,
  sla_compliance: 94.2,
  average_resolution_hours: 18.5,
  satisfaction_score: 4.6,
  campus_health_score: 88,
};

export const mockDepartmentAnalytics: DepartmentAnalytics[] = [
  {
    department: 'IT & Network Systems',
    open_requests: 45,
    overdue: 5,
    average_resolution_hours: 10.5,
    sla_compliance: 93.4,
  },
  {
    department: 'Facilities & Electrical',
    open_requests: 38,
    overdue: 8,
    average_resolution_hours: 14.2,
    sla_compliance: 91.8,
  },
  {
    department: 'Hostel Administration',
    open_requests: 26,
    overdue: 3,
    average_resolution_hours: 12.0,
    sla_compliance: 96.0,
  },
  {
    department: 'Academic Office',
    open_requests: 14,
    overdue: 1,
    average_resolution_hours: 8.5,
    sla_compliance: 98.2,
  },
  {
    department: 'Library Services',
    open_requests: 9,
    overdue: 0,
    average_resolution_hours: 6.2,
    sla_compliance: 99.0,
  },
];

export const mockMapAnalytics: MapAnalyticsItem[] = [
  {
    building: 'CSE Block',
    latitude: 12.9716,
    longitude: 77.5946,
    active_requests: 18,
    critical: 2,
    high: 6,
    health_score: 82,
  },
  {
    building: 'Mechanical Workshop',
    latitude: 12.9725,
    longitude: 77.5960,
    active_requests: 12,
    critical: 3,
    high: 4,
    health_score: 71,
  },
  {
    building: 'Tech Tower',
    latitude: 12.9738,
    longitude: 77.5951,
    active_requests: 8,
    critical: 1,
    high: 2,
    health_score: 91,
  },
  {
    building: 'Hostel Block C',
    latitude: 12.9701,
    longitude: 77.5932,
    active_requests: 22,
    critical: 2,
    high: 8,
    health_score: 68,
  },
  {
    building: 'Central Library',
    latitude: 12.9710,
    longitude: 77.5955,
    active_requests: 5,
    critical: 0,
    high: 1,
    health_score: 96,
  },
  {
    building: 'BioTech Complex',
    latitude: 12.9721,
    longitude: 77.5972,
    active_requests: 7,
    critical: 0,
    high: 2,
    health_score: 89,
  },
  {
    building: 'Student Activity Center',
    latitude: 12.9695,
    longitude: 77.5965,
    active_requests: 4,
    critical: 0,
    high: 0,
    health_score: 98,
  },
];

export const mockNotifications: NotificationItem[] = [
  {
    id: 'notif_001',
    title: 'Technician Assigned',
    message: 'Anil Sharma has been assigned to your request REQ-2026-000123 (Projector failure).',
    type: 'assignment',
    read: false,
    created_at: '2026-10-06T09:30:00Z',
  },
  {
    id: 'notif_002',
    title: 'Status Updated: In Progress',
    message: 'Work has begun on REQ-2026-000123 in CSE Block Lab 2.',
    type: 'status_change',
    read: false,
    created_at: '2026-10-06T10:45:00Z',
  },
  {
    id: 'notif_003',
    title: 'SLA Critical Warning',
    message: 'Critical safety ticket REQ-2026-000124 is approaching SLA limit (30 mins remaining).',
    type: 'sla_warning',
    read: true,
    created_at: '2026-10-06T10:00:00Z',
  },
  {
    id: 'notif_004',
    title: 'Campus Incident Alert: Wi-Fi Outage',
    message: 'INC-2026-0001 affecting Hostel Block C is currently under active fiber splicing.',
    type: 'incident_update',
    read: true,
    created_at: '2026-10-06T08:30:00Z',
  },
];

export const mockLocations: Record<string, LocationDetail> = {
  'CSE-BLOCK-F2-LAB2': {
    code: 'CSE-BLOCK-F2-LAB2',
    building: 'CSE Block',
    floor: 2,
    room: 'Lab 2',
    latitude: 12.9716,
    longitude: 77.5946,
  },
  'TECH-TOWER-F1-102': {
    code: 'TECH-TOWER-F1-102',
    building: 'Tech Tower',
    floor: 1,
    room: 'Server Room 102',
    latitude: 12.9738,
    longitude: 77.5951,
  },
  'HOSTEL-C-F3-304': {
    code: 'HOSTEL-C-F3-304',
    building: 'Hostel Block C',
    floor: 3,
    room: 'Room 304',
    latitude: 12.9701,
    longitude: 77.5932,
  },
  'LIB-CENTRAL-F1-DESK': {
    code: 'LIB-CENTRAL-F1-DESK',
    building: 'Central Library',
    floor: 1,
    room: 'Circulation Desk',
    latitude: 12.9710,
    longitude: 77.5955,
  },
};

export const simulateAIAnalysis = (description: string, loc?: Partial<LocationDetail>): AIAnalysisResult => {
  const descLower = description.toLowerCase();
  
  if (descLower.includes('wifi') || descLower.includes('internet') || descLower.includes('network') || descLower.includes('router')) {
    return {
      category: 'it_support',
      subcategory: 'network_connectivity',
      priority: 'high',
      department: 'IT',
      location: {
        building: loc?.building || 'Hostel Block C',
        floor: loc?.floor || 2,
        room: loc?.room || 'Corridor',
        latitude: loc?.latitude || 12.9701,
        longitude: loc?.longitude || 77.5932,
      },
      summary: 'Network connectivity and Wi-Fi outage affecting multiple users.',
      confidence: 0.96,
      reason: [
        'Detected keywords: wifi / network / connectivity',
        'Multiple user impact heuristic triggered',
        'Auto-assigned to IT Infrastructure team',
      ],
    };
  }

  if (descLower.includes('projector') || descLower.includes('display') || descLower.includes('lab') || descLower.includes('computer')) {
    return {
      category: 'lab_equipment',
      subcategory: 'classroom_hardware',
      priority: descLower.includes('exam') || descLower.includes('presentation') || descLower.includes('tomorrow') || descLower.includes('today') ? 'high' : 'medium',
      department: 'IT',
      location: {
        building: loc?.building || 'CSE Block',
        floor: loc?.floor || 2,
        room: loc?.room || 'Lab 2',
        latitude: loc?.latitude || 12.9716,
        longitude: loc?.longitude || 77.5946,
      },
      summary: 'Audio-visual/computer hardware disruption in academic facility.',
      confidence: 0.94,
      reason: [
        'Equipment failure pattern recognized in academic lab space',
        'High urgency multiplier applied due to scheduled class/presentation timeline',
      ],
    };
  }

  if (descLower.includes('spark') || descLower.includes('fire') || descLower.includes('leak') || descLower.includes('wire') || descLower.includes('power')) {
    return {
      category: 'maintenance',
      subcategory: 'electrical_safety',
      priority: 'critical',
      department: 'Facilities',
      location: {
        building: loc?.building || 'Mechanical Workshop',
        floor: loc?.floor || 1,
        room: loc?.room || 'Panel Room',
        latitude: loc?.latitude || 12.9725,
        longitude: loc?.longitude || 77.5960,
      },
      summary: 'Critical electrical hazard requiring immediate facility safety dispatch.',
      confidence: 0.98,
      reason: [
        'Hazardous electrical anomaly detected',
        'Safety impact threshold exceeded → critical priority assigned',
      ],
    };
  }

  return {
    category: 'maintenance',
    subcategory: 'general_facility',
    priority: 'medium',
    department: 'Facilities',
    location: {
      building: loc?.building || 'Main Administration Block',
      floor: loc?.floor || 1,
      room: loc?.room || 'General Area',
      latitude: loc?.latitude || 12.9716,
      longitude: 77.5946,
    },
    summary: description.slice(0, 80) + '...',
    confidence: 0.88,
    reason: [
      'Standard operational service request matched',
      'Assigned standard 24h SLA window',
    ],
  };
};

export const simulateDuplicateCheck = (description: string): DuplicateCheckResult => {
  const descLower = description.toLowerCase();
  
  if (descLower.includes('wifi') || descLower.includes('internet') || descLower.includes('network') || descLower.includes('block b') || descLower.includes('block c')) {
    return {
      duplicate_found: true,
      confidence: 0.93,
      matching_requests: [
        {
          id: 'req_125',
          ticket_number: 'REQ-2026-000125',
          title: 'Wi-Fi mesh router dropping packets in Hostel Block C',
          status: 'assigned',
          created_at: '2026-10-06T07:30:00Z',
        },
        {
          id: 'req_101',
          ticket_number: 'REQ-2026-000101',
          title: 'Internet not working in corridor',
          status: 'in_progress',
          created_at: '2026-10-06T06:15:00Z',
        },
      ],
      incident: {
        id: 'inc_001',
        incident_number: 'INC-2026-0001',
        title: 'Core Switch Fiber Cut & Wi-Fi Outage in Block B & C',
        affected_students: 42,
      },
    };
  }

  return {
    duplicate_found: false,
    confidence: 0.12,
    matching_requests: [],
    incident: null,
  };
};
