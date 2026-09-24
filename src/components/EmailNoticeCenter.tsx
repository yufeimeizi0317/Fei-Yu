import React, { useState, useMemo, useEffect } from 'react';
import {
  Classroom,
  Student,
  AttendanceRecord,
  Assignment,
  AssignmentSubmission,
  EmailTemplate,
  EmailLog,
  EmailSettings,
  NotificationType,
} from '../types';
import {
  renderEmailContent,
  createMailtoLink,
  getStudentMissingAssignments,
  ATTENDANCE_STATUS_MAP,
  exportToCsv,
} from '../utils/helpers';
import {
  Mail,
  Send,
  CheckCircle2,
  AlertCircle,
  FileText,
  Clock,
  Settings,
  Copy,
  ExternalLink,
  Check,
  RotateCw,
  Eye,
  Sliders,
  Sparkles,
} from 'lucide-react';

interface Props {
  classroom: Classroom;
  students: Student[];
  attendanceRecords: AttendanceRecord[];
  assignments: Assignment[];
  submissions: AssignmentSubmission[];
  templates: EmailTemplate[];
  emailSettings: EmailSettings;
  emailLogs: EmailLog[];
  onUpdateTemplate: (template: EmailTemplate) => void;
  onUpdateEmailSettings: (settings: EmailSettings) => void;
  onAddEmailLog: (log: EmailLog) => void;
  initialSelectedStudentIds?: string[];
  initialTriggerType?: NotificationType;
}

