import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Classroom, Student, AttendanceRecord, AttendanceStatus } from '../types';
import { ATTENDANCE_STATUS_MAP, SESSIONS_LIST } from '../utils/helpers';
import { playSuccessChime, playWarningBeep, triggerHaptic } from '../utils/sound';
import { Html5Qrcode, Html5QrcodeCameraScanConfig } from 'html5-qrcode';
import QRCode from 'qrcode';
import {
  QrCode,
  Camera,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  UserCheck,
  Printer,
  Sparkles,
  Search,
  Clock,
  ExternalLink,
  Volume2,
  VolumeX,
  Smartphone,
  Maximize2,
  Minimize2,
  UserX,
} from 'lucide-react';

interface Props {
  classroom: Classroom;
  students: Student[];
  attendanceRecords: AttendanceRecord[];
  onUpdateRecord: (record: AttendanceRecord) => void;
  onBatchUpdateStatus: (date: string, session: string, status: AttendanceStatus) => void;
  onSwitchToAttendance: () => void;
}

type CheckinMode = 'scanner' | 'projector' | 'badges';

interface RecentCheckinItem {
  id: string;
  student: Student;
  timestamp: string;
  status: AttendanceStatus;
  isNew?: boolean;
}

export const QRCodeCheckinView: React.FC<Props> = ({
  classroom,
  students,
  attendanceRecords,
  onUpdateRecord,
  onSwitchToAttendance,
}) => {
  const [activeMode, setActiveMode] = useState<CheckinMode>('scanner');
  const [selectedDate, setSelectedDate] = useState<string>('2026-09-23');
  const [selectedSession, setSelectedSession] = useState<string>('早自習');
  const [targetStatus, setTargetStatus] = useState<AttendanceStatus>('present');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Scanner state
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [availableCameras, setAvailableCameras] = useState<Array<{ id: string; label: string }>>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string>('');
  const [lastScannedStudent, setLastScannedStudent] = useState<{
    student: Student;
    time: string;
    status: AttendanceStatus;
  } | null>(null);
  const [recentFeed, setRecentFeed] = useState<RecentCheckinItem[]>([]);
  const [manualInput, setManualInput] = useState<string>('');
  const [manualFeedback, setManualFeedback] = useState<{ msg: string; isError?: boolean } | null>(null);

  // Big screen projector state
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [projectorQrUrl, setProjectorQrUrl] = useState<string>('');
  const [showStudentSelfModal, setShowStudentSelfModal] = useState<boolean>(false);
  const [selfCheckinStudentId, setSelfCheckinStudentId] = useState<string>('');

  // Badges state
  const [badgeQrs, setBadgeQrs] = useState<Record<string, string>>({});
  const [badgeSearch, setBadgeSearch] = useState<string>('');
  const [selectedSingleBadge, setSelectedSingleBadge] = useState<Student | null>(null);

  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const lastScanTimestampRef = useRef<Record<string, number>>({});
  const scannerContainerId = 'qr-reader-container';

  // Calculate current attendance metrics
  const sessionRecords = useMemo(() => {
    return attendanceRecords.filter(
      (r) => r.date === selectedDate && r.session === selectedSession && r.classId === classroom.id
    );
  }, [attendanceRecords, selectedDate, selectedSession, classroom.id]);

  const recordMap = useMemo(() => {
    const map = new Map<string, AttendanceRecord>();
    sessionRecords.forEach((r) => map.set(r.studentId, r));
    return map;
  }, [sessionRecords]);

  const studentStatusList = useMemo(() => {
    return students.map((s) => {
      const rec = recordMap.get(s.id);
      return {
        student: s,
        status: rec ? rec.status : ('absent' as AttendanceStatus),
        record: rec,
      };
    });
  }, [students, recordMap]);

  const presentCount = studentStatusList.filter((item) => item.status === 'present').length;
  const lateCount = studentStatusList.filter((item) => item.status === 'late').length;
  const absentCount = studentStatusList.filter((item) => item.status === 'absent').length;
  const leaveCount = studentStatusList.filter((item) =>
    ['sick_leave', 'personal_leave', 'official_leave', 'bereavement'].includes(item.status)
  ).length;

  const totalCount = students.length;
  const checkedInCount = presentCount + lateCount;
  const checkinRate = totalCount > 0 ? Math.round((checkedInCount / totalCount) * 100) : 0;

  // Unchecked students (absent or not recorded)
  const uncheckedStudents = useMemo(() => {
    return studentStatusList.filter((item) => item.status === 'absent');
  }, [studentStatusList]);

  // Generate badges QR codes
  useEffect(() => {
    const generateAllBadges = async () => {
      const qrMap: Record<string, string> = {};
      for (const s of students) {
        try {
          const payload = JSON.stringify({
            app: 'classdesk',
            classId: classroom.id,
            studentId: s.studentId,
            seat: s.seatNumber,
            name: s.name,
          });
          const dataUrl = await QRCode.toDataURL(payload, {
            width: 280,
            margin: 2,
            color: { dark: '#0f172a', light: '#ffffff' },
          });
          qrMap[s.id] = dataUrl;
        } catch {
          // ignore
        }
      }
      setBadgeQrs(qrMap);
    };

    if (students.length > 0) {
      generateAllBadges();
    }
  }, [students, classroom.id]);

  // Generate projector QR code
  useEffect(() => {
    const generateProjectorQr = async () => {
      const payload = JSON.stringify({
        action: 'classdesk_self_checkin',
        classId: classroom.id,
        className: classroom.name,
        date: selectedDate,
        session: selectedSession,
      });
      try {
        const url = await QRCode.toDataURL(payload, {
          width: 400,
          margin: 2,
          color: { dark: '#1e1b4b', light: '#ffffff' },
        });
        setProjectorQrUrl(url);
      } catch {
        // ignore
      }
    };
    generateProjectorQr();
  }, [classroom.id, classroom.name, selectedDate, selectedSession]);

  // Process check-in for a matched student
  const performCheckIn = (
    student: Student,
    statusToSet: AttendanceStatus = targetStatus,
    source: 'camera' | 'manual' | 'self' = 'camera'
  ) => {
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

    const existing = recordMap.get(student.id);
    const newRecord: AttendanceRecord = {
      id: existing ? existing.id : `rec-${selectedDate}-${selectedSession}-${student.id}`,
      classId: classroom.id,
      studentId: student.id,
      date: selectedDate,
      session: selectedSession,
      status: statusToSet,
      lateMinutes: statusToSet === 'late' ? 5 : undefined,
      remark: source === 'camera' ? 'QR碼掃描報到' : source === 'self' ? '學生自主掃碼' : '手動快捷報到',
      recordedAt: timeStr,
    };

    onUpdateRecord(newRecord);

    // Audio & Haptic
    if (soundEnabled) {
      playSuccessChime();
    }
    triggerHaptic('success');

    // UI feedback
    setLastScannedStudent({
      student,
      time: timeStr,
      status: statusToSet,
    });

    setRecentFeed((prev) => [
      {
        id: `${student.id}-${Date.now()}`,
        student,
        timestamp: timeStr,
        status: statusToSet,
        isNew: true,
      },
      ...prev.slice(0, 19),
    ]);
  };

  // Decode QR content and match student
  const handleDecodedText = (decodedText: string) => {
    const trimmed = decodedText.trim();

    // Prevent spam scanning within 3 seconds for the same text
    const nowMs = Date.now();
    const lastScan = lastScanTimestampRef.current[trimmed] || 0;
    if (nowMs - lastScan < 3000) {
      return;
    }
    lastScanTimestampRef.current[trimmed] = nowMs;

    let matchedStudent: Student | undefined;

    // 1. Check if valid JSON format
    if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
      try {
        const parsed = JSON.parse(trimmed);
        if (parsed.studentId) {
          matchedStudent = students.find(
            (s) => s.studentId.toLowerCase() === String(parsed.studentId).toLowerCase()
          );
        }
        if (!matchedStudent && parsed.seat) {
          matchedStudent = students.find((s) => s.seatNumber === Number(parsed.seat));
        }
        if (!matchedStudent && parsed.name) {
          matchedStudent = students.find((s) => s.name === parsed.name);
        }
      } catch {
        // Fallback to text matching
      }
    }

    // 2. Prefix formats like CD:STUDENT:80201 or STUDENT:80201 or ID:80201
    if (!matchedStudent) {
      const parts = trimmed.split(':');
      const identifier = parts[parts.length - 1].trim();

      matchedStudent = students.find(
        (s) =>
          s.studentId.toLowerCase() === identifier.toLowerCase() ||
          s.name === identifier ||
          String(s.seatNumber) === identifier
      );
    }

    // 3. Direct match with studentId or seatNumber or name
    if (!matchedStudent) {
      matchedStudent = students.find(
        (s) =>
          s.studentId.toLowerCase() === trimmed.toLowerCase() ||
          String(s.seatNumber) === trimmed ||
          s.name === trimmed
      );
    }

    if (matchedStudent) {
      performCheckIn(matchedStudent, targetStatus, 'camera');
    } else {
      if (soundEnabled) {
        playWarningBeep();
      }
      triggerHaptic('warning');
      setManualFeedback({
        msg: `未識別到對應學生 (${trimmed.slice(0, 20)})`,
        isError: true,
      });
      setTimeout(() => setManualFeedback(null), 3000);
    }
  };

  // Start Scanner
  const startScanner = async () => {
    setCameraError(null);
    try {
      if (!html5QrCodeRef.current) {
        html5QrCodeRef.current = new Html5Qrcode(scannerContainerId);
      }

      // Query cameras if not populated
      const devices = await Html5Qrcode.getCameras();
      if (devices && devices.length > 0) {
        setAvailableCameras(devices);
        const preferredCamera = selectedCameraId || devices[devices.length - 1].id;
        setSelectedCameraId(preferredCamera);

        const config: Html5QrcodeCameraScanConfig = {
          fps: 10,
          qrbox: { width: 240, height: 240 },
          aspectRatio: 1.0,
        };

        await html5QrCodeRef.current.start(
          preferredCamera,
          config,
          (text) => handleDecodedText(text),
          () => {
            // Frame error - ignore
          }
        );
        setIsScanning(true);
      } else {
        setCameraError('未偵測到可用的鏡頭設備，請改用手動或條碼槍輸入。');
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.warn('Camera start error:', message);
      setCameraError('鏡頭啟動失敗或權限受限。請確認瀏覽器已允許攝影機存取，或使用手動座號報到。');
      setIsScanning(false);
    }
  };

  // Stop Scanner
  const stopScanner = async () => {
    if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
      try {
        await html5QrCodeRef.current.stop();
      } catch (err) {
        console.warn('Camera stop error:', err);
      }
    }
    setIsScanning(false);
  };

  // Cleanup on unmount or mode switch
  useEffect(() => {
    if (activeMode === 'scanner') {
      startScanner();
    } else {
      stopScanner();
    }

    return () => {
      if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
        html5QrCodeRef.current.stop().catch(() => {});
      }
    };
  }, [activeMode, selectedCameraId]);

  // Flip Camera
  const handleFlipCamera = async () => {
    if (availableCameras.length < 2) return;
    const currentIdx = availableCameras.findIndex((c) => c.id === selectedCameraId);
    const nextIdx = (currentIdx + 1) % availableCameras.length;
    const nextCamera = availableCameras[nextIdx];

    await stopScanner();
    setSelectedCameraId(nextCamera.id);
  };

  // Manual Quick Input Handler (Supports Barcode scanner input / Enter key)
  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = manualInput.trim();
    if (!query) return;

    const matched = students.find(
      (s) =>
        s.studentId.toLowerCase() === query.toLowerCase() ||
        String(s.seatNumber) === query ||
        s.name === query
    );

    if (matched) {
      performCheckIn(matched, targetStatus, 'manual');
      setManualFeedback({ msg: `座號 ${matched.seatNumber} ${matched.name} 報到成功！` });
      setManualInput('');
      setTimeout(() => setManualFeedback(null), 3000);
    } else {
      if (soundEnabled) playWarningBeep();
      triggerHaptic('warning');
      setManualFeedback({ msg: `找不到學生「${query}」，請確認座號或學號。`, isError: true });
      setTimeout(() => setManualFeedback(null), 3000);
    }
  };

  // Filtered badges for printing / preview
  const filteredStudents = useMemo(() => {
    if (!badgeSearch.trim()) return students;
    const q = badgeSearch.trim().toLowerCase();
    return students.filter(
      (s) => s.name.toLowerCase().includes(q) || s.studentId.toLowerCase().includes(q) || String(s.seatNumber) === q
    );
  }, [students, badgeSearch]);

  return (
    <div className="space-y-6 pb-20 md:pb-12">
      {/* Top Banner & Mode Switcher */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs shrink-0">
              <QrCode className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold text-slate-900">QR Code 智慧報到中心</h2>
                <span className="px-2 py-0.5 text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-md">
                  手機/平板優化
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                支援手機相機即時刷讀、教室大螢幕動態簽到及全班專屬數位簽到卡列印
              </p>
            </div>
          </div>

          {/* Mode Switch Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl self-start lg:self-auto overflow-x-auto max-w-full">
            <button
              onClick={() => setActiveMode('scanner')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                activeMode === 'scanner'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Camera className="w-4 h-4" />
              <span>相機即時掃描</span>
            </button>

            <button
              onClick={() => setActiveMode('projector')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                activeMode === 'projector'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Maximize2 className="w-4 h-4" />
              <span>大螢幕投影簽到</span>
            </button>

            <button
              onClick={() => setActiveMode('badges')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                activeMode === 'badges'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Printer className="w-4 h-4" />
              <span>學生簽到名牌 ({students.length})</span>
            </button>
          </div>
        </div>

        {/* Global Control Bar: Date & Session Selector */}
        <div className="mt-5 pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div>
            <label className="block text-slate-500 font-medium mb-1">報到日期</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-800 focus:bg-white focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-slate-500 font-medium mb-1">簽到節次</label>
            <select
              value={selectedSession}
              onChange={(e) => setSelectedSession(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-800 focus:bg-white focus:ring-1 focus:ring-indigo-500"
            >
              {SESSIONS_LIST.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-500 font-medium mb-1">刷入標記狀態</label>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={() => setTargetStatus('present')}
                className={`px-2.5 py-2 rounded-lg font-semibold text-center border transition-all ${
                  targetStatus === 'present'
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                ✓ 出席 (準時)
              </button>
              <button
                type="button"
                onClick={() => setTargetStatus('late')}
                className={`px-2.5 py-2 rounded-lg font-semibold text-center border transition-all ${
                  targetStatus === 'late'
                    ? 'bg-amber-600 text-white border-amber-600 shadow-2xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                ⏱ 遲到
              </button>
            </div>
          </div>

          <div className="flex items-end justify-between sm:justify-end gap-2">
            <button
              type="button"
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`flex items-center gap-1.5 px-3 py-2 border rounded-lg transition-colors ${
                soundEnabled
                  ? 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100'
                  : 'bg-slate-100 text-slate-500 border-slate-200'
              }`}
              title="開關掃讀音效"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              <span>{soundEnabled ? '音效開啟' : '靜音'}</span>
            </button>

            <button
              onClick={onSwitchToAttendance}
              className="flex items-center gap-1.5 px-3 py-2 text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg font-medium transition-colors"
            >
              <span>查看完整點名簿</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mode 1: Live Scanner View */}
      {activeMode === 'scanner' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Camera Viewport & Controls (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-2xs">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      isScanning ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'
                    }`}
                  />
                  <span className="font-bold text-slate-900 text-sm">
                    {isScanning ? '相機掃讀中（向鏡頭出示學生證或QR碼）' : '相機未啟動'}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {availableCameras.length > 1 && (
                    <button
                      onClick={handleFlipCamera}
                      className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg transition-colors"
                      title="切換前/後鏡頭"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>翻轉鏡頭</span>
                    </button>
                  )}

                  <button
                    onClick={isScanning ? stopScanner : startScanner}
                    className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
                      isScanning
                        ? 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
                        : 'bg-indigo-600 text-white hover:bg-indigo-700'
                    }`}
                  >
                    {isScanning ? '暫停鏡頭' : '啟動鏡頭'}
                  </button>
                </div>
              </div>

              {/* Viewport Box */}
              <div className="relative w-full rounded-xl overflow-hidden bg-slate-900 aspect-square sm:aspect-[4/3] flex items-center justify-center border border-slate-800 shadow-inner">
                {/* Scanner container for html5-qrcode */}
                <div
                  id={scannerContainerId}
                  className="w-full h-full [&_video]:object-cover [&_video]:w-full [&_video]:h-full"
                />

                {/* Overlaid scanning target box */}
                {isScanning && (
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                    <div className="w-56 h-56 sm:w-64 sm:h-64 border-2 border-indigo-400 rounded-2xl relative shadow-[0_0_0_9999px_rgba(15,23,42,0.45)]">
                      {/* Corner Accents */}
                      <span className="absolute -top-1 -left-1 w-5 h-5 border-t-4 border-l-4 border-emerald-400 rounded-tl" />
                      <span className="absolute -top-1 -right-1 w-5 h-5 border-t-4 border-r-4 border-emerald-400 rounded-tr" />
                      <span className="absolute -bottom-1 -left-1 w-5 h-5 border-b-4 border-l-4 border-emerald-400 rounded-bl" />
                      <span className="absolute -bottom-1 -right-1 w-5 h-5 border-b-4 border-r-4 border-emerald-400 rounded-br" />

                      {/* Animated laser scan line */}
                      <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_8px_#34d399] animate-[bounce_2.2s_infinite]" />
                    </div>
                  </div>
                )}

                {/* Camera error or stopped overlay */}
                {(!isScanning || cameraError) && (
                  <div className="absolute inset-0 bg-slate-900/90 flex flex-col items-center justify-center p-6 text-center text-white z-10">
                    <Camera className="w-12 h-12 text-slate-500 mb-3" />
                    {cameraError ? (
                      <div className="max-w-xs space-y-2">
                        <p className="text-xs text-rose-300 font-medium">{cameraError}</p>
                        <p className="text-[11px] text-slate-400">
                          您仍可直接在下方「手動快速刷入」輸入座號或使用 USB/藍芽掃描槍完成點名！
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <p className="text-sm font-semibold">鏡頭已暫停</p>
                        <button
                          onClick={startScanner}
                          className="px-4 py-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
                        >
                          重新開啟鏡頭
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Instant Success Flash Toast */}
              {lastScannedStudent && (
                <div className="mt-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between animate-in fade-in zoom-in-95 duration-200">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-black text-sm">
                      #{lastScannedStudent.student.seatNumber}
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                        <span>{lastScannedStudent.student.name}</span>
                        <span className="px-2 py-0.5 text-[11px] font-semibold bg-emerald-100 text-emerald-800 rounded-md">
                          {ATTENDANCE_STATUS_MAP[lastScannedStudent.status]?.short || '已出席'}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        學號：{lastScannedStudent.student.studentId} · 報到時間：{lastScannedStudent.time}
                      </div>
                    </div>
                  </div>
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                </div>
              )}

              {/* Manual quick input / USB Barcode scanner input */}
              <div className="mt-4 pt-4 border-t border-slate-100">
                <form onSubmit={handleManualSubmit} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                      <span>快速鍵盤 / 掃碼槍手動刷入</span>
                    </label>
                    <span className="text-[11px] text-slate-400">支援座號 (如 1) 或學號</span>
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={manualInput}
                      onChange={(e) => setManualInput(e.target.value)}
                      placeholder="輸入座號或學號後按 Enter (或由條碼槍感應)..."
                      className="flex-1 px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50 focus:bg-white"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-lg transition-colors shadow-2xs whitespace-nowrap"
                    >
                      手動刷入
                    </button>
                  </div>

                  {manualFeedback && (
                    <div
                      className={`text-xs p-2 rounded-lg font-medium flex items-center gap-1.5 ${
                        manualFeedback.isError
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      }`}
                    >
                      {manualFeedback.isError ? (
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                      ) : (
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                      )}
                      <span>{manualFeedback.msg}</span>
                    </div>
                  )}
                </form>
              </div>
            </div>
          </div>

          {/* Right Column: Live Metrics & Recent Stream (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            {/* Real-time Attendance Stats Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">即時報到進度</h3>
                  <p className="text-xs text-slate-400">{selectedDate} · {selectedSession}</p>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black text-indigo-600">{checkinRate}%</span>
                  <span className="text-xs text-slate-400 block">已到率</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-full transition-all duration-300"
                  style={{ width: `${checkinRate}%` }}
                />
              </div>

              {/* Mini Stats 4-Grid */}
              <div className="grid grid-cols-4 gap-2 text-center">
                <div className="p-2 bg-emerald-50 rounded-lg border border-emerald-100">
                  <div className="text-xs text-emerald-700 font-medium">出席</div>
                  <div className="text-lg font-bold text-emerald-800">{presentCount}</div>
                </div>
                <div className="p-2 bg-amber-50 rounded-lg border border-amber-100">
                  <div className="text-xs text-amber-700 font-medium">遲到</div>
                  <div className="text-lg font-bold text-amber-800">{lateCount}</div>
                </div>
                <div className="p-2 bg-rose-50 rounded-lg border border-rose-100">
                  <div className="text-xs text-rose-700 font-medium">未到</div>
                  <div className="text-lg font-bold text-rose-800">{absentCount}</div>
                </div>
                <div className="p-2 bg-sky-50 rounded-lg border border-sky-100">
                  <div className="text-xs text-sky-700 font-medium">請假</div>
                  <div className="text-lg font-bold text-sky-800">{leaveCount}</div>
                </div>
              </div>

              {/* Unchecked Students Quick List */}
              {uncheckedStudents.length > 0 ? (
                <div className="pt-3 border-t border-slate-100">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-rose-600 flex items-center gap-1">
                      <UserX className="w-3.5 h-3.5" />
                      <span>尚未報到同學 ({uncheckedStudents.length}人)</span>
                    </span>
                    <span className="text-[11px] text-slate-400">點擊姓名可快速補登</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1">
                    {uncheckedStudents.map(({ student }) => (
                      <button
                        key={student.id}
                        onClick={() => performCheckIn(student, 'present', 'manual')}
                        className="px-2 py-1 text-xs font-medium bg-rose-50 text-rose-700 hover:bg-emerald-50 hover:text-emerald-800 border border-rose-200 hover:border-emerald-300 rounded-md transition-colors"
                        title="點擊直接標記為出席"
                      >
                        #{student.seatNumber} {student.name}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-center text-xs text-emerald-800 font-medium flex items-center justify-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>全班同學皆已完成簽到！</span>
                </div>
              )}
            </div>

            {/* Live Checkin Activity Feed */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-indigo-600" />
                  <span>即時報到紀錄流水</span>
                </h3>
                <span className="text-[11px] text-slate-400">最新 {recentFeed.length} 筆</span>
              </div>

              {recentFeed.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-xs">
                  尚無刷碼紀錄，向鏡頭出示 QR 碼或手動刷入即可啟動。
                </div>
              ) : (
                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {recentFeed.map((item) => (
                    <div
                      key={item.id}
                      className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center font-mono text-[11px]">
                          {item.student.seatNumber}
                        </span>
                        <div>
                          <div className="font-semibold text-slate-800">{item.student.name}</div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            學號：{item.student.studentId} · {item.timestamp}
                          </div>
                        </div>
                      </div>

                      <span
                        className={`px-2 py-0.5 text-[11px] font-semibold rounded-md ${
                          item.status === 'present'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {ATTENDANCE_STATUS_MAP[item.status]?.short || '出席'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Mode 2: Classroom Big Screen Projector & Student Self Check-in */}
      {activeMode === 'projector' && (
        <div
          className={`bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs text-center space-y-6 ${
            isFullscreen ? 'fixed inset-0 z-50 overflow-y-auto p-8 rounded-none' : ''
          }`}
        >
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="text-left">
              <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
                Classroom Projector Mode
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                {classroom.name} 課堂即時報到 QR Code
              </h3>
              <p className="text-xs text-slate-500">
                投影至教室黑板或智慧白板，學生使用手機相機掃描即可立即完成報到
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowStudentSelfModal(true)}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-colors"
              >
                <Smartphone className="w-4 h-4" />
                <span>學生手機模擬報到</span>
              </button>

              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="p-2 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                title={isFullscreen ? '結束全螢幕' : '全螢幕投影'}
              >
                {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Large Projector QR Card */}
          <div className="max-w-md mx-auto bg-slate-50 border-2 border-indigo-200/80 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
            <div className="text-sm font-semibold text-slate-700 flex items-center justify-center gap-2">
              <Clock className="w-4 h-4 text-indigo-600" />
              <span>{selectedDate} · {selectedSession}</span>
            </div>

            {projectorQrUrl ? (
              <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs inline-block">
                <img
                  src={projectorQrUrl}
                  alt="Classroom Check-in QR"
                  className="w-64 h-64 sm:w-72 sm:h-72 object-contain mx-auto"
                />
              </div>
            ) : (
              <div className="w-64 h-64 bg-slate-200 animate-pulse rounded-2xl mx-auto" />
            )}

            <div className="space-y-1">
              <p className="text-sm font-bold text-slate-900">手機開啟相機鏡頭對準上方 QR 碼</p>
              <p className="text-xs text-slate-500">
                或由導師開啟「相機即時掃描」直接感應學生名牌
              </p>
            </div>

            {/* Quick rate indicator on big screen */}
            <div className="pt-3 border-t border-slate-200 flex items-center justify-around text-xs">
              <div>
                <span className="text-slate-400 block">應到人數</span>
                <span className="text-lg font-bold text-slate-800">{totalCount} 人</span>
              </div>
              <div>
                <span className="text-slate-400 block">已報到</span>
                <span className="text-lg font-bold text-emerald-600">{checkedInCount} 人</span>
              </div>
              <div>
                <span className="text-slate-400 block">目前報到率</span>
                <span className="text-lg font-bold text-indigo-600">{checkinRate}%</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mode 3: Student QR Cards / Badges Generator & Printing */}
      {activeMode === 'badges' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-2xs no-print">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h3 className="font-bold text-slate-900 text-base">學生專屬 QR 簽到卡與數位名牌</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  可列印裁切作為桌上名牌、學生證背面貼紙或數位證件，點名時向鏡頭出示即可秒簽到
                </p>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="搜尋座號或姓名..."
                    value={badgeSearch}
                    onChange={(e) => setBadgeSearch(e.target.value)}
                    className="pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-lg transition-colors shadow-2xs"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>友善列印 A4 名牌</span>
                </button>
              </div>
            </div>
          </div>

          {/* Printable Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 print:grid-cols-2 print:gap-4">
            {filteredStudents.map((stu) => {
              const qrUrl = badgeQrs[stu.id];
              return (
                <div
                  key={stu.id}
                  className="bg-white rounded-2xl border-2 border-slate-200 p-4 shadow-2xs hover:border-indigo-300 transition-all flex flex-col items-center text-center relative overflow-hidden group print:border-slate-400 print:shadow-none print:break-inside-avoid"
                >
                  {/* Card Header */}
                  <div className="w-full flex items-center justify-between pb-2 border-b border-slate-100 text-[11px] text-slate-400">
                    <span>{classroom.schoolName}</span>
                    <span className="font-semibold text-indigo-600">{classroom.name}</span>
                  </div>

                  {/* QR Code image */}
                  <div className="my-3 p-2 bg-slate-50 rounded-xl border border-slate-200">
                    {qrUrl ? (
                      <img
                        src={qrUrl}
                        alt={`${stu.name} QR`}
                        className="w-36 h-36 object-contain"
                      />
                    ) : (
                      <div className="w-36 h-36 bg-slate-100 animate-pulse rounded-lg" />
                    )}
                  </div>

                  {/* Student Details */}
                  <div className="space-y-0.5">
                    <div className="text-xs font-mono text-slate-400">
                      座號 <span className="text-sm font-black text-slate-800">#{stu.seatNumber}</span>
                    </div>
                    <div className="text-base font-bold text-slate-900">{stu.name}</div>
                    <div className="text-[11px] font-mono text-slate-500">學號：{stu.studentId}</div>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-100 w-full text-[10px] text-slate-400 flex items-center justify-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                    <span>出勤點名專用 QR 證</span>
                  </div>

                  {/* Quick Action Button for single student */}
                  <button
                    onClick={() => setSelectedSingleBadge(stu)}
                    className="no-print mt-2 w-full py-1 text-[11px] font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors opacity-90 group-hover:opacity-100"
                  >
                    檢視大圖 / 立即刷入
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modal: Single Student QR Zoom & Check-in test */}
      {selectedSingleBadge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-2xs p-4 no-print">
          <div className="bg-white rounded-3xl shadow-xl border border-slate-200 max-w-sm w-full p-6 text-center space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm">數位簽到卡詳情</h3>
              <button
                onClick={() => setSelectedSingleBadge(null)}
                className="text-slate-400 hover:text-slate-600 text-sm"
              >
                ✕
              </button>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 inline-block">
              {badgeQrs[selectedSingleBadge.id] && (
                <img
                  src={badgeQrs[selectedSingleBadge.id]}
                  alt="Student QR Large"
                  className="w-52 h-52 object-contain mx-auto"
                />
              )}
            </div>

            <div>
              <div className="text-xs font-mono text-slate-400">座號 #{selectedSingleBadge.seatNumber}</div>
              <div className="text-xl font-bold text-slate-900">{selectedSingleBadge.name}</div>
              <div className="text-xs font-mono text-slate-500">學號：{selectedSingleBadge.studentId}</div>
            </div>

            <div className="pt-2 flex gap-2">
              <button
                onClick={() => {
                  performCheckIn(selectedSingleBadge, 'present', 'manual');
                  setSelectedSingleBadge(null);
                }}
                className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold transition-colors"
              >
                直接簽到 (出席)
              </button>
              <button
                onClick={() => setSelectedSingleBadge(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-medium transition-colors"
              >
                關閉
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Student Self Check-in Portal (Simulation) */}
      {showStudentSelfModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-2xs p-4 no-print">
          <div className="bg-white rounded-3xl shadow-xl border border-slate-200 max-w-sm w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-slate-900 text-sm">學生端手機報到畫面</h3>
              </div>
              <button
                onClick={() => setShowStudentSelfModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm"
              >
                ✕
              </button>
            </div>

            <div className="text-xs text-slate-500 bg-indigo-50 p-3 rounded-xl border border-indigo-100">
              <p className="font-bold text-indigo-900 mb-0.5">{classroom.name} · {selectedSession}</p>
              <p>學生掃描黑板大螢幕後，可於手機點選自己的座號立即送出報到！</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">選擇你的座號 / 姓名</label>
              <select
                value={selfCheckinStudentId}
                onChange={(e) => setSelfCheckinStudentId(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">-- 請點選你的姓名 --</option>
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    #{s.seatNumber} {s.name} ({s.studentId})
                  </option>
                ))}
              </select>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowStudentSelfModal(false)}
                className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                取消
              </button>
              <button
                type="button"
                disabled={!selfCheckinStudentId}
                onClick={() => {
                  const target = students.find((s) => s.id === selfCheckinStudentId);
                  if (target) {
                    performCheckIn(target, 'present', 'self');
                    setShowStudentSelfModal(false);
                  }
                }}
                className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl disabled:opacity-50 transition-colors"
              >
                完成手機報到
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
