import { AttendanceStatus, SubmissionStatus, Student, Assignment, AssignmentSubmission, Classroom } from '../types';

export const ATTENDANCE_STATUS_MAP: Record<AttendanceStatus, { label: string; short: string; color: string; bg: string; text: string; border: string }> = {
  present: {
    label: '出席 (Present)',
    short: '出席',
    color: 'text-emerald-700',
    bg: 'bg-emerald-50 hover:bg-emerald-100',
    text: 'text-emerald-800',
    border: 'border-emerald-200',
  },
  late: {
    label: '遲到 (Late)',
    short: '遲到',
    color: 'text-amber-700',
    bg: 'bg-amber-50 hover:bg-amber-100',
    text: 'text-amber-800',
    border: 'border-amber-200',
  },
  absent: {
    label: '曠課/缺席 (Absent)',
    short: '缺席',
    color: 'text-rose-700',
    bg: 'bg-rose-50 hover:bg-rose-100',
    text: 'text-rose-800',
    border: 'border-rose-300',
  },
  sick_leave: {
    label: '病假 (Sick Leave)',
    short: '病假',
    color: 'text-sky-700',
    bg: 'bg-sky-50 hover:bg-sky-100',
    text: 'text-sky-800',
    border: 'border-sky-200',
  },
  personal_leave: {
    label: '事假 (Personal Leave)',
    short: '事假',
    color: 'text-indigo-700',
    bg: 'bg-indigo-50 hover:bg-indigo-100',
    text: 'text-indigo-800',
    border: 'border-indigo-200',
  },
  official_leave: {
    label: '公假 (Official Leave)',
    short: '公假',
    color: 'text-purple-700',
    bg: 'bg-purple-50 hover:bg-purple-100',
    text: 'text-purple-800',
    border: 'border-purple-200',
  },
  bereavement: {
    label: '喪假 (Bereavement)',
    short: '喪假',
    color: 'text-slate-700',
    bg: 'bg-slate-100 hover:bg-slate-200',
    text: 'text-slate-800',
    border: 'border-slate-300',
  },
};

export const SUBMISSION_STATUS_MAP: Record<SubmissionStatus, { label: string; short: string; color: string; bg: string; text: string; border: string }> = {
  submitted: {
    label: '已繳交',
    short: '已繳',
    color: 'text-emerald-700',
    bg: 'bg-emerald-50 hover:bg-emerald-100',
    text: 'text-emerald-800',
    border: 'border-emerald-200',
  },
  missing: {
    label: '未繳交 (缺交)',
    short: '缺交',
    color: 'text-rose-700',
    bg: 'bg-rose-50 hover:bg-rose-100',
    text: 'text-rose-800',
    border: 'border-rose-300',
  },
  late: {
    label: '遲交',
    short: '遲交',
    color: 'text-amber-700',
    bg: 'bg-amber-50 hover:bg-amber-100',
    text: 'text-amber-800',
    border: 'border-amber-200',
  },
  needs_correction: {
    label: '待訂正',
    short: '待訂正',
    color: 'text-orange-700',
    bg: 'bg-orange-50 hover:bg-orange-100',
    text: 'text-orange-800',
    border: 'border-orange-200',
  },
  resubmitted: {
    label: '補交 (已訂正)',
    short: '補交',
    color: 'text-teal-700',
    bg: 'bg-teal-50 hover:bg-teal-100',
    text: 'text-teal-800',
    border: 'border-teal-200',
  },
  exempt: {
    label: '免繳 / 免補',
    short: '免繳',
    color: 'text-slate-600',
    bg: 'bg-slate-100 hover:bg-slate-200',
    text: 'text-slate-700',
    border: 'border-slate-300',
  },
};

export const SESSIONS_LIST = [
  '早自習',
  '第一節',
  '第二節',
  '第三節',
  '第四節',
  '第五節',
  '第六節',
  '第七節',
  '第八節',
  '課後輔導',
  '全日總結',
];

export const formatDateZh = (dateStr: string): string => {
  try {
    const [y, m, d] = dateStr.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
    const weekday = weekdays[dateObj.getDay()];
    return `${y}年${m}月${d}日 (週${weekday})`;
  } catch {
    return dateStr;
  }
};