export const EmailNoticeCenter: React.FC<Props> = ({
  classroom,
  students,
  attendanceRecords,
  assignments,
  submissions,
  templates,
  emailSettings,
  emailLogs,
  onUpdateTemplate,
  onUpdateEmailSettings,
  onAddEmailLog,
  initialSelectedStudentIds,
  initialTriggerType,
}) => {
  const [activeTab, setActiveTab] = useState<'dispatcher' | 'templates' | 'logs' | 'settings'>(
    'dispatcher'
  );
  const [selectedTrigger, setSelectedTrigger] = useState<NotificationType>(
    initialTriggerType || 'absence_alert'
  );
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>(
    initialSelectedStudentIds || []
  );
  const [previewStudentId, setPreviewStudentId] = useState<string>(
    students[0]?.id || ''
  );
  const [isDispatching, setIsDispatching] = useState<boolean>(false);
  const [dispatchProgress, setDispatchProgress] = useState<{ current: number; total: number }>({
    current: 0,
    total: 0,
  });
  const [copyStatus, setCopyStatus] = useState<boolean>(false);

  // Template editing state
  const [editingTemplateId, setEditingTemplateId] = useState<string>(templates[0]?.id || '');
  const [tempSubject, setTempSubject] = useState<string>('');
  const [tempBody, setTempBody] = useState<string>('');

  // Selected date for attendance alert
  const [noticeDate, setNoticeDate] = useState<string>('2026-09-23');

  // Sync initial props if updated from other views
  useEffect(() => {
    if (initialSelectedStudentIds && initialSelectedStudentIds.length > 0) {
      setSelectedStudentIds(initialSelectedStudentIds);
      setPreviewStudentId(initialSelectedStudentIds[0]);
    }
    if (initialTriggerType) {
      setSelectedTrigger(initialTriggerType);
    }
  }, [initialSelectedStudentIds, initialTriggerType]);

  // Find corresponding template
  const currentTemplate = useMemo(() => {
    return (
      templates.find((t) => t.type === selectedTrigger) ||
      templates[0] || {
        id: 'fallback',
        name: '一般通知信',
        type: 'custom_notice',
        subject: '【班級通知】{學生姓名} 學習與在校狀況說明',
        body: '親愛的家長您好：\n\n感謝您的關心與配合！',
        description: '',
      }
    );
  }, [templates, selectedTrigger]);

  // Identify eligible students according to trigger
  const eligibleStudentList = useMemo(() => {
    if (selectedTrigger === 'absence_alert') {
      // Find students absent or late on noticeDate
      const recordsForDate = attendanceRecords.filter(
        (r) => r.classId === classroom.id && r.date === noticeDate
      );
      const abnormalIds = new Set(
        recordsForDate
          .filter((r) => r.status !== 'present')
          .map((r) => r.studentId)
      );

      return students.filter((s) => abnormalIds.has(s.id));
    } else if (selectedTrigger === 'homework_reminder') {
      // Find students with at least 1 missing or needs-correction assignment
      return students.filter((s) => {
        const { missingList } = getStudentMissingAssignments(s.id, assignments, submissions);
        return missingList.length > 0;
      });
    } else {
      // All students for weekly or custom
      return students;
    }
  }, [selectedTrigger, attendanceRecords, classroom.id, noticeDate, students, assignments, submissions]);

  // Auto select eligible students when trigger changes (unless already set)
  useEffect(() => {
    if (eligibleStudentList.length > 0) {
      setSelectedStudentIds(eligibleStudentList.map((s) => s.id));
      setPreviewStudentId(eligibleStudentList[0].id);
    } else {
      setSelectedStudentIds([]);
    }
  }, [eligibleStudentList]);

  // Find preview student object
  const previewStudent = useMemo(() => {
    return students.find((s) => s.id === previewStudentId) || eligibleStudentList[0] || students[0];
  }, [students, previewStudentId, eligibleStudentList]);

  // Calculate dynamic content for preview student
  const renderedEmail = useMemo(() => {
    if (!previewStudent || !currentTemplate) {
      return { subject: '', body: '', to: '' };
    }

    const todayAtt = attendanceRecords.find(
      (r) =>
        r.classId === classroom.id &&
        r.studentId === previewStudent.id &&
        r.date === noticeDate
    );
    const statusText = todayAtt
      ? ATTENDANCE_STATUS_MAP[todayAtt.status]?.label || '出席'
      : '出席 (Present)';
    const remarkText = todayAtt?.remark || '';

    const { formattedSummary } = getStudentMissingAssignments(
      previewStudent.id,
      assignments,
      submissions
    );

    const subject = renderEmailContent(currentTemplate.subject, {
      studentName: previewStudent.name,
      seatNumber: previewStudent.seatNumber,
      className: classroom.name,
      date: noticeDate,
      statusText,
      remarkText,
      missingHomeworkList: formattedSummary,
      teacherName: classroom.teacherName,
      schoolName: classroom.schoolName,
      phone: classroom.contactPhone,
    });

    const body = renderEmailContent(currentTemplate.body, {
      studentName: previewStudent.name,
      seatNumber: previewStudent.seatNumber,
      className: classroom.name,
      date: noticeDate,
      statusText,
      remarkText,
      missingHomeworkList: formattedSummary,
      teacherName: classroom.teacherName,
      schoolName: classroom.schoolName,
      phone: classroom.contactPhone,
    });

    return {
      subject,
      body,
      to:
        previewStudent.studentEmail ||
        (previewStudent as any).parentEmail ||
        `${previewStudent.studentId || previewStudent.seatNumber}@school.edu.tw`,
      student: previewStudent,
    };
  }, [previewStudent, currentTemplate, attendanceRecords, classroom, noticeDate, assignments, submissions]);

  // Open native Mail client (mailto:)
  const handleOpenMailClient = (single = false) => {
    const recipientEmail =
      renderedEmail.to || `${previewStudent.studentId || previewStudent.seatNumber}@school.edu.tw`;

    const bcc = emailSettings.autoBccSelf ? emailSettings.senderEmail : undefined;
    const mailtoUrl = createMailtoLink(
      recipientEmail,
      renderedEmail.subject,
      renderedEmail.body,
      bcc
    );

    // Record log
    onAddEmailLog({
      id: `log-${Date.now()}`,
      classId: classroom.id,
      studentId: previewStudent.id,
      studentName: previewStudent.name,
      seatNumber: previewStudent.seatNumber,
      recipientName: previewStudent.name,
      recipientEmail: recipientEmail,
      subject: renderedEmail.subject,
      body: renderedEmail.body,
      notificationType: selectedTrigger,
      status: 'sent',
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
    });

    window.location.href = mailtoUrl;
  };

  // Run simulated batch email dispatch
  const handleBatchDispatch = async () => {
    if (selectedStudentIds.length === 0) {
      alert('請先在左側清單中勾選欲發送的學生！');
      return;
    }

    setIsDispatching(true);
    setDispatchProgress({ current: 0, total: selectedStudentIds.length });

    for (let i = 0; i < selectedStudentIds.length; i++) {
      const studentId = selectedStudentIds[i];
      const stu = students.find((s) => s.id === studentId);
      if (stu) {
        const todayAtt = attendanceRecords.find(
          (r) => r.classId === classroom.id && r.studentId === stu.id && r.date === noticeDate
        );
        const statusText = todayAtt
          ? ATTENDANCE_STATUS_MAP[todayAtt.status]?.label || '出席'
          : '出席';
        const { formattedSummary } = getStudentMissingAssignments(stu.id, assignments, submissions);

        const sub = renderEmailContent(currentTemplate.subject, {
          studentName: stu.name,
          seatNumber: stu.seatNumber,
          className: classroom.name,
          date: noticeDate,
          statusText,
          remarkText: todayAtt?.remark || '',
          missingHomeworkList: formattedSummary,
          teacherName: classroom.teacherName,
          schoolName: classroom.schoolName,
          phone: classroom.contactPhone,
        });

        const body = renderEmailContent(currentTemplate.body, {
          studentName: stu.name,
          seatNumber: stu.seatNumber,
          className: classroom.name,
          date: noticeDate,
          statusText,
          remarkText: todayAtt?.remark || '',
          missingHomeworkList: formattedSummary,
          teacherName: classroom.teacherName,
          schoolName: classroom.schoolName,
          phone: classroom.contactPhone,
        });

        const recipientEmail =
          stu.studentEmail ||
          (stu as any).parentEmail ||
          `${stu.studentId || stu.seatNumber}@school.edu.tw`;

        // Simulate network dispatch delay
        await new Promise((resolve) => setTimeout(resolve, 400));

        onAddEmailLog({
          id: `log-${Date.now()}-${stu.id}`,
          classId: classroom.id,
          studentId: stu.id,
          studentName: stu.name,
          seatNumber: stu.seatNumber,
          recipientName: stu.name,
          recipientEmail: recipientEmail,
          subject: sub,
          body: body,
          notificationType: selectedTrigger,
          status: 'sent',
          timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
        });
      }

      setDispatchProgress({ current: i + 1, total: selectedStudentIds.length });
    }

    setIsDispatching(false);
    alert(`🎉 批次寄信成功！共已自動發送 ${selectedStudentIds.length} 封通知信，並已完整記錄於發送歷史中。`);
  };

  // Copy email text
  const handleCopyText = () => {
    const fullText = `收件人：${renderedEmail.to}\n主旨：${renderedEmail.subject}\n\n${renderedEmail.body}`;
    navigator.clipboard.writeText(fullText).then(() => {
      setCopyStatus(true);
      setTimeout(() => setCopyStatus(false), 2000);
    });
  };

  // Template edit setup
  useEffect(() => {
    const target = templates.find((t) => t.id === editingTemplateId);
    if (target) {
      setTempSubject(target.subject);
      setTempBody(target.body);
    }
  }, [editingTemplateId, templates]);

  const handleSaveTemplate = () => {
    const target = templates.find((t) => t.id === editingTemplateId);
    if (!target) return;
    onUpdateTemplate({
      ...target,
      subject: tempSubject,
      body: tempBody,
    });
    alert('範本已成功更新！');
  };

  // Export logs to CSV
  const handleExportLogsCsv = () => {
    const headers = ['發信時間', '班級', '座號', '學生姓名', '收件信箱', '通知類別', '信件主旨', '發送狀態'];
    const rows = emailLogs.map((log) => [
      log.timestamp,
      classroom.name,
      log.seatNumber,
      log.studentName,
      log.recipientEmail,
      log.notificationType,
      log.subject,
      log.status === 'sent' ? '發送成功' : '佇列中',
    ]);
    exportToCsv(`${classroom.name}_郵件發送歷史紀錄`, headers, rows);
  };

  return (
    <div className="space-y-6">
      {/* Sub-navigation tabs */}
      <div className="bg-white rounded-xl border border-slate-200 p-2 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1">
          {[
            { id: 'dispatcher', label: '寄信工作台 & 佇列', icon: Mail },
            { id: 'templates', label: '郵件範本庫', icon: FileText },
            { id: 'logs', label: `發送紀錄 (${emailLogs.length})`, icon: Clock },
            { id: 'settings', label: '寄件設定', icon: Settings },
          ].map((tab) => {
            const Icon = tab.icon;
            const isCurrent = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                  isCurrent
                    ? 'bg-indigo-600 text-white font-semibold shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        <div className="text-xs text-slate-500 flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span>寄件身份：{emailSettings.senderName} ({emailSettings.senderEmail})</span>
        </div>
      </div>

      {activeTab === 'dispatcher' && (
        /* ===================== DISPATCHER WORKSPACE ===================== */
        <div className="space-y-6">
          {/* Trigger Selector Strip */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
              1. 選擇自動通知觸發場景
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                {
                  id: 'absence_alert',
                  title: '🚨 今日缺席 / 遲到警示通知',
                  desc: '自動過濾本日未到校、曠課或遲到學生，發送即時安全叮嚀信給家長。',
                  count: eligibleStudentList.length,
                },
                {
                  id: 'homework_reminder',
                  title: '📝 作業缺繳催繳與追蹤',
                  desc: '自動統計盤點缺繳、未訂正之各科作業清單，個別彙整發信催繳。',
                  count: eligibleStudentList.length,
                },
                {
                  id: 'weekly_summary',
                  title: '📊 每週在校學習綜合週報',
                  desc: '彙整一週出席率及作業完成情形，加強親師溝通與週末關心。',
                  count: students.length,
                },
              ].map((item) => {
                const isSelected = selectedTrigger === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setSelectedTrigger(item.id as any)}
                    className={`p-3.5 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'bg-indigo-50/80 border-indigo-400 shadow-2xs ring-1 ring-indigo-400'
                        : 'bg-white border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between font-semibold text-xs text-slate-900 mb-1">
                      <span>{item.title}</span>
                      <span className="text-[11px] font-mono font-bold text-indigo-700 bg-indigo-100 px-1.5 py-0.5 rounded">
                        符合 {item.count} 人
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                      {item.desc}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Two-Column Workspace: Recipients Queue (Left) & Dynamic Preview (Right) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Recipient Queue (5 cols) */}
            <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="font-semibold text-slate-900 text-sm">
                    待發送名單佇列 ({selectedStudentIds.length} / {eligibleStudentList.length})
                  </h3>
                  <p className="text-[11px] text-slate-400">勾選欲發送信件的學生名單</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      if (selectedStudentIds.length === eligibleStudentList.length) {
                        setSelectedStudentIds([]);
                      } else {
                        setSelectedStudentIds(eligibleStudentList.map((s) => s.id));
                      }
                    }}
                    className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                  >
                    {selectedStudentIds.length === eligibleStudentList.length ? '取消全選' : '全選'}
                  </button>
                </div>
              </div>

              {/* Student Queue Items */}
              <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
                {eligibleStudentList.map((student) => {
                  const isChecked = selectedStudentIds.includes(student.id);
                  const isPreviewing = previewStudent?.id === student.id;

                  // Find status badge info
                  let badgeText = '';
                  let badgeClass = 'bg-slate-100 text-slate-700';

                  if (selectedTrigger === 'absence_alert') {
                    const rec = attendanceRecords.find(
                      (r) => r.classId === classroom.id && r.studentId === student.id && r.date === noticeDate
                    );
                    badgeText = rec ? ATTENDANCE_STATUS_MAP[rec.status]?.short || '異常' : '異常';
                    badgeClass = 'bg-rose-100 text-rose-800';
                  } else if (selectedTrigger === 'homework_reminder') {
                    const { missingList } = getStudentMissingAssignments(student.id, assignments, submissions);
                    badgeText = `缺 ${missingList.length} 項`;
                    badgeClass = 'bg-amber-100 text-amber-800';
                  }

                  return (
                    <div
                      key={student.id}
                      onClick={() => setPreviewStudentId(student.id)}
                      className={`p-2.5 rounded-lg border text-xs cursor-pointer transition-colors flex items-center justify-between ${
                        isPreviewing
                          ? 'border-indigo-500 bg-indigo-50/50 ring-1 ring-indigo-500/40'
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            e.stopPropagation();
                            if (e.target.checked) {
                              setSelectedStudentIds((prev) => [...prev, student.id]);
                            } else {
                              setSelectedStudentIds((prev) => prev.filter((id) => id !== student.id));
                            }
                          }}
                          className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <div>
                          <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                            <span className="font-mono text-slate-400">#{student.seatNumber}</span>
                            <span>{student.name}</span>
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono">
                            學號：{student.studentId}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {badgeText && (
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${badgeClass}`}>
                            {badgeText}
                          </span>
                        )}
                        <Eye className={`w-3.5 h-3.5 ${isPreviewing ? 'text-indigo-600' : 'text-slate-300'}`} />
                      </div>
                    </div>
                  );
                })}

                {eligibleStudentList.length === 0 && (
                  <div className="text-center py-10 text-slate-400 text-xs">
                    太好了！目前無符合此觸發條件的學生名單。
                  </div>
                )}
              </div>
            </div>

            {/* Right: Dynamic Preview & Sender Engine (7 cols) */}
            <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded border border-indigo-200">
                    即時信件預覽
                  </span>
                  {previewStudent && (
                    <span className="text-xs font-medium text-slate-700">
                      針對：#{previewStudent.seatNumber} {previewStudent.name} 同學
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyText}
                    className="flex items-center gap-1 text-xs text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded transition-colors"
                  >
                    {copyStatus ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copyStatus ? '已複製！' : '複製內容'}</span>
                  </button>
                </div>
              </div>

              {/* Mail Meta Header Preview */}
              <div className="bg-slate-50 rounded-lg p-3 border border-slate-200 space-y-2 text-xs">
                <div className="flex items-center">
                  <span className="text-slate-400 w-16 shrink-0">寄件人：</span>
                  <span className="font-semibold text-slate-800">
                    {emailSettings.senderName} &lt;{emailSettings.senderEmail}&gt;
                  </span>
                </div>
                <div className="flex items-center">
                  <span className="text-slate-400 w-16 shrink-0">收件人：</span>
                  <span className="font-mono text-indigo-700 font-medium">
                    {renderedEmail.to || '（尚未登記 Email）'}
                  </span>
                </div>
                {emailSettings.autoBccSelf && (
                  <div className="flex items-center text-[11px] text-slate-500">
                    <span className="text-slate-400 w-16 shrink-0">密件副本：</span>
                    <span>自動抄送導師本人 ({emailSettings.senderEmail})</span>
                  </div>
                )}
                <div className="flex items-start">
                  <span className="text-slate-400 w-16 shrink-0 mt-0.5">主旨：</span>
                  <span className="font-semibold text-slate-900">{renderedEmail.subject}</span>
                </div>
              </div>

              {/* Mail Body Preview */}
              <div className="bg-slate-50/40 border border-slate-200 rounded-lg p-4 font-mono text-xs whitespace-pre-wrap leading-relaxed text-slate-800 max-h-[280px] overflow-y-auto">
                {renderedEmail.body}
              </div>

              {/* Dispatch Action Panel */}
              <div className="pt-3 border-t border-slate-100 space-y-3">
                {isDispatching && (
                  <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3 space-y-2">
                    <div className="flex items-center justify-between text-xs font-semibold text-indigo-900">
                      <span className="flex items-center gap-1.5">
                        <RotateCw className="w-3.5 h-3.5 animate-spin text-indigo-600" />
                        <span>批次發送排程執行中...</span>
                      </span>
                      <span>
                        {dispatchProgress.current} / {dispatchProgress.total} 封
                      </span>
                    </div>
                    <div className="w-full bg-indigo-200 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-indigo-600 h-2 transition-all duration-300"
                        style={{
                          width: `${(dispatchProgress.current / dispatchProgress.total) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="text-[11px] text-slate-400">
                    已選取 <b>{selectedStudentIds.length}</b> 位收件人家長
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {/* Native mailto for single preview */}
                    <button
                      onClick={() => handleOpenMailClient(true)}
                      disabled={!renderedEmail.to}
                      className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                      title="呼叫本機預設郵件軟體 (Gmail / Outlook / Apple Mail) 發送此封信件"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>開啟郵件軟體 (單發)</span>
                    </button>

                    {/* Batch Automated Dispatch Engine */}
                    <button
                      onClick={handleBatchDispatch}
                      disabled={isDispatching || selectedStudentIds.length === 0}
                      className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-lg shadow-2xs transition-colors"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{isDispatching ? '發送中...' : `一鍵批次自動發信 (${selectedStudentIds.length} 封)`}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'templates' && (
        /* ===================== TEMPLATES MANAGEMENT ===================== */
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-base">郵件範本庫與智慧動態標籤</h3>
              <p className="text-xs text-slate-500">
                自訂各類別通知信的預設主旨與內文格式，系統將在發信時自動替換學生個別資料
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Template Selector List */}
            <div className="space-y-2">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                選擇欲編輯之範本
              </div>
              {templates.map((tpl) => (
                <button
                  key={tpl.id}
                  onClick={() => setEditingTemplateId(tpl.id)}
                  className={`w-full p-3 text-left rounded-xl border transition-all ${
                    editingTemplateId === tpl.id
                      ? 'border-indigo-400 bg-indigo-50/70 shadow-2xs font-semibold text-indigo-900'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="text-xs font-bold">{tpl.name}</div>
                  <div className="text-[11px] text-slate-400 mt-1 line-clamp-2">{tpl.description}</div>
                </button>
              ))}
            </div>

            {/* Template Editor Form */}
            <div className="lg:col-span-2 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">郵件主旨 (Subject)</label>
                <input
                  type="text"
                  value={tempSubject}
                  onChange={(e) => setTempSubject(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-700">郵件內文 (Body)</label>
                  <span className="text-[11px] text-slate-400">支援點擊下方標籤快速插入</span>
                </div>
                <textarea
                  rows={12}
                  value={tempBody}
                  onChange={(e) => setTempBody(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-mono border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 leading-relaxed"
                />
              </div>

              {/* Smart Variable Insertion Toolbar */}
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-2">
                <div className="text-[11px] font-semibold text-slate-500">可用智慧變數（點選插入）：</div>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    '{學生姓名}',
                    '{座號}',
                    '{班級名稱}',
                    '{日期}',
                    '{出缺席狀態}',
                    '{備註說明}',
                    '{缺交作業清單}',
                    '{導師姓名}',
                    '{學校名稱}',
                    '{聯絡電話}',
                    '{發信時間}',
                  ].map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => setTempBody((prev) => prev + tag)}
                      className="px-2 py-1 bg-white hover:bg-indigo-50 hover:text-indigo-700 text-slate-600 text-[11px] font-mono rounded border border-slate-200 transition-colors"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={handleSaveTemplate}
                  className="px-5 py-2 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-2xs transition-colors"
                >
                  儲存此範本變更
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'logs' && (
        /* ===================== LOGS ===================== */
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-base">郵件發送歷史紀錄 (Audit Logs)</h3>
              <p className="text-xs text-slate-500">完整記錄系統對學生發出的每一封通知紀錄</p>
            </div>
            <button
              onClick={handleExportLogsCsv}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>匯出發信日誌 CSV</span>
            </button>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-lg">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-semibold text-slate-500">
                  <th className="py-2.5 px-3 w-40">發信時間</th>
                  <th className="py-2.5 px-3 w-28">學生 (座號)</th>
                  <th className="py-2.5 px-3 w-48">收件信箱</th>
                  <th className="py-2.5 px-3">信件主旨</th>
                  <th className="py-2.5 px-3 w-24 text-center">狀態</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {emailLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-2.5 px-3 text-slate-500 font-mono text-[11px]">{log.timestamp}</td>
                    <td className="py-2.5 px-3 font-medium text-slate-900">
                      {log.studentName} (#{log.seatNumber})
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">
                      <div className="text-[11px] text-slate-700 font-mono">{log.recipientEmail}</div>
                    </td>
                    <td className="py-2.5 px-3 font-medium text-slate-800 truncate max-w-xs" title={log.subject}>
                      {log.subject}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>已送達</span>
                      </span>
                    </td>
                  </tr>
                ))}
                {emailLogs.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400 text-xs">
                      尚無郵件發送紀錄
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'settings' && (
        /* ===================== SETTINGS ===================== */
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs max-w-2xl space-y-6">
          <div>
            <h3 className="font-bold text-slate-900 text-base">寄件者身份與系統設定</h3>
            <p className="text-xs text-slate-500">設定發送通知信時所顯示的導師名稱、學校電話與署名資訊</p>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">寄件者顯示名稱</label>
              <input
                type="text"
                value={emailSettings.senderName}
                onChange={(e) =>
                  onUpdateEmailSettings({ ...emailSettings, senderName: e.target.value })
                }
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">導師公務信箱 (From Email)</label>
              <input
                type="email"
                value={emailSettings.senderEmail}
                onChange={(e) =>
                  onUpdateEmailSettings({ ...emailSettings, senderEmail: e.target.value })
                }
                className="w-full px-3 py-2 font-mono border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">學校全稱</label>
                <input
                  type="text"
                  value={emailSettings.schoolName}
                  onChange={(e) =>
                    onUpdateEmailSettings({ ...emailSettings, schoolName: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">公務聯絡分機電話</label>
                <input
                  type="text"
                  value={emailSettings.phone}
                  onChange={(e) =>
                    onUpdateEmailSettings({ ...emailSettings, phone: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="pt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={emailSettings.autoBccSelf}
                  onChange={(e) =>
                    onUpdateEmailSettings({ ...emailSettings, autoBccSelf: e.target.checked })
                  }
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-slate-700 font-medium">發送信件時自動密件副本 (BCC) 抄送給導師留存</span>
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
