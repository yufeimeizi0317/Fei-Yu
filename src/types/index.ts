export type AttendanceStatus =
  | 'present'       // 出席
  | 'late'          // 遲到
  | 'absent'        // 曠課/缺席
  | 'sick_leave'    // 病假
  | 'personal_leave'// 事假
  | 'official_leave'// 公假
  | 'bereavement';  // 喪假

export interface Student {
  id: string;
  classId: string;
  seatNumber: number;
  name: string;
  gender: 'male' | 'female';
  studentId: string;
  parentName?: string;
  parentEmail?: string;
  studentEmail?: string;
  parentPhone?: string;
  notes?: string;
  seatRow?: number; // 0-indexed
  seatCol?: number; // 0-indexed
}

export interface Classroom {
  id: string;
  name: string; // e.g. "八年仁班"
  grade: string; // e.g. "國中二年級"
  academicYear: string; // e.g. "114學年度"
  semester: string; // e.g. "第二學期"
  teacherName: string; // e.g. "陳雅筑老師"
  schoolName: string; // e.g. "市立信義國民中學"
  contactPhone: string; // e.g. "02-2345-6789 #205"
  layoutRows: number;
  layoutCols: number;
}

export interface AttendanceRecord {
  id: string;
  classId: string;
  studentId: string;
  date: string; // YYYY-MM-DD
  session: string; // 早自習 | 第一節 | 第二節 | 第三節 | 第四節 | 第五節 | 第六節 | 第七節 | 課後輔導 | 全日總結
  status: AttendanceStatus;
  lateMinutes?: number;
  remark?: string;
  recordedAt: string;
}

export type AssignmentStatus = 'active' | 'reviewing' | 'closed';

export interface Assignment {
  id: string;
  classId: string;
  subject: string; // 國文, 英文, 數學, 自然, 社會, 藝能, 班務...
  title: string;
  dueDate: string; // YYYY-MM-DD
  maxScore: number;
  description: string;
  status: AssignmentStatus;
  createdAt: string;
}

export type SubmissionStatus =
  | 'submitted'        // 已繳交
  | 'missing'          // 未繳交 (缺交)
  | 'late'             // 遲交
  | 'resubmitted'      // 補交
  | 'needs_correction' // 待訂正
  | 'exempt';          // 免繳

export interface AssignmentSubmission {
  id: string;
  assignmentId: string;
  studentId: string;
  status: SubmissionStatus;
  score?: number;
  scoreGrade?: string; // 優、甲上、甲、乙等
  feedback?: string;
  notes?: string;
  submittedAt?: string;
}

export type NotificationType =
  | 'absence_alert'
  | 'homework_reminder'
  | 'weekly_summary'
  | 'custom_notice';

export interface EmailTemplate {
  id: string;
  name: string;
  type: NotificationType;
  subject: string;
  body: string;
  description: string;
}

export interface EmailLog {
  id: string;
  classId: string;
  studentId: string;
  studentName: string;
  seatNumber: number;
  recipientName: string;
  recipientEmail: string;
  subject: string;
  body: string;
  notificationType: NotificationType;
  status: 'sent' | 'queued' | 'failed';
  timestamp: string;
  error?: string;
}

export interface EmailSettings {
  senderName: string;
  senderEmail: string;
  schoolName: string;
  phone: string;
  autoBccSelf: boolean;
  deliveryMode: 'mailto_client' | 'simulated_batch';
}

export type DayOfWeek = 1 | 2 | 3 | 4 | 5; // 1=週一, 2=週二, 3=週三, 4=週四, 5=週五

export interface TimetablePeriod {
  periodNumber: number;
  name: string;
  startTime: string;
  endTime: string;
  isBreak?: boolean;
}

export interface TimetableSlot {
  id: string;
  classId: string;
  dayOfWeek: DayOfWeek;
  periodNumber: number;
  subject: string;
  teacher: string;
  room?: string;
  color?: string;
  note?: string;
}

export type UserRole = 'homeroom_teacher' | 'subject_teacher' | 'admin' | 'class_officer';

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  title: string;
  schoolName: string;
  avatarColor: string;
  assignedClassIds: string[]; // IDs of classes the user has access to, or ['*'] for all
  subject?: string;
  lastLoginAt?: string;
  createdAt: string;
}

// 班級幹部與小老師編制
export type CadreCategory =
  | 'core_admin'
  | 'academic'
  | 'discipline'
  | 'health_service'
  | 'activities'
  | 'subject_assistant';

export interface ClassCadre {
  id: string;
  classId: string;
  roleName: string; // 例如「班長」、「學藝股長」、「風紀股長」、「數學小老師」
  category: CadreCategory;
  studentId?: string; // 指派的學生 ID
  dutyDescription: string; // 職掌說明
  status: 'active' | 'vacant';
  appointedDate?: string;
  notes?: string;
}

// 待辦事項與班級任務
export type TaskPriority = 'urgent' | 'high' | 'normal' | 'low';
export type TaskCategory =
  | 'homeroom'
  | 'academic'
  | 'student_affairs'
  | 'general_affairs'
  | 'activity'
  | 'counseling'
  | 'other';
export type TaskStatus = 'pending' | 'in_progress' | 'completed';

export interface ClassTask {
  id: string;
  classId: string;
  title: string;
  description?: string;
  dueDate: string; // YYYY-MM-DD
  dueTime?: string; // HH:mm
  priority: TaskPriority;
  category: TaskCategory;
  status: TaskStatus;
  assignedCadreRole?: string; // 指派協辦幹部職稱
  assignedStudentId?: string; // 指派特定學生
  completedAt?: string;
  createdAt: string;
  isImportant?: boolean;
}