export const getTodayString = (): string => {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

/**
 * Export to CSV with UTF-8 BOM so Microsoft Excel on Windows & Mac
 * displays Traditional Chinese characters with 100% fidelity without mojibake.
 */
export const exportToCsv = (filename: string, headers: string[], rows: (string | number)[][]) => {
  const processCell = (val: string | number | undefined | null) => {
    if (val === undefined || val === null) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const csvContent =
    '\uFEFF' + // UTF-8 BOM
    [headers.map(processCell).join(','), ...rows.map((row) => row.map(processCell).join(','))].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Replace placeholders in template with dynamic values
 */
export const renderEmailContent = (
  templateText: string,
  params: {
    studentName: string;
    seatNumber: number;
    className: string;
    date: string;
    statusText: string;
    remarkText?: string;
    missingHomeworkList?: string;
    teacherName: string;
    schoolName: string;
    phone: string;
  }
): string => {
  let result = templateText;
  const now = new Date();
  const timeStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  result = result.replace(/\{學生姓名\}/g, params.studentName);
  result = result.replace(/\{座號\}/g, String(params.seatNumber));
  result = result.replace(/\{班級名稱\}/g, params.className);
  result = result.replace(/\{日期\}/g, params.date);
  result = result.replace(/\{出缺席狀態\}/g, params.statusText);
  result = result.replace(/\{備註說明\}/g, params.remarkText ? `（備註：${params.remarkText}）` : '');
  result = result.replace(/\{缺交作業清單\}/g, params.missingHomeworkList || '（無缺交作業紀錄）');
  result = result.replace(/\{導師姓名\}/g, params.teacherName);
  result = result.replace(/\{學校名稱\}/g, params.schoolName);
  result = result.replace(/\{聯絡電話\}/g, params.phone);
  result = result.replace(/\{發信時間\}/g, timeStr);

  return result;
};

/**
 * Generate standard mailto link
 */
export const createMailtoLink = (to: string, subject: string, body: string, bcc?: string): string => {
  const params = new URLSearchParams();
  if (subject) params.append('subject', subject);
  if (body) params.append('body', body);
  if (bcc) params.append('bcc', bcc);
  return `mailto:${encodeURIComponent(to)}?${params.toString()}`;
};

/**
 * Calculate student missing assignments summary
 */
export const getStudentMissingAssignments = (
  studentId: string,
  assignments: Assignment[],
  submissions: AssignmentSubmission[]
): {
  missingList: { assignment: Assignment; submission: AssignmentSubmission }[];
  formattedSummary: string;
} => {
  const missingList: { assignment: Assignment; submission: AssignmentSubmission }[] = [];

  assignments.forEach((assignment) => {
    const sub = submissions.find(
      (s) => s.assignmentId === assignment.id && s.studentId === studentId
    );

    if (sub && (sub.status === 'missing' || sub.status === 'needs_correction' || sub.status === 'late')) {
      missingList.push({ assignment, submission: sub });
    } else if (!sub) {
      // Not yet recorded, assume missing if past due date
      missingList.push({
        assignment,
        submission: {
          id: `tmp-${assignment.id}-${studentId}`,
          assignmentId: assignment.id,
          studentId,
          status: 'missing',
        },
      });
    }
  });

  const formattedSummary = missingList.length > 0
    ? missingList
        .map((item, idx) => {
          const statusDesc = SUBMISSION_STATUS_MAP[item.submission.status]?.label || '未繳交';
          return `${idx + 1}. [${item.assignment.subject}] ${item.assignment.title} (截止日：${item.assignment.dueDate}) - 狀態：${statusDesc}${item.submission.feedback ? `；備註：${item.submission.feedback}` : ''}`;
        })
        .join('\n')
    : '無任何缺交或待訂正作業，表現優異！';

  return { missingList, formattedSummary };
};

/**
 * Local storage load with default
 */
export const loadStorage = <T>(key: string, defaultValue: T): T => {
  try {
    const saved = localStorage.getItem(`classdesk_${key}`);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error(`Failed to load storage key ${key}:`, e);
  }
  return defaultValue;
};

/**
 * Local storage save
 */
export const saveStorage = <T>(key: string, value: T): void => {
  try {
    localStorage.setItem(`classdesk_${key}`, JSON.stringify(value));
  } catch (e) {
    console.error(`Failed to save storage key ${key}:`, e);
  }
};
