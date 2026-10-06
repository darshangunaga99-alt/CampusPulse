export type Role = 'student' | 'staff' | 'department_head' | 'admin' | 'auditor';

export type RequestStatus =
  | 'pending'
  | 'assigned'
  | 'in_progress'
  | 'completed'
  | 'rejected'
  | 'cancelled'
  | 'escalated';

export type Priority = 'low' | 'medium' | 'high' | 'critical';

export type Category =
  | 'academic'
  | 'maintenance'
  | 'lab_equipment'
  | 'it_support'
  | 'library'
  | 'administration'
  | 'hostel'
  | 'transport'
  | 'other';

export type IncidentStatus =
  | 'detected'
  | 'investigating'
  | 'confirmed'
  | 'in_progress'
  | 'resolved'
  | 'closed';

export type AssignmentType = 'automatic' | 'manual';

export interface Location {
  building: string;
  floor?: number | null;
  room?: string | null;
  latitude?: number | null;
  longitude?: number | null;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  department?: string;
}

export interface ServiceItem {
  id: string;
  name: string;
  description: string;
  category: Category;
  department: string;
  active: boolean;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}

// AI Analysis
export interface AIAnalysisRequest {
  description: string;
  location?: Partial<Location>;
}

export interface AIAnalysisResult {
  category: Category;
  subcategory?: string;
  priority: Priority;
  department: string;
  location?: Location;
  summary: string;
  confidence: number;
  reason: string[];
}

// Duplicate Checking
export interface DuplicateCheckRequest {
  description: string;
  category?: Category;
  location?: Partial<Location>;
}

export interface DuplicateMatchingRequest {
  id: string;
  ticket_number: string;
  title: string;
  status: RequestStatus;
  created_at: string;
}

export interface DuplicateIncident {
  id: string;
  incident_number: string;
  title: string;
  affected_students: number;
}

export interface DuplicateCheckResult {
  duplicate_found: boolean;
  confidence: number;
  matching_requests: DuplicateMatchingRequest[];
  incident: DuplicateIncident | null;
}

// Request Creation & Details
export interface CreateRequestPayload {
  title: string;
  description: string;
  category: Category;
  priority: Priority;
  location: Location;
  service_id?: string;
}

export interface CreateRequestResponse {
  id: string;
  ticket_number: string;
  status: RequestStatus;
  priority: Priority;
  category: Category;
  department: string;
  created_at: string;
  sla_deadline: string;
}

export interface RequestListItem {
  id: string;
  ticket_number: string;
  title: string;
  status: RequestStatus;
  priority: Priority;
  category: Category;
  created_at: string;
  updated_at: string;
}

export interface RequestDetail {
  id: string;
  ticket_number: string;
  title: string;
  description: string;
  status: RequestStatus;
  priority: Priority;
  category: Category;
  department: string;
  assigned_to?: {
    id: string;
    name: string;
  } | null;
  location: Location;
  estimated_completion?: string | null;
  sla_deadline?: string | null;
  created_at: string;
  updated_at: string;
}

export interface RequestTimelineItem {
  id: string;
  action: string;
  status: RequestStatus;
  actor: {
    id: string;
    name: string;
  };
  timestamp: string;
  comment?: string | null;
}

export interface UpdateStatusPayload {
  status: RequestStatus;
  comment?: string;
}

export interface AssignRequestPayload {
  staff_id: string;
}

// Incidents
export interface IncidentItem {
  id: string;
  incident_number: string;
  title: string;
  status: IncidentStatus;
  priority: Priority;
  affected_students: number;
  department: string;
  created_at: string;
}

export interface IncidentDetail {
  id: string;
  incident_number: string;
  title: string;
  status: IncidentStatus;
  priority: Priority;
  department: string;
  affected_students: number;
  linked_requests: string[];
  location: Location;
  created_at: string;
}

// Analytics
export interface AnalyticsDashboard {
  total_requests: number;
  pending: number;
  in_progress: number;
  completed: number;
  overdue: number;
  sla_compliance: number;
  average_resolution_hours: number;
  satisfaction_score: number;
  campus_health_score: number;
}

export interface DepartmentAnalytics {
  department: string;
  open_requests: number;
  overdue: number;
  average_resolution_hours: number;
  sla_compliance: number;
}

export interface MapAnalyticsItem {
  building: string;
  latitude: number;
  longitude: number;
  active_requests: number;
  critical: number;
  high: number;
  health_score: number;
}

// Feedback
export interface FeedbackPayload {
  rating: number;
  comment: string;
  resolved: boolean;
}

export interface FeedbackResponse {
  id: string;
  request_id: string;
  rating: number;
  comment: string;
  resolved: boolean;
  created_at: string;
}

// Notifications
export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  created_at: string;
}

// Location by QR
export interface LocationDetail {
  code: string;
  building: string;
  floor: number;
  room: string;
  latitude: number;
  longitude: number;
}

// Auth
export interface AuthResponse {
  user: User;
  access_token: string;
  token_type: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  role: Role;
}
