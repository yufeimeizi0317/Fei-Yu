import React, { useState, useMemo } from 'react';
import { Classroom, Student, AttendanceRecord, AttendanceStatus } from '../types';
import {
  ATTENDANCE_STATUS_MAP,
  SESSIONS_LIST,
  formatDateZh,
  exportToCsv,
} from '../utils/helpers';
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  Mail,
  Download,
  Calendar,
  Search,
  CheckCheck,
  Printer,
  ChevronLeft,
  ChevronRight,
  QrCode,
} from 'lucide-react';

interface Props {
  classroom: Classroom;
  students: Student[];
  attendanceRecords: AttendanceRecord[];
  onUpdateRecord: (record: AttendanceRecord) => void;
  onBatchUpdateStatus: (date: string, session: string, status: AttendanceStatus) => void;
  onTriggerEmailForStudents: (studentIds: string[], triggerType: 'absence_alert') => void;
  onOpenQrScanner?: () => void;
}

export const AttendanceView: React.FC<Props> = ({
  classroom,
  students,
  attendanceRecords,
  onUpdateRecord,
  onBatchUpdateStatus,
  onTriggerEmailForStudents,
  onOpenQrScanner,
}) => {
  const [selectedDate, setSelectedDate] = useState<string>('2026-09-23');
  const [selectedSession, setSelectedSession] = useState<string>('早自習');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Quick day navigation
  const shiftDate = (days: number) => {
    try {
      const [y, m, d] = selectedDate.split('-').map(Number);
      const dt = new Date(y, m - 1, d);
      dt.setDate(dt.getDate() + days);
      const newY = dt.getFullYear();
      const newM = String(dt.getMonth() + 1).padStart(2, '0');
      const newD = String(dt.getDate()).padStart(2, '0');
      setSelectedDate(`${newY}-${newM}-${newD}`);
    } catch {
      // fallback
    }
  };

  // Get current record map for this date & session
  const currentRecordsMap = useMemo(() => {
    const map = new Map<string, AttendanceRecord>();
    attendanceRecords.forEach((rec) => {
      if (
        rec.classId === classroom.id &&
        rec.date === selectedDate &&
        rec.session === selectedSession
      ) {
        map.set(rec.studentId, rec);
      }
    });
    return map;
  }, [attendanceRecords, classroom.id, selectedDate, selectedSession]);

  // Merge students with their record
  const studentRows = useMemo(() => {
    return students.map((student) => {
      const record = currentRecordsMap.get(student.id);
      const status: AttendanceStatus = record ? record.status : 'present';
      return {
        student,
        record,
        status,
        lateMinutes: record?.lateMinutes,
        remark: record?.remark || '',
      };
    });
  }, [students, currentRecordsMap]);

  // Statistics calculation
  const stats = useMemo(() => {
    const total = students.length;
    let presentCount = 0;
    let lateCount = 0;
    let absentCount = 0;
    let leaveCount = 0;

    studentRows.forEach((row) => {
      if (row.status === 'present') presentCount++;
      else if (row.status === 'late') lateCount++;
      else if (row.status === 'absent') absentCount++;
      else leaveCount++;
    });

    const presentRate = total > 0 ? (((presentCount + lateCount) / total) * 100).toFixed(1) : '100.0';

    return {
      total,
      presentCount,
      lateCount,
      absentCount,
      leaveCount,
      presentRate,
    };
  }, [students.length, studentRows]);

  // Handle single status change
  const handleStatusChange = (
    student: Student,
    newStatus: AttendanceStatus,
    lateMinutes?: number,
    remark?: string
  ) => {
    const existing = currentRecordsMap.get(student.id);
    const newRecord: AttendanceRecord = {
      id: existing ? existing.id : `att-${selectedDate}-${selectedSession}-${student.id}`,
      classId: classroom.id,
      studentId: student.id,
      date: selectedDate,
      session: selectedSession,
      status: newStatus,
      lateMinutes: newStatus === 'late' ? (lateMinutes ?? existing?.lateMinutes ?? 15) : undefined,
      remark: remark !== undefined ? remark : existing?.remark,
      recordedAt: new Date().toISOString(),
    };
    onUpdateRecord(newRecord);
  };

  const handleRemarkChange = (student: Student, remarkText: string) => {
    const existing = currentRecordsMap.get(student.id);
    const currentStatus = existing ? existing.status : 'present';
    const newRecord: AttendanceRecord = {
      id: existing ? existing.id : `att-${selectedDate}-${selectedSession}-${student.id}`,
      classId: classroom.id,
      studentId: student.id,
      date: selectedDate,
      session: selectedSession,
      status: currentStatus,
      lateMinutes: existing?.lateMinutes,
      remark: remarkText,
      recordedAt: new Date().toISOString(),
    };
    onUpdateRecord(newRecord);
  };

  // Filtered rows for display
  const filteredRows = useMemo(() => {
    return studentRows.filter((row) => {
      const matchesSearch =
        row.student.name.includes(searchQuery) ||
        String(row.student.seatNumber).includes(searchQuery) ||
        row.student.studentId.includes(searchQuery);

      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'absent' && row.status === 'absent') ||
        (statusFilter === 'late' && row.status === 'late') ||
        (statusFilter === 'leave' &&
          ['sick_leave', 'personal_leave', 'official_leave', 'bereavement'].includes(row.status)) ||
        (statusFilter === 'abnormal' && row.status !== 'present');

      return matchesSearch && matchesStatus;
    });
  }, [studentRows, searchQuery, statusFilter]);

  // Absent & late students for email notification
  const absentOrLateStudentIds = useMemo(() => {
    return studentRows
      .filter((row) => row.status === 'absent' || row.status === 'late')
      .map((row) => row.student.id);
  }, [studentRows]);

  // Export Daily Attendance to CSV
  const handleExportCsv = () => {
    const headers = [
      '日期',
      '節次',
      '班級',
      '座號',
      '學號',
      '學生姓名',
      '出勤狀態',
      '遲到分鐘',
      '請假/事由備註',
    ];

    const rows = studentRows.map((row) => [
      selectedDate,
      selectedSession,
      classroom.name,
      row.student.seatNumber,
      row.student.studentId,
      row.student.name,
      ATTENDANCE_STATUS_MAP[row.status]?.short || row.status,
      row.status === 'late' ? row.lateMinutes || 0 : '',
      row.remark,
    ]);

    exportToCsv(`${classroom.name}_${selectedDate}_${selectedSession}_點名單`, headers, rows);
  };

  return (
    <div className="space-y-6">
      {/* Control Bar: Date & Session Selector */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Left: Date Picker & Shift */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
              <button
                onClick={() => shiftDate(-1)}
                className="p-1.5 hover:bg-white text-slate-600 hover:text-slate-900 rounded transition-colors"
                title="前一日"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-1.5 px-2">
                <Calendar className="w-4 h-4 text-indigo-600" />
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="text-xs font-semibold text-slate-800 bg-transparent border-none focus:outline-none focus:ring-0 cursor-pointer"
                />
              </div>
              <button
                onClick={() => shiftDate(1)}
                className="p-1.5 hover:bg-white text-slate-600 hover:text-slate-900 rounded transition-colors"
                title="後一日"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={() => setSelectedDate('2026-09-23')}
              className="px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 rounded-lg transition-colors"
            >
              回今日
            </button>

            <span className="text-xs text-slate-500 font-medium hidden sm:inline">
              {formatDateZh(selectedDate)}
            </span>

            {/* Session Selector */}
            <div className="flex items-center gap-1">
              <label className="text-xs text-slate-500 mr-1">節次：</label>
              <select
                value={selectedSession}
                onChange={(e) => setSelectedSession(e.target.value)}
                className="text-xs font-semibold text-slate-800 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
              >
                {SESSIONS_LIST.map((sess) => (
                  <option key={sess} value={sess}>
                    {sess}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Right: Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {onOpenQrScanner && (
              <button
                onClick={onOpenQrScanner}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-colors shadow-2xs"
                title="切換至 QR Code 鏡頭掃描報到模式"
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>QR 掃碼報到</span>
              </button>
            )}

            <button
              onClick={() => onBatchUpdateStatus(selectedDate, selectedSession, 'present')}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors"
              title="將全班未設定學生皆標記為出席"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>一鍵全員出席</span>
            </button>

            <button
              onClick={() => onTriggerEmailForStudents(absentOrLateStudentIds, 'absence_alert')}
              disabled={absentOrLateStudentIds.length === 0}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              title="自動針對本日缺席或遲到學生發送通報信"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>通知異常名單 ({absentOrLateStudentIds.length})</span>
            </button>

            <button
              onClick={handleExportCsv}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg transition-colors"
              title="匯出 Excel / CSV"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">匯出報表</span>
            </button>

            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg transition-colors"
              title="友善列印本日點名單"
            >
              <Printer className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white rounded-xl border border-slate-200 p-3.5">
          <div className="text-xs text-slate-500 font-medium">班級應到</div>
          <div className="text-2xl font-bold text-slate-800 font-mono tabular-nums mt-0.5">
            {stats.total} <span className="text-xs font-normal text-slate-400">人</span>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-emerald-100 bg-gradient-to-b from-white to-emerald-50/20 p-3.5">
          <div className="text-xs text-emerald-700 font-medium flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>實到人數</span>
          </div>
          <div className="text-2xl font-bold text-emerald-700 font-mono tabular-nums mt-0.5">
            {stats.presentCount} <span className="text-xs font-normal text-emerald-600/70">人</span>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-3.5">
          <div className="text-xs text-slate-500 font-medium">實到出席率</div>
          <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums mt-0.5">
            {stats.presentRate}<span className="text-xs font-normal text-slate-400">%</span>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-rose-200 bg-gradient-to-b from-white to-rose-50/20 p-3.5">
          <div className="text-xs text-rose-700 font-medium flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            <span>缺席 / 曠課</span>
          </div>
          <div className="text-2xl font-bold text-rose-700 font-mono tabular-nums mt-0.5">
            {stats.absentCount} <span className="text-xs font-normal text-rose-600/70">人</span>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-amber-200 bg-gradient-to-b from-white to-amber-50/20 p-3.5">
          <div className="text-xs text-amber-700 font-medium flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>遲到人數</span>
          </div>
          <div className="text-2xl font-bold text-amber-700 font-mono tabular-nums mt-0.5">
            {stats.lateCount} <span className="text-xs font-normal text-amber-600/70">人</span>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-sky-200 bg-gradient-to-b from-white to-sky-50/20 p-3.5">
          <div className="text-xs text-sky-700 font-medium">請假 (病/事/公)</div>
          <div className="text-2xl font-bold text-sky-700 font-mono tabular-nums mt-0.5">
            {stats.leaveCount} <span className="text-xs font-normal text-sky-600/70">人</span>
          </div>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white rounded-xl border border-slate-200 p-3 shadow-2xs">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="搜尋座號、學生姓名、學號..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        {/* Status Filter Segmented Control */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg w-full sm:w-auto overflow-x-auto">
          {[
            { id: 'all', label: '全部' },
            { id: 'abnormal', label: `異常 (${stats.absentCount + stats.lateCount + stats.leaveCount})` },
            { id: 'absent', label: `缺席 (${stats.absentCount})` },
            { id: 'late', label: `遲到 (${stats.lateCount})` },
            { id: 'leave', label: `請假 (${stats.leaveCount})` },
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

      {/* Attendance Roster Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4 w-16 text-center">座號</th>
                <th className="py-3 px-4 w-32">學生姓名</th>
                <th className="py-3 px-4 min-w-[280px]">出勤狀態標記</th>
                <th className="py-3 px-4 w-44">遲到與假由備註</th>
                <th className="py-3 px-4 w-24 text-right">快速操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredRows.map(({ student, status, lateMinutes, remark }) => {
                return (
                  <tr
                    key={student.id}
                    className={`hover:bg-slate-50/60 transition-colors ${
                      status === 'absent' ? 'bg-rose-50/30' : status === 'late' ? 'bg-amber-50/20' : ''
                    }`}
                  >
                    {/* Seat Number */}
                    <td className="py-3 px-4 text-center font-mono tabular-nums font-semibold text-slate-700">
                      {String(student.seatNumber).padStart(2, '0')}
                    </td>

                    {/* Student Name */}
                    <td className="py-3 px-4 font-medium text-slate-900">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-sm">{student.name}</span>
                        <span className="text-[11px] text-slate-400 font-mono">#{student.studentId}</span>
                      </div>
                    </td>

                    {/* Status Button Switchers */}
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap items-center gap-1">
                        {(
                          [
                            'present',
                            'late',
                            'absent',
                            'sick_leave',
                            'personal_leave',
                            'official_leave',
                          ] as AttendanceStatus[]
                        ).map((stKey) => {
                          const isSelected = status === stKey;
                          const info = ATTENDANCE_STATUS_MAP[stKey];

                          return (
                            <button
                              key={stKey}
                              onClick={() => handleStatusChange(student, stKey)}
                              className={`px-2 py-1 rounded text-xs font-medium transition-all ${
                                isSelected
                                  ? `${info.bg} ${info.text} ring-1 ring-inset ${info.border} font-bold shadow-2xs scale-102`
                                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                              }`}
                            >
                              {info.short}
                            </button>
                          );
                        })}
                      </div>
                    </td>

                    {/* Late Minutes & Remark Input */}
                    <td className="py-3 px-4">
                      <div className="space-y-1">
                        {status === 'late' && (
                          <div className="flex items-center gap-1 text-[11px] text-amber-700">
                            <span>遲到</span>
                            <input
                              type="number"
                              min="1"
                              max="300"
                              value={lateMinutes || 15}
                              onChange={(e) =>
                                handleStatusChange(
                                  student,
                                  'late',
                                  parseInt(e.target.value) || 0,
                                  remark
                                )
                              }
                              className="w-12 px-1.5 py-0.5 font-mono text-xs bg-white border border-amber-300 rounded text-amber-900 focus:outline-none"
                            />
                            <span>分鐘</span>
                          </div>
                        )}
                        <input
                          type="text"
                          placeholder="假由或異常事由說明..."
                          value={remark}
                          onChange={(e) => handleRemarkChange(student, e.target.value)}
                          className="w-full px-2 py-1 text-[11px] bg-white border border-slate-200 rounded focus:outline-none focus:border-indigo-400 placeholder:text-slate-300"
                        />
                      </div>
                    </td>

                    {/* Quick Single Action */}
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => onTriggerEmailForStudents([student.id], 'absence_alert')}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded transition-colors"
                        title="建立通報信"
                      >
                        <Mail className="w-3 h-3 text-slate-500" />
                        <span>寄信</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filteredRows.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400 text-xs">
                    查無符合篩選條件的學生名單
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Floating Action Button for QR Scanner */}
      {onOpenQrScanner && (
        <div className="fixed bottom-20 right-4 md:hidden z-30 no-print">
          <button
            onClick={onOpenQrScanner}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-full shadow-lg shadow-indigo-300 font-semibold text-xs active:scale-95 transition-transform"
          >
            <QrCode className="w-4 h-4" />
            <span>掃描點名</span>
          </button>
        </div>
      )}
    </div>
  );
};
