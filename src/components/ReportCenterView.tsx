import React, { useState, useMemo } from 'react';
import {
  Classroom,
  Student,
  AttendanceRecord,
  Assignment,
  AssignmentSubmission,
} from '../types';
import {
  ATTENDANCE_STATUS_MAP,
  SUBMISSION_STATUS_MAP,
  formatDateZh,
  exportToCsv,
  getStudentMissingAssignments,
} from '../utils/helpers';
import {
  Printer,
  Download,
  Calendar,
  User,
  ClipboardList,
  CheckCircle2,
  FileSpreadsheet,
} from 'lucide-react';

interface Props {
  classroom: Classroom;
  students: Student[];
  attendanceRecords: AttendanceRecord[];
  assignments: Assignment[];
  submissions: AssignmentSubmission[];
}

export const ReportCenterView: React.FC<Props> = ({
  classroom,
  students,
  attendanceRecords,
  assignments,
  submissions,
}) => {
  const [reportType, setReportType] = useState<
    'daily_attendance' | 'monthly_attendance' | 'homework_summary' | 'student_profile'
  >('daily_attendance');

  const [selectedDate, setSelectedDate] = useState<string>('2026-09-23');
  const [selectedStudentId, setSelectedStudentId] = useState<string>(
    students[0]?.id || ''
  );

  // Selected student object
  const selectedStudent = useMemo(() => {
    return students.find((s) => s.id === selectedStudentId) || students[0];
  }, [students, selectedStudentId]);

  // Daily attendance data for selected date
  const dailyRecords = useMemo(() => {
    return students.map((s) => {
      const rec = attendanceRecords.find(
        (r) =>
          r.classId === classroom.id &&
          r.studentId === s.id &&
          r.date === selectedDate
      );
      return {
        student: s,
        status: rec ? rec.status : 'present',
        lateMinutes: rec?.lateMinutes,
        remark: rec?.remark || '',
      };
    });
  }, [students, attendanceRecords, classroom.id, selectedDate]);

  // Daily stats
  const dailyStats = useMemo(() => {
    const total = students.length;
    let present = 0;
    let late = 0;
    let absent = 0;
    let sick = 0;
    let personal = 0;
    let official = 0;

    dailyRecords.forEach((r) => {
      if (r.status === 'present') present++;
      else if (r.status === 'late') late++;
      else if (r.status === 'absent') absent++;
      else if (r.status === 'sick_leave') sick++;
      else if (r.status === 'personal_leave') personal++;
      else if (r.status === 'official_leave') official++;
    });

    const rate = total > 0 ? (((present + late) / total) * 100).toFixed(1) : '100.0';

    return { total, present, late, absent, sick, personal, official, rate };
  }, [students.length, dailyRecords]);

  // Monthly / Overall attendance per student
  const overallAttendance = useMemo(() => {
    return students.map((s) => {
      const records = attendanceRecords.filter(
        (r) => r.classId === classroom.id && r.studentId === s.id
      );
      const totalSessions = records.length;
      let presentCount = 0;
      let lateCount = 0;
      let absentCount = 0;
      let leaveCount = 0;

      records.forEach((r) => {
        if (r.status === 'present') presentCount++;
        else if (r.status === 'late') lateCount++;
        else if (r.status === 'absent') absentCount++;
        else leaveCount++;
      });

      const rate =
        totalSessions > 0
          ? (((presentCount + lateCount) / totalSessions) * 100).toFixed(1)
          : '100.0';

      return {
        student: s,
        totalSessions,
        presentCount,
        lateCount,
        absentCount,
        leaveCount,
        rate,
      };
    });
  }, [students, attendanceRecords, classroom.id]);

  // Homework analytics
  const homeworkAnalytics = useMemo(() => {
    return assignments.map((a) => {
      const subList = submissions.filter((s) => s.assignmentId === a.id);
      const total = students.length;
      let submitted = 0;
      let missing = 0;
      let correction = 0;
      let late = 0;
      const missingStudents: Student[] = [];

      students.forEach((stu) => {
        const sub = subList.find((s) => s.studentId === stu.id);
        if (sub?.status === 'submitted' || sub?.status === 'resubmitted') {
          submitted++;
        } else if (sub?.status === 'missing' || !sub) {
          missing++;
          missingStudents.push(stu);
        } else if (sub?.status === 'needs_correction') {
          correction++;
          missingStudents.push(stu);
        } else if (sub?.status === 'late') {
          late++;
        }
      });

      const rate = total > 0 ? (((submitted + late) / total) * 100).toFixed(1) : '100.0';

      return {
        assignment: a,
        total,
        submitted,
        missing,
        correction,
        late,
        rate,
        missingStudents,
      };
    });
  }, [assignments, submissions, students]);

  // Student Diagnostic Profile Data
  const studentProfileData = useMemo(() => {
    if (!selectedStudent) return null;

    const studentRecords = attendanceRecords.filter(
      (r) => r.classId === classroom.id && r.studentId === selectedStudent.id
    );

    let present = 0;
    let late = 0;
    let absent = 0;
    let leave = 0;

    studentRecords.forEach((r) => {
      if (r.status === 'present') present++;
      else if (r.status === 'late') late++;
      else if (r.status === 'absent') absent++;
      else leave++;
    });

    const totalRecorded = studentRecords.length;
    const attRate =
      totalRecorded > 0 ? (((present + late) / totalRecorded) * 100).toFixed(1) : '100.0';

    const { missingList } = getStudentMissingAssignments(
      selectedStudent.id,
      assignments,
      submissions
    );

    const studentSubmissions = assignments.map((a) => {
      const sub = submissions.find(
        (s) => s.assignmentId === a.id && s.studentId === selectedStudent.id
      );
      return {
        assignment: a,
        submission: sub,
        status: sub ? sub.status : 'missing',
        score: sub?.score,
        feedback: sub?.feedback,
      };
    });

    return {
      studentRecords,
      totalRecorded,
      present,
      late,
      absent,
      leave,
      attRate,
      missingList,
      studentSubmissions,
    };
  }, [selectedStudent, attendanceRecords, classroom.id, assignments, submissions]);

  // Export CSV handler for active report
  const handleExportCsv = () => {
    if (reportType === 'daily_attendance') {
      const headers = ['日期', '班級', '座號', '姓名', '出勤狀態', '遲到備註', '假單事由'];
      const rows = dailyRecords.map((r) => [
        selectedDate,
        classroom.name,
        r.student.seatNumber,
        r.student.name,
        ATTENDANCE_STATUS_MAP[r.status]?.label || r.status,
        r.status === 'late' ? `遲到 ${r.lateMinutes || 0} 分` : '',
        r.remark,
      ]);
      exportToCsv(`${classroom.name}_${selectedDate}_出缺席日誌報表`, headers, rows);
    } else if (reportType === 'monthly_attendance') {
      const headers = ['班級', '座號', '學號', '姓名', '統計節次', '出席次數', '遲到次數', '請假次數', '缺席次數', '出席率%'];
      const rows = overallAttendance.map((r) => [
        classroom.name,
        r.student.seatNumber,
        r.student.studentId,
        r.student.name,
        r.totalSessions,
        r.presentCount,
        r.lateCount,
        r.leaveCount,
        r.absentCount,
        r.rate,
      ]);
      exportToCsv(`${classroom.name}_全班出缺席累計統計報表`, headers, rows);
    } else if (reportType === 'homework_summary') {
      const headers = ['學科', '作業名稱', '截止期限', '應繳人數', '已繳人數', '缺交人數', '待訂正', '繳交率%', '缺繳學生名單'];
      const rows = homeworkAnalytics.map((item) => [
        item.assignment.subject,
        item.assignment.title,
        item.assignment.dueDate,
        item.total,
        item.submitted,
        item.missing,
        item.correction,
        item.rate,
        item.missingStudents.map((s) => `#${s.seatNumber} ${s.name}`).join('、'),
      ]);
      exportToCsv(`${classroom.name}_各科作業盤點總表`, headers, rows);
    } else if (reportType === 'student_profile') {
      if (!selectedStudent || !studentProfileData) return;
      const headers = ['學生姓名', '座號', '作業科目', '作業名稱', '截止日', '繳交狀態', '得分', '教師評語'];
      const rows = studentProfileData.studentSubmissions.map((s) => [
        selectedStudent.name,
        selectedStudent.seatNumber,
        s.assignment.subject,
        s.assignment.title,
        s.assignment.dueDate,
        SUBMISSION_STATUS_MAP[s.status]?.label || s.status,
        s.score !== undefined ? s.score : '',
        s.feedback || '',
      ]);
      exportToCsv(`${classroom.name}_#${selectedStudent.seatNumber}${selectedStudent.name}_個人學習報告`, headers, rows);
    }
  };

  return (
    <div className="space-y-6">
      {/* Report Selection Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs no-print">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Report Type Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-lg">
            {[
              { id: 'daily_attendance', label: '每日出缺席日誌單' },
              { id: 'monthly_attendance', label: '出缺勤累計總表' },
              { id: 'homework_summary', label: '作業盤點彙整報表' },
              { id: 'student_profile', label: '個別學生診斷檔案卡' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setReportType(tab.id as any)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  reportType === tab.id
                    ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Report Controls & Actions */}
          <div className="flex flex-wrap items-center gap-2">
            {reportType === 'daily_attendance' && (
              <div className="flex items-center gap-1.5 text-xs">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="px-2 py-1 bg-slate-50 border border-slate-200 rounded text-xs font-semibold"
                />
              </div>
            )}

            {reportType === 'student_profile' && (
              <div className="flex items-center gap-1.5 text-xs">
                <User className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded text-xs font-semibold"
                >
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      #{String(s.seatNumber).padStart(2, '0')} {s.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <button
              onClick={handleExportCsv}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>匯出 Excel (CSV)</span>
            </button>

            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-2xs transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>友善列印 / 另存 PDF</span>
            </button>
          </div>
        </div>
      </div>

      {/* ======================= PRINTABLE REPORT CANVAS ======================= */}
      <div className="bg-white rounded-xl border border-slate-200 p-8 shadow-xs print:p-0 print:border-none print:shadow-none">
        {/* Official School Report Header */}
        <div className="border-b-2 border-slate-800 pb-4 mb-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-sm font-semibold text-slate-500 tracking-wider">
                {classroom.schoolName} · {classroom.academicYear} {classroom.semester}
              </div>
              <h1 className="text-2xl font-bold text-slate-900 mt-0.5">
                {reportType === 'daily_attendance' && `班級每日出缺席點名紀錄日誌`}
                {reportType === 'monthly_attendance' && `班級學生出缺席累計統計月報總表`}
                {reportType === 'homework_summary' && `全學期各科作業繳交盤點彙整報表`}
                {reportType === 'student_profile' && `學生個人學習與出勤綜合診斷檔案卡`}
              </h1>
            </div>

            <div className="text-right text-xs text-slate-500">
              <div>班級：<b className="text-slate-900">{classroom.name}</b></div>
              <div>導師：<b className="text-slate-900">{classroom.teacherName}</b></div>
              <div>製表時間：{new Date().toLocaleDateString('zh-TW')}</div>
            </div>
          </div>
        </div>

        {/* 1. DAILY ATTENDANCE REPORT */}
        {reportType === 'daily_attendance' && (
          <div className="space-y-6">
            {/* Meta statistics row */}
            <div className="grid grid-cols-6 gap-2 text-center text-xs bg-slate-50 border border-slate-200 rounded-lg p-3 print:border-slate-800">
              <div>
                <div className="text-slate-400">應到人數</div>
                <div className="text-base font-bold text-slate-900 font-mono">{dailyStats.total} 人</div>
              </div>
              <div>
                <div className="text-emerald-600">實到人數</div>
                <div className="text-base font-bold text-emerald-700 font-mono">{dailyStats.present} 人</div>
              </div>
              <div>
                <div className="text-slate-500">實到出席率</div>
                <div className="text-base font-bold text-slate-900 font-mono">{dailyStats.rate}%</div>
              </div>
              <div>
                <div className="text-rose-600">曠課/缺席</div>
                <div className="text-base font-bold text-rose-700 font-mono">{dailyStats.absent} 人</div>
              </div>
              <div>
                <div className="text-amber-600">遲到人數</div>
                <div className="text-base font-bold text-amber-700 font-mono">{dailyStats.late} 人</div>
              </div>
              <div>
                <div className="text-sky-600">請假人數</div>
                <div className="text-base font-bold text-sky-700 font-mono">
                  {dailyStats.sick + dailyStats.personal + dailyStats.official} 人
                </div>
              </div>
            </div>

            {/* Attendance Roster Table */}
            <table className="w-full text-left border-collapse text-xs border border-slate-200">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold">
                  <th className="py-2 px-3 border-r border-slate-200 w-14 text-center">座號</th>
                  <th className="py-2 px-3 border-r border-slate-200 w-28">姓名</th>
                  <th className="py-2 px-3 border-r border-slate-200 w-24">出勤狀態</th>
                  <th className="py-2 px-3 border-r border-slate-200 w-28">遲到時數</th>
                  <th className="py-2 px-3 border-r border-slate-200">請假事由 / 導師備註</th>
                  <th className="py-2 px-3 w-36">出勤檢核情形</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {dailyRecords.map((r) => (
                  <tr key={r.student.id} className={r.status !== 'present' ? 'bg-slate-50/80 font-medium' : ''}>
                    <td className="py-2 px-3 border-r border-slate-200 text-center font-mono font-bold">
                      {String(r.student.seatNumber).padStart(2, '0')}
                    </td>
                    <td className="py-2 px-3 border-r border-slate-200">{r.student.name}</td>
                    <td className="py-2 px-3 border-r border-slate-200">
                      {ATTENDANCE_STATUS_MAP[r.status]?.label}
                    </td>
                    <td className="py-2 px-3 border-r border-slate-200 font-mono">
                      {r.status === 'late' ? `遲到 ${r.lateMinutes || 0} 分鐘` : '-'}
                    </td>
                    <td className="py-2 px-3 border-r border-slate-200">{r.remark || '-'}</td>
                    <td className="py-2 px-3 text-slate-500">
                      {r.status !== 'present' ? '已登記異常' : '正常到校'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Signature Section for Schools */}
            <div className="pt-10 grid grid-cols-3 gap-6 text-xs text-slate-700">
              <div className="border-t border-slate-300 pt-2">
                <div>班級導師簽名：</div>
                <div className="mt-8 text-slate-400 font-mono">{classroom.teacherName} (蓋章)</div>
              </div>
              <div className="border-t border-slate-300 pt-2">
                <div>學務處生教組長簽章：</div>
                <div className="mt-8 text-slate-300">＿＿＿＿＿＿＿＿</div>
              </div>
              <div className="border-t border-slate-300 pt-2">
                <div>學務主任核定：</div>
                <div className="mt-8 text-slate-300">＿＿＿＿＿＿＿＿</div>
              </div>
            </div>
          </div>
        )}

        {/* 2. MONTHLY CUMULATIVE ATTENDANCE REPORT */}
        {reportType === 'monthly_attendance' && (
          <div className="space-y-4">
            <div className="text-xs text-slate-500 mb-2">
              本報表統計全體學生至本日為止之累計出缺席數據及出席率排名。
            </div>
            <table className="w-full text-left border-collapse text-xs border border-slate-200">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold">
                  <th className="py-2 px-3 border-r border-slate-200 w-14 text-center">座號</th>
                  <th className="py-2 px-3 border-r border-slate-200 w-28">學生姓名</th>
                  <th className="py-2 px-3 border-r border-slate-200 w-24">學號</th>
                  <th className="py-2 px-3 border-r border-slate-200 text-center">應到節次</th>
                  <th className="py-2 px-3 border-r border-slate-200 text-center">實到節次</th>
                  <th className="py-2 px-3 border-r border-slate-200 text-center">遲到次數</th>
                  <th className="py-2 px-3 border-r border-slate-200 text-center">請假次數</th>
                  <th className="py-2 px-3 border-r border-slate-200 text-center">曠課缺席</th>
                  <th className="py-2 px-3 text-center font-bold">出席率</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {overallAttendance.map((r) => (
                  <tr key={r.student.id}>
                    <td className="py-2 px-3 border-r border-slate-200 text-center font-mono font-bold">
                      {String(r.student.seatNumber).padStart(2, '0')}
                    </td>
                    <td className="py-2 px-3 border-r border-slate-200 font-medium">{r.student.name}</td>
                    <td className="py-2 px-3 border-r border-slate-200 font-mono text-slate-500">
                      {r.student.studentId}
                    </td>
                    <td className="py-2 px-3 border-r border-slate-200 text-center font-mono">{r.totalSessions}</td>
                    <td className="py-2 px-3 border-r border-slate-200 text-center font-mono text-emerald-700 font-bold">
                      {r.presentCount}
                    </td>
                    <td className="py-2 px-3 border-r border-slate-200 text-center font-mono text-amber-700">
                      {r.lateCount}
                    </td>
                    <td className="py-2 px-3 border-r border-slate-200 text-center font-mono">{r.leaveCount}</td>
                    <td className="py-2 px-3 border-r border-slate-200 text-center font-mono text-rose-700 font-bold">
                      {r.absentCount}
                    </td>
                    <td className="py-2 px-3 text-center font-mono font-bold">
                      {r.rate}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 3. HOMEWORK SUMMARY REPORT */}
        {reportType === 'homework_summary' && (
          <div className="space-y-6">
            <div className="text-xs text-slate-500">
              彙整全班各科目作業之截止期限、已繳、缺交及完成率統計，協助任課教師與導師盤點學習成果。
            </div>

            <div className="space-y-4">
              {homeworkAnalytics.map((item) => (
                <div key={item.assignment.id} className="border border-slate-200 rounded-lg p-4 bg-slate-50/50">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-2 mb-3">
                    <div>
                      <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200 mr-2">
                        {item.assignment.subject}
                      </span>
                      <span className="text-sm font-bold text-slate-900">{item.assignment.title}</span>
                    </div>
                    <div className="text-xs text-slate-500 font-mono">
                      截止日：{item.assignment.dueDate} · 完成率：<b className="text-slate-900">{item.rate}%</b>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-2 text-xs mb-3">
                    <div className="bg-white p-2 rounded border border-slate-200">
                      <span className="text-slate-400">應繳：</span> <b>{item.total}</b> 人
                    </div>
                    <div className="bg-white p-2 rounded border border-slate-200">
                      <span className="text-emerald-600">已繳：</span> <b className="text-emerald-700">{item.submitted}</b> 人
                    </div>
                    <div className="bg-white p-2 rounded border border-slate-200">
                      <span className="text-rose-600">缺交：</span> <b className="text-rose-700">{item.missing}</b> 人
                    </div>
                    <div className="bg-white p-2 rounded border border-slate-200">
                      <span className="text-orange-600">待訂正：</span> <b className="text-orange-700">{item.correction}</b> 人
                    </div>
                  </div>

                  {item.missingStudents.length > 0 ? (
                    <div className="text-xs bg-rose-50/70 border border-rose-200 rounded p-2.5">
                      <span className="font-bold text-rose-800">缺交/待訂正名單：</span>
                      <span className="text-rose-700 ml-1">
                        {item.missingStudents
                          .map((s) => `#${s.seatNumber} ${s.name}`)
                          .join('、 ')}
                      </span>
                    </div>
                  ) : (
                    <div className="text-xs text-emerald-700 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>本項作業全班已全數繳交齊全！</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. STUDENT INDIVIDUAL PROFILE CARD */}
        {reportType === 'student_profile' && studentProfileData && (
          <div className="space-y-6">
            {/* Student Header */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-xl">
                  {selectedStudent.name.slice(0, 1)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-bold text-slate-900">{selectedStudent.name}</h3>
                    <span className="text-xs bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-mono">
                      座號：{selectedStudent.seatNumber} 號
                    </span>
                    <span className="text-xs text-slate-500 font-mono">學號：{selectedStudent.studentId}</span>
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    班級：{classroom.name} · 性別：{selectedStudent.gender === 'male' ? '男' : '女'} · 導師：{classroom.teacherName}
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="text-xs text-slate-400">總體出勤出席率</div>
                <div className="text-2xl font-bold text-slate-900 font-mono">{studentProfileData.attRate}%</div>
              </div>
            </div>

            {/* Attendance & Homework 2-column breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              {/* Left: Attendance overview */}
              <div className="border border-slate-200 rounded-lg p-4 space-y-3">
                <h4 className="font-bold text-slate-800 text-sm border-b pb-2">出缺勤診斷紀錄</h4>
                <div className="grid grid-cols-4 gap-2 text-center">
                  <div className="bg-slate-50 p-2 rounded">
                    <div className="text-slate-400">正常出席</div>
                    <div className="font-bold text-slate-800 text-base font-mono">{studentProfileData.present}</div>
                  </div>
                  <div className="bg-amber-50 p-2 rounded">
                    <div className="text-amber-700">遲到次數</div>
                    <div className="font-bold text-amber-800 text-base font-mono">{studentProfileData.late}</div>
                  </div>
                  <div className="bg-rose-50 p-2 rounded">
                    <div className="text-rose-700">缺席/曠課</div>
                    <div className="font-bold text-rose-800 text-base font-mono">{studentProfileData.absent}</div>
                  </div>
                  <div className="bg-sky-50 p-2 rounded">
                    <div className="text-sky-700">病事假</div>
                    <div className="font-bold text-sky-800 text-base font-mono">{studentProfileData.leave}</div>
                  </div>
                </div>
              </div>

              {/* Right: Missing homework alert */}
              <div className="border border-slate-200 rounded-lg p-4 space-y-3">
                <h4 className="font-bold text-slate-800 text-sm border-b pb-2">待繳/待訂正作業清單</h4>
                {studentProfileData.missingList.length > 0 ? (
                  <div className="space-y-1.5">
                    {studentProfileData.missingList.map((m) => (
                      <div key={m.assignment.id} className="p-2 rounded bg-rose-50 border border-rose-200 text-rose-900">
                        <div className="font-semibold">
                          [{m.assignment.subject}] {m.assignment.title}
                        </div>
                        <div className="text-[11px] text-rose-700">
                          截止日：{m.assignment.dueDate} · 狀態：{SUBMISSION_STATUS_MAP[m.submission.status]?.label}
                          {m.submission.feedback ? ` (${m.submission.feedback})` : ''}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-emerald-700 py-6 text-center">
                    <CheckCircle2 className="w-6 h-6 mx-auto mb-1 text-emerald-600" />
                    <span>本期所有作業皆已準時完成！</span>
                  </div>
                )}
              </div>
            </div>

            {/* Detailed Homework Table for this student */}
            <div>
              <h4 className="font-bold text-slate-800 text-sm mb-2">各科作業評量與繳交明細</h4>
              <table className="w-full text-left border-collapse text-xs border border-slate-200">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold">
                    <th className="py-2 px-3 border-r border-slate-200 w-20">科目</th>
                    <th className="py-2 px-3 border-r border-slate-200">作業名稱</th>
                    <th className="py-2 px-3 border-r border-slate-200 w-24">截止日期</th>
                    <th className="py-2 px-3 border-r border-slate-200 w-24">狀態</th>
                    <th className="py-2 px-3 border-r border-slate-200 w-16 text-center">得分</th>
                    <th className="py-2 px-3">任課老師評語與訂正要求</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {studentProfileData.studentSubmissions.map((item) => (
                    <tr key={item.assignment.id}>
                      <td className="py-2 px-3 border-r border-slate-200 font-semibold">{item.assignment.subject}</td>
                      <td className="py-2 px-3 border-r border-slate-200">{item.assignment.title}</td>
                      <td className="py-2 px-3 border-r border-slate-200 font-mono text-slate-500">
                        {item.assignment.dueDate}
                      </td>
                      <td className="py-2 px-3 border-r border-slate-200 font-medium">
                        {SUBMISSION_STATUS_MAP[item.status]?.label}
                      </td>
                      <td className="py-2 px-3 border-r border-slate-200 text-center font-mono font-bold">
                        {item.score !== undefined ? `${item.score}` : '-'}
                      </td>
                      <td className="py-2 px-3 text-slate-600">{item.feedback || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Feedback & Signatures */}
            <div className="pt-8 grid grid-cols-2 gap-8 text-xs text-slate-700">
              <div className="border border-slate-300 rounded p-4">
                <div className="font-bold mb-1">導師綜合評語：</div>
                <p className="text-slate-600 leading-relaxed min-h-[60px]">
                  學習態度積極，與同儕相處融洽。請持續保持良好的作息與預習習慣。
                </p>
                <div className="mt-4 text-right">導師簽名：{classroom.teacherName}</div>
              </div>

              <div className="border border-slate-300 rounded p-4">
                <div className="font-bold mb-1">學生自主檢視與簽名：</div>
                <div className="mt-12 border-b border-dashed border-slate-400" />
                <div className="mt-2 flex justify-between text-slate-500">
                  <span>學生簽名：＿＿＿＿＿＿</span>
                  <span>日期：____年____月____日</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
