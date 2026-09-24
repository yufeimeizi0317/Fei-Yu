import React, { useState, useMemo } from 'react';
import { Classroom, Student, Assignment, AssignmentSubmission, SubmissionStatus } from '../types';
import { SUBMISSION_STATUS_MAP, exportToCsv } from '../utils/helpers';
import {
  Plus,
  Search,
  CheckCheck,
  Mail,
  Copy,
  Download,
  BookOpen,
  Filter,
  Check,
  Calendar,
  Layers,
  FileCheck,
} from 'lucide-react';

interface Props {
  classroom: Classroom;
  students: Student[];
  assignments: Assignment[];
  submissions: AssignmentSubmission[];
  onAddAssignment: (assignment: Assignment) => void;
  onUpdateSubmission: (submission: AssignmentSubmission) => void;
  onBatchUpdateSubmissions: (assignmentId: string, status: SubmissionStatus) => void;
  onTriggerEmailForStudents: (studentIds: string[], triggerType: 'homework_reminder') => void;
}

export const HomeworkInventoryView: React.FC<Props> = ({
  classroom,
  students,
  assignments,
  submissions,
  onAddAssignment,
  onUpdateSubmission,
  onBatchUpdateSubmissions,
  onTriggerEmailForStudents,
}) => {
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string>(
    assignments[0]?.id || ''
  );
  const [subjectFilter, setSubjectFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'single' | 'matrix'>('single');
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [copySuccess, setCopySuccess] = useState<boolean>(false);

  // New assignment form state
  const [newSubject, setNewSubject] = useState<string>('國文');
  const [newTitle, setNewTitle] = useState<string>('');
  const [newDueDate, setNewDueDate] = useState<string>('2026-09-24');
  const [newMaxScore, setNewMaxScore] = useState<number>(100);
  const [newDesc, setNewDesc] = useState<string>('');

  const activeAssignment = useMemo(() => {
    return assignments.find((a) => a.id === selectedAssignmentId) || assignments[0];
  }, [assignments, selectedAssignmentId]);

  // Submission map for active assignment
  const currentSubmissionsMap = useMemo(() => {
    const map = new Map<string, AssignmentSubmission>();
    if (!activeAssignment) return map;

    submissions.forEach((sub) => {
      if (sub.assignmentId === activeAssignment.id) {
        map.set(sub.studentId, sub);
      }
    });
    return map;
  }, [activeAssignment, submissions]);

  // Merge students with their submission status for active assignment
  const studentRows = useMemo(() => {
    return students.map((student) => {
      const sub = currentSubmissionsMap.get(student.id);
      const status: SubmissionStatus = sub ? sub.status : 'missing';
      return {
        student,
        submission: sub,
        status,
        score: sub?.score,
        scoreGrade: sub?.scoreGrade,
        feedback: sub?.feedback || '',
        submittedAt: sub?.submittedAt,
      };
    });
  }, [students, currentSubmissionsMap]);

  // Statistics for active assignment
  const stats = useMemo(() => {
    const total = students.length;
    let submittedCount = 0;
    let missingCount = 0;
    let correctionCount = 0;
    let lateCount = 0;
    let exemptCount = 0;

    studentRows.forEach((row) => {
      if (row.status === 'submitted' || row.status === 'resubmitted') submittedCount++;
      else if (row.status === 'missing') missingCount++;
      else if (row.status === 'needs_correction') correctionCount++;
      else if (row.status === 'late') lateCount++;
      else if (row.status === 'exempt') exemptCount++;
    });

    const completionRate =
      total - exemptCount > 0
        ? (((submittedCount + lateCount) / (total - exemptCount)) * 100).toFixed(1)
        : '100.0';

    return {
      total,
      submittedCount,
      missingCount,
      correctionCount,
      lateCount,
      exemptCount,
      completionRate,
    };
  }, [students.length, studentRows]);

  // Handle single student submission change
  const handleStatusChange = (
    student: Student,
    newStatus: SubmissionStatus,
    score?: number,
    feedback?: string
  ) => {
    if (!activeAssignment) return;
    const existing = currentSubmissionsMap.get(student.id);
    const nowStr = new Date().toISOString().replace('T', ' ').slice(0, 16);

    const updated: AssignmentSubmission = {
      id: existing ? existing.id : `sub-${activeAssignment.id}-${student.id}`,
      assignmentId: activeAssignment.id,
      studentId: student.id,
      status: newStatus,
      score: score !== undefined ? score : existing?.score,
      scoreGrade: existing?.scoreGrade,
      feedback: feedback !== undefined ? feedback : existing?.feedback,
      submittedAt: ['submitted', 'late', 'resubmitted'].includes(newStatus)
        ? existing?.submittedAt || nowStr
        : undefined,
    };
    onUpdateSubmission(updated);
  };

  const handleScoreChange = (student: Student, scoreVal: number) => {
    if (!activeAssignment) return;
    const existing = currentSubmissionsMap.get(student.id);
    const currentStatus = existing ? existing.status : 'submitted';
    const updated: AssignmentSubmission = {
      id: existing ? existing.id : `sub-${activeAssignment.id}-${student.id}`,
      assignmentId: activeAssignment.id,
      studentId: student.id,
      status: currentStatus,
      score: scoreVal,
      scoreGrade: existing?.scoreGrade,
      feedback: existing?.feedback,
      submittedAt: existing?.submittedAt || new Date().toISOString().replace('T', ' ').slice(0, 16),
    };
    onUpdateSubmission(updated);
  };

  const handleFeedbackChange = (student: Student, text: string) => {
    if (!activeAssignment) return;
    const existing = currentSubmissionsMap.get(student.id);
    const currentStatus = existing ? existing.status : 'missing';
    const updated: AssignmentSubmission = {
      id: existing ? existing.id : `sub-${activeAssignment.id}-${student.id}`,
      assignmentId: activeAssignment.id,
      studentId: student.id,
      status: currentStatus,
      score: existing?.score,
      scoreGrade: existing?.scoreGrade,
      feedback: text,
      submittedAt: existing?.submittedAt,
    };
    onUpdateSubmission(updated);
  };

  // Missing students
  const missingStudents = useMemo(() => {
    return studentRows.filter(
      (r) => r.status === 'missing' || r.status === 'needs_correction'
    );
  }, [studentRows]);

  // Copy missing list to clipboard
  const handleCopyMissingList = () => {
    if (!activeAssignment) return;
    if (missingStudents.length === 0) {
      alert('太棒了！本項作業目前全班皆已繳交完成，無缺交名單。');
      return;
    }

    const missingLines = missingStudents.map(
      (r) =>
        `#${String(r.student.seatNumber).padStart(2, '0')} ${r.student.name}（${
          SUBMISSION_STATUS_MAP[r.status]?.label
        }${r.feedback ? `：${r.feedback}` : ''}）`
    );

    const textToCopy = `📢 【${classroom.name} 作業催繳通知】\n科目：${activeAssignment.subject}\n作業：${activeAssignment.title}\n截止期限：${activeAssignment.dueDate}\n\n⚠️ 尚未繳交/待訂正名單（共 ${missingStudents.length} 人）：\n${missingLines.join('\n')}\n\n請以上同學把握時間儘速補交或訂正，謝謝！`;

    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2500);
    });
  };

  // Export CSV for active assignment
  const handleExportCsv = () => {
    if (!activeAssignment) return;
    const headers = [
      '班級',
      '科目',
      '作業名稱',
      '截止日期',
      '座號',
      '學號',
      '姓名',
      '繳交狀態',
      '得分',
      '評語/訂正備註',
      '繳交時間',
    ];

    const rows = studentRows.map((r) => [
      classroom.name,
      activeAssignment.subject,
      activeAssignment.title,
      activeAssignment.dueDate,
      r.student.seatNumber,
      r.student.studentId,
      r.student.name,
      SUBMISSION_STATUS_MAP[r.status]?.label || r.status,
      r.score !== undefined ? r.score : '',
      r.feedback,
      r.submittedAt || '',
    ]);

    exportToCsv(`${classroom.name}_${activeAssignment.subject}_${activeAssignment.title}_盤點清單`, headers, rows);
  };

  // Handle Add Assignment
  const handleCreateAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newHw: Assignment = {
      id: `hw-${Date.now()}`,
      classId: classroom.id,
      subject: newSubject,
      title: newTitle.trim(),
      dueDate: newDueDate,
      maxScore: newMaxScore,
      description: newDesc.trim() || '請按時繳交作業。',
      status: 'active',
      createdAt: new Date().toISOString().slice(0, 10),
    };

    onAddAssignment(newHw);
    setSelectedAssignmentId(newHw.id);
    setShowAddModal(false);
    setNewTitle('');
    setNewDesc('');
  };

  // Filtered rows for active assignment view
  const filteredRows = useMemo(() => {
    return studentRows.filter((r) => {
      const matchSearch =
        r.student.name.includes(searchQuery) ||
        String(r.student.seatNumber).includes(searchQuery);

      const matchStatus =
        statusFilter === 'all' ||
        (statusFilter === 'missing' && r.status === 'missing') ||
        (statusFilter === 'needs_correction' && r.status === 'needs_correction') ||
        (statusFilter === 'submitted' &&
          (r.status === 'submitted' || r.status === 'resubmitted')) ||
        (statusFilter === 'incomplete' &&
          ['missing', 'needs_correction', 'late'].includes(r.status));

      return matchSearch && matchStatus;
    });
  }, [studentRows, searchQuery, statusFilter]);

  // Subject pill filter
  const subjects = useMemo(() => {
    const list = Array.from(new Set(assignments.map((a) => a.subject)));
    return ['all', ...list];
  }, [assignments]);

  const filteredAssignments = useMemo(() => {
    if (subjectFilter === 'all') return assignments;
    return assignments.filter((a) => a.subject === subjectFilter);
  }, [assignments, subjectFilter]);

  return (
    <div className="space-y-6">
      {/* Top Controls & View Mode Toggle */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
              <button
                onClick={() => setViewMode('single')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 ${
                  viewMode === 'single'
                    ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>單項作業盤點</span>
              </button>
              <button
                onClick={() => setViewMode('matrix')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 ${
                  viewMode === 'matrix'
                    ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>全班跨科盤點總表</span>
              </button>
            </div>

            {/* Subject Filter */}
            <div className="flex items-center gap-1 overflow-x-auto pl-2">
              {subjects.map((subj) => (
                <button
                  key={subj}
                  onClick={() => setSubjectFilter(subj)}
                  className={`px-2.5 py-1 text-xs rounded-md transition-colors ${
                    subjectFilter === subj
                      ? 'bg-indigo-600 text-white font-semibold'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {subj === 'all' ? '全部學科' : subj}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-2xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>新增作業項目</span>
            </button>
          </div>
        </div>
      </div>

      {viewMode === 'matrix' ? (
        /* ===================== MATRIX OVERVIEW MODE ===================== */
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-slate-900 text-base">全班各科作業繳交盤點總表</h3>
              <p className="text-xs text-slate-500">綜覽全班學生在各科目作業之繳交狀態與缺交統計</p>
            </div>
            <button
              onClick={() => {
                const headers = ['座號', '姓名', ...assignments.map((a) => `[${a.subject}] ${a.title}`)];
                const rows = students.map((s) => {
                  const subCols = assignments.map((a) => {
                    const sub = submissions.find(
                      (sub) => sub.assignmentId === a.id && sub.studentId === s.id
                    );
                    return sub ? SUBMISSION_STATUS_MAP[sub.status]?.label || sub.status : '未繳交';
                  });
                  return [s.seatNumber, s.name, ...subCols];
                });
                exportToCsv(`${classroom.name}_作業盤點總表`, headers, rows);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>匯出總表 CSV</span>
            </button>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-lg">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-semibold text-slate-500">
                  <th className="py-2.5 px-3 w-12 text-center">座號</th>
                  <th className="py-2.5 px-3 w-28">姓名</th>
                  {assignments.map((a) => (
                    <th key={a.id} className="py-2.5 px-3 min-w-[130px] border-l border-slate-200">
                      <div className="text-indigo-600 font-bold">[{a.subject}]</div>
                      <div className="truncate text-slate-700 font-medium" title={a.title}>
                        {a.title}
                      </div>
                      <div className="text-[10px] text-slate-400 font-normal">限 {a.dueDate}</div>
                    </th>
                  ))}
                  <th className="py-2.5 px-3 w-24 text-center border-l border-slate-200">缺交累計</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {students.map((s) => {
                  let missingTally = 0;
                  return (
                    <tr key={s.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-2 px-3 text-center font-mono tabular-nums font-semibold text-slate-600">
                        {String(s.seatNumber).padStart(2, '0')}
                      </td>
                      <td className="py-2 px-3 font-medium text-slate-900">{s.name}</td>
                      {assignments.map((a) => {
                        const sub = submissions.find(
                          (item) => item.assignmentId === a.id && item.studentId === s.id
                        );
                        const status: SubmissionStatus = sub ? sub.status : 'missing';
                        const info = SUBMISSION_STATUS_MAP[status];
                        if (status === 'missing' || status === 'needs_correction') {
                          missingTally++;
                        }

                        return (
                          <td key={a.id} className="py-2 px-3 border-l border-slate-200">
                            <span
                              className={`inline-block px-1.5 py-0.5 rounded text-[11px] font-medium ${info.bg} ${info.text}`}
                            >
                              {info.short}
                              {sub?.score !== undefined ? ` (${sub.score}分)` : ''}
                            </span>
                          </td>
                        );
                      })}
                      <td className="py-2 px-3 text-center border-l border-slate-200 font-mono tabular-nums">
                        {missingTally > 0 ? (
                          <span className="text-rose-600 font-bold bg-rose-50 px-2 py-0.5 rounded-full text-xs">
                            {missingTally} 項
                          </span>
                        ) : (
                          <span className="text-emerald-600 font-medium text-[11px]">全齊</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* ===================== SINGLE ASSIGNMENT INVENTORY ===================== */
        <div className="space-y-6">
          {/* Assignment Selector Carousel / Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
            {filteredAssignments.map((hw) => {
              const isSelected = hw.id === activeAssignment?.id;
              return (
                <button
                  key={hw.id}
                  onClick={() => setSelectedAssignmentId(hw.id)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    isSelected
                      ? 'bg-indigo-50/70 border-indigo-400 shadow-2xs ring-1 ring-indigo-400'
                      : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-semibold text-indigo-700 bg-indigo-100/60 px-1.5 py-0.5 rounded">
                      {hw.subject}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>{hw.dueDate}</span>
                    </span>
                  </div>
                  <div className="font-semibold text-slate-900 text-xs truncate" title={hw.title}>
                    {hw.title}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1 line-clamp-1">
                    {hw.description}
                  </div>
                </button>
              );
            })}
          </div>

          {activeAssignment && (
            <>
              {/* Active Assignment Header Card */}
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-xs font-bold bg-indigo-100 text-indigo-800">
                        {activeAssignment.subject}
                      </span>
                      <h2 className="text-lg font-bold text-slate-900">{activeAssignment.title}</h2>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">{activeAssignment.description}</p>
                    <div className="text-xs text-slate-400 mt-1 flex items-center gap-4">
                      <span>截止期限：{activeAssignment.dueDate}</span>
                      <span>滿分標準：{activeAssignment.maxScore} 分</span>
                    </div>
                  </div>

                  {/* Actions for this assignment */}
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => onBatchUpdateSubmissions(activeAssignment.id, 'submitted')}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors"
                      title="將尚未登錄的學生一鍵標示為已繳交"
                    >
                      <CheckCheck className="w-3.5 h-3.5" />
                      <span>一鍵全員已繳</span>
                    </button>

                    <button
                      onClick={handleCopyMissingList}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg transition-colors"
                      title="複製缺交名單以貼至班級群組或聯絡簿"
                    >
                      {copySuccess ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copySuccess ? '已複製名單！' : '複製缺交文字'}</span>
                    </button>

                    <button
                      onClick={() =>
                        onTriggerEmailForStudents(
                          missingStudents.map((m) => m.student.id),
                          'homework_reminder'
                        )
                      }
                      disabled={missingStudents.length === 0}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                      title="自動彙整本作業缺交學生並寄發催繳信"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      <span>發信催繳 ({missingStudents.length})</span>
                    </button>

                    <button
                      onClick={handleExportCsv}
                      className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg transition-colors"
                      title="匯出本項作業盤點明細"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>匯出</span>
                    </button>
                  </div>
                </div>

                {/* Progress & Stat Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-5 pt-4 border-t border-slate-100">
                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    <div className="text-[11px] text-slate-500 font-medium">繳交完成率</div>
                    <div className="text-xl font-bold text-slate-900 font-mono tabular-nums">
                      {stats.completionRate}%
                    </div>
                  </div>

                  <div className="bg-emerald-50/60 p-2.5 rounded-lg border border-emerald-100">
                    <div className="text-[11px] text-emerald-700 font-medium">已繳交人數</div>
                    <div className="text-xl font-bold text-emerald-700 font-mono tabular-nums">
                      {stats.submittedCount} <span className="text-xs font-normal">人</span>
                    </div>
                  </div>

                  <div className="bg-rose-50/60 p-2.5 rounded-lg border border-rose-200">
                    <div className="text-[11px] text-rose-700 font-medium">缺交待補</div>
                    <div className="text-xl font-bold text-rose-700 font-mono tabular-nums">
                      {stats.missingCount} <span className="text-xs font-normal">人</span>
                    </div>
                  </div>

                  <div className="bg-orange-50/60 p-2.5 rounded-lg border border-orange-200">
                    <div className="text-[11px] text-orange-700 font-medium">待訂正</div>
                    <div className="text-xl font-bold text-orange-700 font-mono tabular-nums">
                      {stats.correctionCount} <span className="text-xs font-normal">人</span>
                    </div>
                  </div>

                  <div className="bg-amber-50/60 p-2.5 rounded-lg border border-amber-200">
                    <div className="text-[11px] text-amber-700 font-medium">遲交人數</div>
                    <div className="text-xl font-bold text-amber-700 font-mono tabular-nums">
                      {stats.lateCount} <span className="text-xs font-normal">人</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Filter and Table */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white rounded-xl border border-slate-200 p-3 shadow-2xs">
                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="搜尋座號或學生姓名..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg w-full sm:w-auto overflow-x-auto">
                  {[
                    { id: 'all', label: '全部名單' },
                    { id: 'incomplete', label: `未齊全 (${stats.missingCount + stats.correctionCount + stats.lateCount})` },
                    { id: 'missing', label: `缺交 (${stats.missingCount})` },
                    { id: 'needs_correction', label: `待訂正 (${stats.correctionCount})` },
                    { id: 'submitted', label: `已繳 (${stats.submittedCount})` },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setStatusFilter(tab.id)}
                      className={`px-3 py-1 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                        statusFilter === tab.id
                          ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Submission Roster Table */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                        <th className="py-3 px-4 w-16 text-center">座號</th>
                        <th className="py-3 px-4 w-32">學生姓名</th>
                        <th className="py-3 px-4 min-w-[290px]">繳交狀態快速切換</th>
                        <th className="py-3 px-4 w-28">分數 (滿分{activeAssignment.maxScore})</th>
                        <th className="py-3 px-4 min-w-[200px]">批改意見 / 訂正要求</th>
                        <th className="py-3 px-4 w-28 text-right">個別催繳</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs">
                      {filteredRows.map(({ student, status, score, feedback, submittedAt }) => {
                        return (
                          <tr
                            key={student.id}
                            className={`hover:bg-slate-50/60 transition-colors ${
                              status === 'missing'
                                ? 'bg-rose-50/20'
                                : status === 'needs_correction'
                                ? 'bg-orange-50/20'
                                : ''
                            }`}
                          >
                            <td className="py-3 px-4 text-center font-mono tabular-nums font-semibold text-slate-700">
                              {String(student.seatNumber).padStart(2, '0')}
                            </td>

                            <td className="py-3 px-4 font-medium text-slate-900">
                              <div>{student.name}</div>
                              <div className="text-[10px] text-slate-400 font-mono">
                                {submittedAt ? `交於 ${submittedAt.slice(5)}` : '尚未繳交'}
                              </div>
                            </td>

                            <td className="py-3 px-4">
                              <div className="flex flex-wrap items-center gap-1">
                                {(
                                  [
                                    'submitted',
                                    'missing',
                                    'needs_correction',
                                    'resubmitted',
                                    'late',
                                    'exempt',
                                  ] as SubmissionStatus[]
                                ).map((stKey) => {
                                  const isSelected = status === stKey;
                                  const info = SUBMISSION_STATUS_MAP[stKey];

                                  return (
                                    <button
                                      key={stKey}
                                      onClick={() => handleStatusChange(student, stKey)}
                                      className={`px-2 py-1 rounded text-xs font-medium transition-all ${
                                        isSelected
                                          ? `${info.bg} ${info.text} ring-1 ring-inset ${info.border} font-bold shadow-2xs`
                                          : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                                      }`}
                                    >
                                      {info.short}
                                    </button>
                                  );
                                })}
                              </div>
                            </td>

                            <td className="py-3 px-4">
                              <div className="flex items-center gap-1">
                                <input
                                  type="number"
                                  min="0"
                                  max={activeAssignment.maxScore}
                                  placeholder="未評"
                                  value={score !== undefined ? score : ''}
                                  onChange={(e) => {
                                    const val = e.target.value === '' ? undefined : Number(e.target.value);
                                    if (val !== undefined) {
                                      handleScoreChange(student, val);
                                    }
                                  }}
                                  className="w-16 px-2 py-1 font-mono text-xs bg-white border border-slate-200 rounded focus:outline-none focus:border-indigo-400"
                                />
                                <span className="text-[11px] text-slate-400">分</span>
                              </div>
                            </td>

                            <td className="py-3 px-4">
                              <input
                                type="text"
                                placeholder="例如：需補寫第30頁、計算過程粗心..."
                                value={feedback}
                                onChange={(e) => handleFeedbackChange(student, e.target.value)}
                                className="w-full px-2 py-1 text-xs bg-white border border-slate-200 rounded focus:outline-none focus:border-indigo-400 placeholder:text-slate-300"
                              />
                            </td>

                            <td className="py-3 px-4 text-right">
                              {status === 'missing' || status === 'needs_correction' ? (
                                <button
                                  onClick={() =>
                                    onTriggerEmailForStudents([student.id], 'homework_reminder')
                                  }
                                  className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded transition-colors"
                                >
                                  <Mail className="w-3 h-3" />
                                  <span>催繳</span>
                                </button>
                              ) : (
                                <span className="text-slate-400 text-[11px]">-</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Modal: Add Assignment */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-2xs p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base">新增班級作業盤點項目</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateAssignment} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">所屬學科</label>
                <select
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  {['國文', '英文', '數學', '自然', '理化', '生物', '社會', '歷史', '地理', '藝能', '輔導', '班務'].map(
                    (s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    )
                  )}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">作業名稱</label>
                <input
                  type="text"
                  required
                  placeholder="例如：第三單元習作 p.45-48"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">繳交截止日</label>
                  <input
                    type="date"
                    required
                    value={newDueDate}
                    onChange={(e) => setNewDueDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">滿分標準</label>
                  <input
                    type="number"
                    min="1"
                    max="1000"
                    value={newMaxScore}
                    onChange={(e) => setNewMaxScore(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">作業說明與要求</label>
                <textarea
                  rows={3}
                  placeholder="說明繳交方式、規格要求或訂正規則..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors font-medium"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors font-medium shadow-xs"
                >
                  建立作業
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
