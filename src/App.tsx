/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Classroom,
  Student,
  AttendanceRecord,
  Assignment,
  AssignmentSubmission,
  EmailTemplate,
  EmailSettings,
  EmailLog,
  AttendanceStatus,
  SubmissionStatus,
  NotificationType,
  TimetableSlot,
  UserAccount,
} from './types';
import {
  INITIAL_CLASSES,
  INITIAL_STUDENTS,
  INITIAL_ASSIGNMENTS,
  INITIAL_TEMPLATES,
  INITIAL_EMAIL_SETTINGS,
  INITIAL_EMAIL_LOGS,
  INITIAL_TIMETABLE_SLOTS,
  INITIAL_USERS,
  generateInitialAttendance,
  generateInitialSubmissions,
} from './data/mockData';
import { loadStorage, saveStorage } from './utils/helpers';
import { Header, ActiveTab } from './components/Header';
import { AttendanceView } from './components/AttendanceView';
import { QRCodeCheckinView } from './components/QRCodeCheckinView';
import { TimetableView } from './components/TimetableView';
import { HomeworkInventoryView } from './components/HomeworkInventoryView';
import { ReportCenterView } from './components/ReportCenterView';
import { EmailNoticeCenter } from './components/EmailNoticeCenter';
import { StudentRosterView } from './components/StudentRosterView';
import { MobileBottomNav } from './components/MobileBottomNav';
import { RandomPickerModal } from './components/RandomPickerModal';
import { ClassModal } from './components/ClassModal';
import { BackupModal } from './components/BackupModal';
import { UserAccountModal } from './components/UserAccountModal';
import { PWAInstallBanner } from './components/PWAInstallBanner';
import { OfflineIndicator } from './components/OfflineIndicator';
import { TodayScheduleReminder } from './components/TodayScheduleReminder';
import { TodayHomeworkProgress } from './components/TodayHomeworkProgress';

