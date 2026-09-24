import React, { useMemo, useState } from 'react';
import { Classroom, Student, Assignment, AssignmentSubmission, TimetableSlot, DayOfWeek } from '../types';
import {
  CheckCircle2,
  AlertTriangle,
  FileText,
  ArrowRight,
  Send,
  Sparkles,
  Layers,
  ChevronDown,
  ChevronUp,
  Clock,
  BookOpen,
} from 'lucide-react';

interface Props {
  classroom: Classroom;
  students: Student[];
  assignments: Assignment[];
  submissions: AssignmentSubmission[];
  timetableSlots: TimetableSlot[];
  onNavigateToHomework: () => void;
  onTriggerEmailForMissing?: (studentIds: string[]) => void;
}

export const TodayHomeworkProgress: React.FC<Props> = ({
  classroom,
  students,
  assignments,
  submissions,
  timetableSlots,
  onNavigateToHomework,
  onTriggerEmailForMissing,
}) => {
  const [filterMode, setFilterMode] = useState<'today_due' | 'today_courses' | 'all_active'>('today_due');
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);

  // Today's date string (e.g. 2026-09-23)
  const todayStr = useMemo(() => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }, []);

  // Today's Day of Week (1..5)
  const todayDayOfWeek = useMemo(() => {
    const day = new Date().getDay();
    return (day >= 1 && day <= 5 ? day : 3) as DayOfWeek;
  }, []);

  // Today's timetable subjects
  const todaySubjects = useMemo(() => {
    const slots = timetableSlots.filter(
      (s) => s.classId === classroom.id && s.dayOfWeek === todayDayOfWeek
    );
    const set = new Set<string>();
    slots.forEach((s) => {
      if (s.subject) set.add(s.subject);
    });
    return Array.from(set);
  }, [timetableSlots, classroom.id, todayDayOfWeek]);

  // Current classroom assignments
  const classAssignments = useMemo(() => {
    return assignments.filter((a) => a.classId === classroom.id && a.status !== 'closed');
  }, [assignments, classroom.id]);

  // Filtered relevant assignments based on selected mode
  const relevantAssignments = useMemo(() => {
    if (filterMode === 'today_due') {
      const dueToday = classAssignments.filter((a) => a.dueDate === todayStr);
      // Fallback: if no assignment specifically marked due today, show today's courses or latest active
      if (dueToday.length > 0) return dueToday;
    }

    if (filterMode === 'today_courses' || filterMode === 'today_due') {
      const courseAssignments = classAssignments.filter((a) =>
        todaySubjects.some((sub) => a.subject.includes(sub) || sub.includes(a.subject))
      );
      if (courseAssignments.length > 0) return courseAssignments;
    }

    // Default to all active assignments
    return classAssignments.slice(0, 5);
  }, [classAssignments, filterMode, todayStr, todaySubjects]);

  // Aggregate Submission Calculations
  const stats = useMemo(() => {
    const assignmentIds = new Set(relevantAssignments.map((a) => a.id));
    const relSubmissions = submissions.filter((s) => assignmentIds.has(s.assignmentId));

    const totalExpected = relevantAssignments.length * (students.length || 1);
    let submittedCount = 0;
    let missingCount = 0;
    let correctionCount = 0;
    const missingStudentIdSet = new Set<string>();

    relSubmissions.forEach((sub) => {
      if (
        sub.status === 'submitted' ||
        sub.status === 'late' ||
        sub.status === 'resubmitted' ||
        sub.status === 'needs_correction'
      ) {
        submittedCount++;
        if (sub.status === 'needs_correction') {
          correctionCount++;
        }
      } else if (sub.status === 'missing') {
        missingCount++;
        missingStudentIdSet.add(sub.studentId);
      }
    });

    // In case some students don't have records yet, consider difference as missing
    const recordedCount = submittedCount + missingCount;
    if (recordedCount < totalExpected) {
      missingCount += totalExpected - recordedCount;
    }

    const percentage =
      totalExpected > 0 ? Math.round((submittedCount / totalExpected) * 100) : 0;

    return {
      totalExpected,
      submittedCount,
      missingCount,
      correctionCount,
      percentage,
      missingStudentIds: Array.from(missingStudentIdSet),
    };
  }, [relevantAssignments, submissions, students.length]);

  // SVG Circular Progress Ring Parameters
  const radius = 44;
  const strokeWidth = 8;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (stats.percentage / 100) * circumference;

  // Ring Color based on percentage
  const ringColor =
    stats.percentage >= 90
      ? 'text-emerald-500'
      : stats.percentage >= 75
      ? 'text-indigo-600'
      : 'text-amber-500';

  return (
    <div className="mb-6 bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition-shadow overflow-hidden">
      {/* Header bar */}
      <div className="bg-slate-50/90 border-b border-slate-200/80 px-4 py-3 sm:px-5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center shrink-0 shadow-2xs">
            <FileText className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-sm text-slate-900">今日作業繳交進度摘要</span>
              <span className="text-[10px] bg-indigo-100 text-indigo-800 font-semibold px-2 py-0.5 rounded-full">
                {relevantAssignments.length} 項作業監控中
              </span>
            </div>
            <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
              <span>{classroom.name}</span>
              <span>·</span>
              <span>全班學生 {students.length} 人</span>
            </div>
          </div>
        </div>

        {/* Filter mode pill & collapse button */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="hidden sm:flex items-center bg-slate-200/70 p-0.5 rounded-lg text-xs">
            <button
              onClick={() => setFilterMode('today_due')}
              className={`px-2 py-1 rounded-md text-[11px] font-medium transition-colors ${
                filterMode === 'today_due'
                  ? 'bg-white text-indigo-700 font-bold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              今日應交作業
            </button>
            <button
              onClick={() => setFilterMode('today_courses')}
              className={`px-2 py-1 rounded-md text-[11px] font-medium transition-colors ${
                filterMode === 'today_courses'
                  ? 'bg-white text-indigo-700 font-bold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              今日課表科目
            </button>
            <button
              onClick={() => setFilterMode('all_active')}
              className={`px-2 py-1 rounded-md text-[11px] font-medium transition-colors ${
                filterMode === 'all_active'
                  ? 'bg-white text-indigo-700 font-bold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              進行中全部
            </button>
          </div>

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            title={isCollapsed ? '展開作業進度' : '收合作業進度'}
          >
            {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {!isCollapsed && (
        <div className="p-4 sm:p-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
            {/* Left: Circular Progress Ring Display */}
            <div className="md:col-span-4 flex flex-col sm:flex-row md:flex-col items-center justify-center p-4 bg-gradient-to-b from-slate-50/70 to-indigo-50/30 rounded-2xl border border-slate-200/80 gap-4">
              <div className="relative w-32 h-32 flex items-center justify-center shrink-0">
                <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 108 108">
                  {/* Background track circle */}
                  <circle
                    cx="54"
                    cy="54"
                    r={radius}
                    className="text-slate-200/80"
                    strokeWidth={strokeWidth}
                    stroke="currentColor"
                    fill="transparent"
                  />
                  {/* Active progress circle */}
                  <circle
                    cx="54"
                    cy="54"
                    r={radius}
                    className={`${ringColor} transition-all duration-700 ease-out`}
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                  />
                </svg>

                {/* Inner center text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-2xl font-black text-slate-900 tracking-tight">
                    {stats.percentage}%
                  </span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    已繳交比例
                  </span>
                </div>
              </div>

              {/* Text indicator below ring */}
              <div className="text-center sm:text-left md:text-center space-y-1">
                <div className="text-xs font-bold text-slate-800 flex items-center justify-center gap-1">
                  {stats.percentage >= 90 ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700">繳交狀況優異</span>
                    </>
                  ) : stats.percentage >= 75 ? (
                    <>
                      <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                      <span className="text-indigo-700">繳交進度良好</span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                      <span className="text-amber-700">有待加強催繳</span>
                    </>
                  )}
                </div>
                <p className="text-[11px] text-slate-500">
                  應收 {stats.totalExpected} 份 · 實收 {stats.submittedCount} 份
                </p>
              </div>
            </div>

            {/* Right: Detailed Metric Cards & Subject Breakdown */}
            <div className="md:col-span-8 space-y-4">
              {/* 3 Metric Pills */}
              <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
                <div className="p-3 bg-emerald-50/70 border border-emerald-200/80 rounded-xl text-center">
                  <div className="text-[11px] font-medium text-emerald-700">已繳交份數</div>
                  <div className="text-xl sm:text-2xl font-black text-emerald-800 mt-0.5">
                    {stats.submittedCount}
                    <span className="text-xs font-normal text-emerald-600 ml-0.5">份</span>
                  </div>
                  <div className="text-[10px] text-emerald-600 mt-0.5">
                    達標率 {stats.percentage}%
                  </div>
                </div>

                <div className="p-3 bg-rose-50/70 border border-rose-200/80 rounded-xl text-center">
                  <div className="text-[11px] font-medium text-rose-700">未繳交 (缺交)</div>
                  <div className="text-xl sm:text-2xl font-black text-rose-800 mt-0.5">
                    {stats.missingCount}
                    <span className="text-xs font-normal text-rose-600 ml-0.5">人次</span>
                  </div>
                  <div className="text-[10px] text-rose-600 mt-0.5">
                    {stats.missingStudentIds.length} 位學生待繳
                  </div>
                </div>

                <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl text-center">
                  <div className="text-[11px] font-medium text-amber-700">待訂正檢討</div>
                  <div className="text-xl sm:text-2xl font-black text-amber-800 mt-0.5">
                    {stats.correctionCount}
                    <span className="text-xs font-normal text-amber-600 ml-0.5">份</span>
                  </div>
                  <div className="text-[10px] text-amber-600 mt-0.5">需重新提交</div>
                </div>
              </div>

              {/* Assignment Subject Rows */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-500 font-bold px-0.5">
                  <span>當日監控作業細項</span>
                  <span>繳交進度條</span>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {relevantAssignments.map((assignment) => {
                    const subList = submissions.filter((s) => s.assignmentId === assignment.id);
                    const subCount = subList.filter(
                      (s) =>
                        s.status === 'submitted' ||
                        s.status === 'late' ||
                        s.status === 'resubmitted' ||
                        s.status === 'needs_correction'
                    ).length;
                    const total = students.length || 1;
                    const percent = Math.round((subCount / total) * 100);

                    return (
                      <div
                        key={assignment.id}
                        className="p-2.5 bg-slate-50 hover:bg-slate-100/80 rounded-xl border border-slate-200 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="px-2 py-0.5 bg-indigo-100 text-indigo-800 text-[10px] font-bold rounded-md shrink-0">
                            {assignment.subject}
                          </span>
                          <span className="text-xs font-bold text-slate-800 truncate" title={assignment.title}>
                            {assignment.title}
                          </span>
                        </div>

                        <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
                          {/* Mini Progress Bar */}
                          <div className="w-24 bg-slate-200 rounded-full h-2 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                percent >= 90 ? 'bg-emerald-500' : percent >= 75 ? 'bg-indigo-600' : 'bg-amber-500'
                              }`}
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                          <span className="text-xs font-mono font-bold text-slate-700 min-w-[55px] text-right">
                            {subCount}/{total} ({percent}%)
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Bottom Quick Action Bar */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 flex-wrap">
                <div className="text-[11px] text-slate-400">
                  最後更新：{todayStr} 即時同步
                </div>

                <div className="flex items-center gap-2">
                  {onTriggerEmailForMissing && stats.missingStudentIds.length > 0 && (
                    <button
                      onClick={() => onTriggerEmailForMissing(stats.missingStudentIds)}
                      className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5"
                      title="快速填入缺繳名單並發送通知信"
                    >
                      <Send className="w-3.5 h-3.5 text-rose-600" />
                      <span>催繳 {stats.missingStudentIds.length} 位缺交</span>
                    </button>
                  )}

                  <button
                    onClick={onNavigateToHomework}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1 shadow-2xs"
                  >
                    <span>進入作業盤點總表</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