export default function App() {
  // 1. Core State with LocalStorage Persistence
  const [classes, setClasses] = useState<Classroom[]>(() =>
    loadStorage<Classroom[]>('classes', INITIAL_CLASSES)
  );

  const [currentClassId, setCurrentClassId] = useState<string>(() => {
    const savedClasses = loadStorage<Classroom[]>('classes', INITIAL_CLASSES);
    return savedClasses[0]?.id || 'class-802';
  });

  const [students, setStudents] = useState<Student[]>(() =>
    loadStorage<Student[]>('students', INITIAL_STUDENTS)
  );

  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(() =>
    loadStorage<AttendanceRecord[]>('attendance', generateInitialAttendance())
  );

  const [assignments, setAssignments] = useState<Assignment[]>(() =>
    loadStorage<Assignment[]>('assignments', INITIAL_ASSIGNMENTS)
  );

  const [submissions, setSubmissions] = useState<AssignmentSubmission[]>(() =>
    loadStorage<AssignmentSubmission[]>('submissions', generateInitialSubmissions())
  );

  const [templates, setTemplates] = useState<EmailTemplate[]>(() =>
    loadStorage<EmailTemplate[]>('templates', INITIAL_TEMPLATES)
  );

  const [emailSettings, setEmailSettings] = useState<EmailSettings>(() =>
    loadStorage<EmailSettings>('email_settings', INITIAL_EMAIL_SETTINGS)
  );

  const [emailLogs, setEmailLogs] = useState<EmailLog[]>(() =>
    loadStorage<EmailLog[]>('email_logs', INITIAL_EMAIL_LOGS)
  );

  const [timetableSlots, setTimetableSlots] = useState<TimetableSlot[]>(() =>
    loadStorage<TimetableSlot[]>('timetable_slots', INITIAL_TIMETABLE_SLOTS)
  );

  const [users, setUsers] = useState<UserAccount[]>(() =>
    loadStorage<UserAccount[]>('user_accounts', INITIAL_USERS)
  );

  const [currentUserId, setCurrentUserId] = useState<string>(() =>
    loadStorage<string>('current_user_id', INITIAL_USERS[0].id)
  );

  // 2. Navigation & UI state
  const [activeTab, setActiveTab] = useState<ActiveTab>('attendance');
  const [showPickerModal, setShowPickerModal] = useState<boolean>(false);
  const [showNewClassModal, setShowNewClassModal] = useState<boolean>(false);
  const [showBackupModal, setShowBackupModal] = useState<boolean>(false);
  const [showUserModal, setShowUserModal] = useState<boolean>(false);
  const [showInstallGuide, setShowInstallGuide] = useState<boolean>(false);

  // Cross-tab trigger state for Email dispatching
  const [prefilledEmailStudentIds, setPrefilledEmailStudentIds] = useState<string[]>([]);
  const [prefilledTriggerType, setPrefilledTriggerType] = useState<NotificationType>('absence_alert');

  // Sync to localStorage
  useEffect(() => saveStorage('classes', classes), [classes]);
  useEffect(() => saveStorage('students', students), [students]);
  useEffect(() => saveStorage('attendance', attendanceRecords), [attendanceRecords]);
  useEffect(() => saveStorage('assignments', assignments), [assignments]);
  useEffect(() => saveStorage('submissions', submissions), [submissions]);
  useEffect(() => saveStorage('templates', templates), [templates]);
  useEffect(() => saveStorage('email_settings', emailSettings), [emailSettings]);
  useEffect(() => saveStorage('email_logs', emailLogs), [emailLogs]);
  useEffect(() => saveStorage('timetable_slots', timetableSlots), [timetableSlots]);
  useEffect(() => saveStorage('user_accounts', users), [users]);
  useEffect(() => saveStorage('current_user_id', currentUserId), [currentUserId]);

  // Current Logged-in User
  const currentUser = useMemo(() => {
    return users.find((u) => u.id === currentUserId) || users[0] || INITIAL_USERS[0];
  }, [users, currentUserId]);

  // Current Classroom Object
  const currentClass = useMemo(() => {
    return classes.find((c) => c.id === currentClassId) || classes[0] || INITIAL_CLASSES[0];
  }, [classes, currentClassId]);

  // Current Class Students
  const classStudents = useMemo(() => {
    return students
      .filter((s) => s.classId === currentClass.id)
      .sort((a, b) => a.seatNumber - b.seatNumber);
  }, [students, currentClass.id]);

  // Current Class Assignments
  const classAssignments = useMemo(() => {
    return assignments.filter((a) => a.classId === currentClass.id);
  }, [assignments, currentClass.id]);

  // Current Class Attendance Records
  const classAttendanceRecords = useMemo(() => {
    return attendanceRecords.filter((r) => r.classId === currentClass.id);
  }, [attendanceRecords, currentClass.id]);

  // Handlers for Attendance
  const handleUpdateAttendanceRecord = (newRec: AttendanceRecord) => {
    setAttendanceRecords((prev) => {
      const idx = prev.findIndex((r) => r.id === newRec.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = newRec;
        return next;
      }
      return [newRec, ...prev];
    });
  };

  const handleBatchUpdateAttendance = (
    date: string,
    session: string,
    status: AttendanceStatus
  ) => {
    const updatedRecords = classStudents.map((s) => ({
      id: `att-${date}-${session}-${s.id}`,
      classId: currentClass.id,
      studentId: s.id,
      date,
      session,
      status,
      recordedAt: new Date().toISOString(),
    }));

    setAttendanceRecords((prev) => {
      const filtered = prev.filter(
        (r) => !(r.classId === currentClass.id && r.date === date && r.session === session)
      );
      return [...filtered, ...updatedRecords];
    });
  };

  // Handlers for Homework
  const handleAddAssignment = (newAssignment: Assignment) => {
    setAssignments((prev) => [newAssignment, ...prev]);
  };

  const handleUpdateSubmission = (newSub: AssignmentSubmission) => {
    setSubmissions((prev) => {
      const idx = prev.findIndex((s) => s.id === newSub.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = newSub;
        return next;
      }
      return [newSub, ...prev];
    });
  };

  const handleBatchUpdateSubmissions = (assignmentId: string, status: SubmissionStatus) => {
    const nowStr = new Date().toISOString().replace('T', ' ').slice(0, 16);
    const updatedSubs = classStudents.map((s) => {
      const existing = submissions.find(
        (sub) => sub.assignmentId === assignmentId && sub.studentId === s.id
      );
      return {
        id: existing ? existing.id : `sub-${assignmentId}-${s.id}`,
        assignmentId,
        studentId: s.id,
        status,
        score: existing?.score,
        scoreGrade: existing?.scoreGrade,
        feedback: existing?.feedback,
        submittedAt: status === 'submitted' ? existing?.submittedAt || nowStr : undefined,
      };
    });

    setSubmissions((prev) => {
      const filtered = prev.filter((s) => s.assignmentId !== assignmentId);
      return [...filtered, ...updatedSubs];
    });
  };

  // Switch to Email center with prefilled student queue
  const handleTriggerEmailForStudents = (
    studentIds: string[],
    triggerType: NotificationType
  ) => {
    setPrefilledEmailStudentIds(studentIds);
    setPrefilledTriggerType(triggerType);
    setActiveTab('emails');
  };

  // Student Roster Handlers
  const handleAddStudent = (newStudent: Student) => {
    setStudents((prev) => [...prev, newStudent]);
  };

  const handleUpdateStudent = (updatedStudent: Student) => {
    setStudents((prev) => prev.map((s) => (s.id === updatedStudent.id ? updatedStudent : s)));
  };

  const handleDeleteStudent = (studentId: string) => {
    setStudents((prev) => prev.filter((s) => s.id !== studentId));
  };

  const handleBatchImportStudents = (newStudents: Student[]) => {
    setStudents((prev) => [...prev, ...newStudents]);
  };

  const handleUpdateClassroom = (updatedClass: Classroom) => {
    setClasses((prev) => prev.map((c) => (c.id === updatedClass.id ? updatedClass : c)));
  };

  const handleAddClass = (newClass: Classroom) => {
    setClasses((prev) => [...prev, newClass]);
    setCurrentClassId(newClass.id);
  };

  // User Management Handlers
  const handleSwitchUser = (user: UserAccount) => {
    const updated = users.map((u) =>
      u.id === user.id
        ? {
            ...u,
            lastLoginAt: new Date().toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' }),
          }
        : u
    );
    setUsers(updated);
    setCurrentUserId(user.id);
  };

  const handleUpdateCurrentUser = (updatedUser: UserAccount) => {
    setUsers((prev) => prev.map((u) => (u.id === updatedUser.id ? updatedUser : u)));
  };

  const handleAddNewUser = (newUser: UserAccount) => {
    setUsers((prev) => [...prev, newUser]);
  };

  const handleDeleteUser = (userId: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== userId));
    if (currentUserId === userId) {
      const remaining = users.filter((u) => u.id !== userId);
      if (remaining.length > 0) {
        setCurrentUserId(remaining[0].id);
      }
    }
  };

  // Backup & Reset Handlers
  const handleExportBackup = () => {
    const backupData = {
      version: '1.3.0',
      exportedAt: new Date().toISOString(),
      classes,
      students,
      attendanceRecords,
      assignments,
      submissions,
      templates,
      emailSettings,
      emailLogs,
      timetableSlots,
      users,
    };
    const jsonStr = JSON.stringify(backupData, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ClassDesk_Backup_${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImportBackup = (data: any) => {
    if (data.classes) setClasses(data.classes);
    if (data.students) setStudents(data.students);
    if (data.attendanceRecords) setAttendanceRecords(data.attendanceRecords);
    if (data.assignments) setAssignments(data.assignments);
    if (data.submissions) setSubmissions(data.submissions);
    if (data.templates) setTemplates(data.templates);
    if (data.emailSettings) setEmailSettings(data.emailSettings);
    if (data.emailLogs) setEmailLogs(data.emailLogs);
    if (data.timetableSlots) setTimetableSlots(data.timetableSlots);
    if (data.users) setUsers(data.users);
  };

  const handleUpdateTimetableSlot = (slot: TimetableSlot) => {
    setTimetableSlots((prev) => {
      const idx = prev.findIndex(
        (s) =>
          s.id === slot.id ||
          (s.classId === slot.classId &&
            s.dayOfWeek === slot.dayOfWeek &&
            s.periodNumber === slot.periodNumber)
      );
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = slot;
        return next;
      }
      return [...prev, slot];
    });
  };

  const handleDeleteTimetableSlot = (slotId: string) => {
    setTimetableSlots((prev) => prev.filter((s) => s.id !== slotId));
  };

  const handleResetTimetable = () => {
    if (window.confirm(`確定要將 ${currentClass.name} 的課表重設回預設課表嗎？`)) {
      const otherClassSlots = timetableSlots.filter((s) => s.classId !== currentClass.id);
      const initialForCurrent = INITIAL_TIMETABLE_SLOTS.map((s) => ({
        ...s,
        id: `slot-${currentClass.id}-${s.dayOfWeek}-${s.periodNumber}`,
        classId: currentClass.id,
      }));
      setTimetableSlots([...otherClassSlots, ...initialForCurrent]);
    }
  };

  const handleResetToDemo = () => {
    setClasses(INITIAL_CLASSES);
    setCurrentClassId(INITIAL_CLASSES[0].id);
    setStudents(INITIAL_STUDENTS);
    setAttendanceRecords(generateInitialAttendance());
    setAssignments(INITIAL_ASSIGNMENTS);
    setSubmissions(generateInitialSubmissions());
    setTemplates(INITIAL_TEMPLATES);
    setEmailSettings(INITIAL_EMAIL_SETTINGS);
    setEmailLogs(INITIAL_EMAIL_LOGS);
    setTimetableSlots(INITIAL_TIMETABLE_SLOTS);
    setUsers(INITIAL_USERS);
    setCurrentUserId(INITIAL_USERS[0].id);
    localStorage.clear();
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* 3-Zone Clean Header */}
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        classes={classes}
        currentClass={currentClass}
        onSelectClass={(cls) => setCurrentClassId(cls.id)}
        onOpenNewClass={() => setShowNewClassModal(true)}
        onOpenPicker={() => setShowPickerModal(true)}
        onOpenBackup={() => setShowBackupModal(true)}
        currentUser={currentUser}
        onOpenUserAccount={() => setShowUserModal(true)}
        onOpenInstallGuide={() => setShowInstallGuide(true)}
      />

      {/* Main Viewport Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 pt-3 pb-28 md:pt-6 md:pb-8">
        {/* Today's Teaching Schedule Reminder Card */}
        <TodayScheduleReminder
          classroom={currentClass}
          timetableSlots={timetableSlots}
          onNavigateToTimetable={() => setActiveTab('timetable')}
          onNavigateToAttendance={() => setActiveTab('attendance')}
        />

        {/* Today's Homework Submission Progress Summary with Circular Ring */}
        <TodayHomeworkProgress
          classroom={currentClass}
          students={classStudents}
          assignments={classAssignments}
          submissions={submissions}
          timetableSlots={timetableSlots}
          onNavigateToHomework={() => setActiveTab('homework')}
          onTriggerEmailForMissing={(ids) =>
            handleTriggerEmailForStudents(ids, 'homework_reminder')
          }
        />

        {activeTab === 'attendance' && (
          <AttendanceView
            classroom={currentClass}
            students={classStudents}
            attendanceRecords={classAttendanceRecords}
            onUpdateRecord={handleUpdateAttendanceRecord}
            onBatchUpdateStatus={handleBatchUpdateAttendance}
            onTriggerEmailForStudents={(ids, trigger) =>
              handleTriggerEmailForStudents(ids, trigger)
            }
            onOpenQrScanner={() => setActiveTab('qrcode')}
          />
        )}

        {activeTab === 'qrcode' && (
          <QRCodeCheckinView
            classroom={currentClass}
            students={classStudents}
            attendanceRecords={classAttendanceRecords}
            onUpdateRecord={handleUpdateAttendanceRecord}
            onBatchUpdateStatus={handleBatchUpdateAttendance}
            onSwitchToAttendance={() => setActiveTab('attendance')}
          />
        )}

        {activeTab === 'timetable' && (
          <TimetableView
            classroom={currentClass}
            timetableSlots={timetableSlots}
            onUpdateSlot={handleUpdateTimetableSlot}
            onDeleteSlot={handleDeleteTimetableSlot}
            onResetTimetable={handleResetTimetable}
            onNavigateToAttendance={(_session) => {
              setActiveTab('attendance');
            }}
            onNavigateToQr={(_session) => {
              setActiveTab('qrcode');
            }}
          />
        )}

        {activeTab === 'homework' && (
          <HomeworkInventoryView
            classroom={currentClass}
            students={classStudents}
            assignments={classAssignments}
            submissions={submissions}
            onAddAssignment={handleAddAssignment}
            onUpdateSubmission={handleUpdateSubmission}
            onBatchUpdateSubmissions={handleBatchUpdateSubmissions}
            onTriggerEmailForStudents={(ids, trigger) =>
              handleTriggerEmailForStudents(ids, trigger)
            }
          />
        )}

        {activeTab === 'reports' && (
          <ReportCenterView
            classroom={currentClass}
            students={classStudents}
            attendanceRecords={classAttendanceRecords}
            assignments={classAssignments}
            submissions={submissions}
          />
        )}

        {activeTab === 'emails' && (
          <EmailNoticeCenter
            classroom={currentClass}
            students={classStudents}
            attendanceRecords={classAttendanceRecords}
            assignments={classAssignments}
            submissions={submissions}
            templates={templates}
            emailSettings={emailSettings}
            emailLogs={emailLogs}
            onUpdateTemplate={(updated) =>
              setTemplates((prev) => prev.map((t) => (t.id === updated.id ? updated : t)))
            }
            onUpdateEmailSettings={setEmailSettings}
            onAddEmailLog={(log) => setEmailLogs((prev) => [log, ...prev])}
            initialSelectedStudentIds={prefilledEmailStudentIds}
            initialTriggerType={prefilledTriggerType}
          />
        )}

        {activeTab === 'roster' && (
          <StudentRosterView
            classroom={currentClass}
            students={classStudents}
            onAddStudent={handleAddStudent}
            onUpdateStudent={handleUpdateStudent}
            onDeleteStudent={handleDeleteStudent}
            onBatchImportStudents={handleBatchImportStudents}
            onUpdateClassroom={handleUpdateClassroom}
          />
        )}
      </main>

      {/* Global Modals */}
      <RandomPickerModal
        isOpen={showPickerModal}
        onClose={() => setShowPickerModal(false)}
        students={classStudents}
      />

      <ClassModal
        isOpen={showNewClassModal}
        onClose={() => setShowNewClassModal(false)}
        onAddClass={handleAddClass}
      />

      <BackupModal
        isOpen={showBackupModal}
        onClose={() => setShowBackupModal(false)}
        onExportBackup={handleExportBackup}
        onImportBackup={handleImportBackup}
        onResetToDemo={handleResetToDemo}
      />

      {/* User Accounts & Profile Management Modal */}
      <UserAccountModal
        isOpen={showUserModal}
        onClose={() => setShowUserModal(false)}
        currentUser={currentUser}
        users={users}
        classes={classes}
        onSwitchUser={handleSwitchUser}
        onUpdateCurrentUser={handleUpdateCurrentUser}
        onAddNewUser={handleAddNewUser}
        onDeleteUser={handleDeleteUser}
      />

      {/* Mobile Sticky Bottom Navigation */}
      <MobileBottomNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
        classes={classes}
        currentClass={currentClass}
        onSelectClass={(c) => setCurrentClassId(c.id)}
        onOpenNewClass={() => setShowNewClassModal(true)}
        onOpenPicker={() => setShowPickerModal(true)}
        onOpenBackup={() => setShowBackupModal(true)}
        currentUser={currentUser}
        onOpenUserAccount={() => setShowUserModal(true)}
        onOpenInstallGuide={() => setShowInstallGuide(true)}
      />

      {/* PWA Mobile Installation Banner & iOS Guide */}
      <PWAInstallBanner
        forceOpenGuide={showInstallGuide}
        onCloseGuide={() => setShowInstallGuide(false)}
      />

      {/* Connectivity & Offline Status Indicator */}
      <OfflineIndicator />
    </div>
  );
}
