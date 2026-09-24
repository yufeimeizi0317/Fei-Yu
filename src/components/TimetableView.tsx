import React, { useState, useMemo, useEffect } from 'react';
import { Classroom, TimetablePeriod, TimetableSlot, DayOfWeek } from '../types';
import { DEFAULT_PERIODS } from '../data/mockData';
import { exportToCsv } from '../utils/helpers';
import {
  Calendar,
  Clock,
  MapPin,
  User,
  Edit3,
  Printer,
  Download,
  Plus,
  Trash2,
  CheckCircle2,
  Sparkles,
  ChevronRight,
  AlertCircle,
  BookOpen,
  QrCode,
  Smartphone,
  Info,
} from 'lucide-react';

interface Props {
  classroom: Classroom;
  timetableSlots: TimetableSlot[];
  onUpdateSlot: (slot: TimetableSlot) => void;
  onDeleteSlot: (slotId: string) => void;
  onResetTimetable: () => void;
  onNavigateToAttendance?: (sessionName: string) => void;
  onNavigateToQr?: (sessionName: string) => void;
}

const DAYS_MAP: { day: DayOfWeek; name: string; short: string }[] = [
  { day: 1, name: '星期一', short: '週一' },
  { day: 2, name: '星期二', short: '週二' },
  { day: 3, name: '星期三', short: '週三' },
  { day: 4, name: '星期四', short: '週四' },
  { day: 5, name: '星期五', short: '週五' },
];

const SUBJECT_COLORS: Record<string, { bg: string; text: string; border: string; badge: string }> = {
  blue: { bg: 'bg-blue-50/90', text: 'text-blue-900', border: 'border-blue-200', badge: 'bg-blue-100 text-blue-800' },
  emerald: { bg: 'bg-emerald-50/90', text: 'text-emerald-900', border: 'border-emerald-200', badge: 'bg-emerald-100 text-emerald-800' },
  purple: { bg: 'bg-purple-50/90', text: 'text-purple-900', border: 'border-purple-200', badge: 'bg-purple-100 text-purple-800' },
  amber: { bg: 'bg-amber-50/90', text: 'text-amber-900', border: 'border-amber-200', badge: 'bg-amber-100 text-amber-800' },
  orange: { bg: 'bg-orange-50/90', text: 'text-orange-900', border: 'border-orange-200', badge: 'bg-orange-100 text-orange-800' },
  rose: { bg: 'bg-rose-50/90', text: 'text-rose-900', border: 'border-rose-200', badge: 'bg-rose-100 text-rose-800' },
  cyan: { bg: 'bg-cyan-50/90', text: 'text-cyan-900', border: 'border-cyan-200', badge: 'bg-cyan-100 text-cyan-800' },
  teal: { bg: 'bg-teal-50/90', text: 'text-teal-900', border: 'border-teal-200', badge: 'bg-teal-100 text-teal-800' },
  indigo: { bg: 'bg-indigo-50/90', text: 'text-indigo-900', border: 'border-indigo-200', badge: 'bg-indigo-100 text-indigo-800' },
  pink: { bg: 'bg-pink-50/90', text: 'text-pink-900', border: 'border-pink-200', badge: 'bg-pink-100 text-pink-800' },
  lime: { bg: 'bg-lime-50/90', text: 'text-lime-900', border: 'border-lime-200', badge: 'bg-lime-100 text-lime-800' },
  sky: { bg: 'bg-sky-50/90', text: 'text-sky-900', border: 'border-sky-200', badge: 'bg-sky-100 text-sky-800' },
  slate: { bg: 'bg-slate-50/90', text: 'text-slate-900', border: 'border-slate-200', badge: 'bg-slate-100 text-slate-700' },
};

const PRESET_SUBJECTS = [
  { name: '國文', color: 'blue', defaultTeacher: '林信宏 導師' },
  { name: '數學', color: 'emerald', defaultTeacher: '陳建宏 老師' },
  { name: '英語', color: 'purple', defaultTeacher: 'Sarah Chen 老師' },
  { name: '理化', color: 'amber', defaultTeacher: '張明達 老師' },
  { name: '歷史', color: 'orange', defaultTeacher: '周家興 老師' },
  { name: '地理', color: 'cyan', defaultTeacher: '黃淑玲 老師' },
  { name: '公民', color: 'teal', defaultTeacher: '蔡佩君 老師' },
  { name: '體育', color: 'rose', defaultTeacher: '王大維 老師' },
  { name: '音樂', color: 'pink', defaultTeacher: '李雅慧 老師' },
  { name: '視覺藝術', color: 'emerald', defaultTeacher: '高玉珍 老師' },
  { name: '生活科技', color: 'sky', defaultTeacher: '趙志強 老師' },
  { name: '資訊科技', color: 'sky', defaultTeacher: '趙志強 老師' },
  { name: '家政', color: 'pink', defaultTeacher: '李佩玲 老師' },
  { name: '童軍', color: 'lime', defaultTeacher: '劉育華 老師' },
  { name: '班會', color: 'indigo', defaultTeacher: '林信宏 導師' },
  { name: '社團活動', color: 'purple', defaultTeacher: '社團指導老師' },
  { name: '早自習 / 晨讀', color: 'indigo', defaultTeacher: '林信宏 導師' },
  { name: '自習 / 課輔', color: 'slate', defaultTeacher: '課輔任課老師' },
];

export const TimetableView: React.FC<Props> = ({
  classroom,
  timetableSlots,
  onUpdateSlot,
  onDeleteSlot,
  onResetTimetable,
  onNavigateToAttendance,
  onNavigateToQr,
}) => {
  // Mobile day selection: 0 = All Week, 1..5 = Mon..Fri
  const [mobileActiveDay, setMobileActiveDay] = useState<number>(() => {
    const today = new Date().getDay();
    return today >= 1 && today <= 5 ? today : 1;
  });

  // Editing state
  const [editingSlot, setEditingSlot] = useState<{
    dayOfWeek: DayOfWeek;
    periodNumber: number;
    existing?: TimetableSlot;
  } | null>(null);

  const [formSubject, setFormSubject] = useState('');
  const [formTeacher, setFormTeacher] = useState('');
  const [formRoom, setFormRoom] = useState('本班教室');
  const [formColor, setFormColor] = useState('blue');
  const [formNote, setFormNote] = useState('');

  // Real-time current period detection
  const [currentTimeStr, setCurrentTimeStr] = useState<string>('');
  const [currentDay, setCurrentDay] = useState<number>(1);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const h = String(now.getHours()).padStart(2, '0');
      const m = String(now.getMinutes()).padStart(2, '0');
      setCurrentTimeStr(`${h}:${m}`);
      const day = now.getDay();
      setCurrentDay(day >= 1 && day <= 5 ? day : 1);
    };
    updateTime();
    const timer = setInterval(updateTime, 30000);
    return () => clearInterval(timer);
  }, []);

  // Filter slots for the current classroom
  const classSlots = useMemo(() => {
    return timetableSlots.filter((s) => s.classId === classroom.id);
  }, [timetableSlots, classroom.id]);

  // Map lookup: `day-period` => TimetableSlot
  const slotMap = useMemo(() => {
    const map = new Map<string, TimetableSlot>();
    classSlots.forEach((slot) => {
      map.set(`${slot.dayOfWeek}-${slot.periodNumber}`, slot);
    });
    return map;
  }, [classSlots]);

  // Determine which period is active right now
  const activePeriod = useMemo(() => {
    if (!currentTimeStr) return null;
    return DEFAULT_PERIODS.find((p) => {
      return currentTimeStr >= p.startTime && currentTimeStr <= p.endTime;
    });
  }, [currentTimeStr]);

  // Today's scheduled slots
  const todaySlots = useMemo(() => {
    return DEFAULT_PERIODS.map((period) => {
      if (period.isBreak) return { period, slot: null };
      const slot = slotMap.get(`${currentDay}-${period.periodNumber}`);
      return { period, slot };
    });
  }, [currentDay, slotMap]);

  // Open edit modal
  const handleOpenEdit = (dayOfWeek: DayOfWeek, periodNumber: number) => {
    const existing = slotMap.get(`${dayOfWeek}-${periodNumber}`);
    setEditingSlot({ dayOfWeek, periodNumber, existing });
    if (existing) {
      setFormSubject(existing.subject);
      setFormTeacher(existing.teacher);
      setFormRoom(existing.room || '本班教室');
      setFormColor(existing.color || 'blue');
      setFormNote(existing.note || '');
    } else {
      setFormSubject('');
      setFormTeacher(classroom.teacherName || '');
      setFormRoom('本班教室');
      setFormColor('blue');
      setFormNote('');
    }
  };

  // Preset subject select
  const handleSelectPreset = (preset: typeof PRESET_SUBJECTS[0]) => {
    setFormSubject(preset.name);
    setFormColor(preset.color);
    if (!formTeacher || formTeacher === classroom.teacherName) {
      setFormTeacher(preset.defaultTeacher);
    }
  };

  // Save edit modal
  const handleSaveSlot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSlot || !formSubject.trim()) return;

    const newSlot: TimetableSlot = {
      id: editingSlot.existing ? editingSlot.existing.id : `slot-${classroom.id}-${editingSlot.dayOfWeek}-${editingSlot.periodNumber}`,
      classId: classroom.id,
      dayOfWeek: editingSlot.dayOfWeek,
      periodNumber: editingSlot.periodNumber,
      subject: formSubject.trim(),
      teacher: formTeacher.trim(),
      room: formRoom.trim() || '本班教室',
      color: formColor,
      note: formNote.trim(),
    };

    onUpdateSlot(newSlot);
    setEditingSlot(null);
  };

  // Delete slot
  const handleDeleteCurrent = () => {
    if (editingSlot?.existing) {
      onDeleteSlot(editingSlot.existing.id);
      setEditingSlot(null);
    }
  };

  // Export to CSV
  const handleExportCsv = () => {
    const headers = ['節次', '時間', '星期一', '星期二', '星期三', '星期四', '星期五'];
    const rows = DEFAULT_PERIODS.map((period) => {
      if (period.isBreak) {
        return [period.name, `${period.startTime}-${period.endTime}`, '--- 午休用餐 ---', '', '', '', ''];
      }
      return [
        period.name,
        `${period.startTime}-${period.endTime}`,
        slotMap.get(`1-${period.periodNumber}`)?.subject || '',
        slotMap.get(`2-${period.periodNumber}`)?.subject || '',
        slotMap.get(`3-${period.periodNumber}`)?.subject || '',
        slotMap.get(`4-${period.periodNumber}`)?.subject || '',
        slotMap.get(`5-${period.periodNumber}`)?.subject || '',
      ];
    });

    exportToCsv(`${classroom.name}_每週課表`, headers, rows);
  };

  return (
    <div className="space-y-6 pb-20 md:pb-12">
      {/* Top Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-2xs no-print">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs shrink-0">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                  {classroom.name} 班級正式課表
                </h2>
                <span className="px-2.5 py-0.5 text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-md">
                  {classroom.academicYear} · {classroom.semester}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                導師：{classroom.teacherName} · 點擊任意堂課即可快速編輯科目、任課教師與上課教室
              </p>
            </div>
          </div>

          {/* Action Tools */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleExportCsv}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg transition-colors"
              title="匯出課表 CSV"
            >
              <Download className="w-3.5 h-3.5" />
              <span>匯出課表</span>
            </button>

            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-colors"
              title="友善列印 A4 課表海報"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>列印課表</span>
            </button>

            <button
              onClick={onResetTimetable}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-500 hover:text-slate-800 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors"
              title="重設回範本標準課表"
            >
              <span>重置預設</span>
            </button>
          </div>
        </div>

        {/* Real-time Today Status Bar */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
            </span>
            <span className="font-semibold text-slate-700">
              今日進度（{DAYS_MAP.find((d) => d.day === currentDay)?.name || '平日'}）· 目前時間 {currentTimeStr || '--:--'}
            </span>
            {activePeriod && (
              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-semibold rounded-md flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>現正進行：{activePeriod.name} ({activePeriod.startTime} - {activePeriod.endTime})</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {activePeriod && !activePeriod.isBreak && (
              <>
                {onNavigateToAttendance && (
                  <button
                    onClick={() => onNavigateToAttendance(activePeriod.name)}
                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 bg-indigo-50 px-2.5 py-1 rounded-md transition-colors"
                  >
                    <span>本節快速點名</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                )}
                {onNavigateToQr && (
                  <button
                    onClick={() => onNavigateToQr(activePeriod.name)}
                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 bg-indigo-50 px-2.5 py-1 rounded-md transition-colors"
                  >
                    <QrCode className="w-3 h-3" />
                    <span>QR報到</span>
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Day Selector Tabs (Shown on small screens) */}
      <div className="lg:hidden flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl overflow-x-auto no-print">
        <button
          onClick={() => setMobileActiveDay(0)}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
            mobileActiveDay === 0
              ? 'bg-white text-indigo-700 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          全週課表
        </button>
        {DAYS_MAP.map((d) => {
          const isToday = d.day === currentDay;
          const isActive = mobileActiveDay === d.day;
          return (
            <button
              key={d.day}
              onClick={() => setMobileActiveDay(d.day)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap flex items-center gap-1 transition-all ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 bg-white border border-slate-200'
              }`}
            >
              <span>{d.short}</span>
              {isToday && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
            </button>
          );
        })}
      </div>

      {/* Mobile Single Day Vertical Card View (When a specific day is selected on mobile) */}
      {mobileActiveDay !== 0 && (
        <div className="lg:hidden space-y-3 no-print">
          <div className="flex items-center justify-between px-1">
            <h3 className="font-bold text-slate-800 text-sm">
              {DAYS_MAP.find((d) => d.day === mobileActiveDay)?.name} 今日課程安排
            </h3>
            <span className="text-xs text-slate-400">點擊任一卡片可編輯</span>
          </div>

          <div className="space-y-2.5">
            {DEFAULT_PERIODS.map((period) => {
              if (period.isBreak) {
                return (
                  <div
                    key={period.periodNumber}
                    className="p-3 bg-slate-100 border border-dashed border-slate-300 rounded-xl text-center text-xs text-slate-500 font-medium"
                  >
                    🍴 {period.name} ({period.startTime} - {period.endTime})
                  </div>
                );
              }

              const slot = slotMap.get(`${mobileActiveDay}-${period.periodNumber}`);
              const isCurrent =
                currentDay === mobileActiveDay &&
                currentTimeStr >= period.startTime &&
                currentTimeStr <= period.endTime;
              const colorInfo = slot?.color ? SUBJECT_COLORS[slot.color] || SUBJECT_COLORS.blue : SUBJECT_COLORS.slate;

              return (
                <div
                  key={period.periodNumber}
                  onClick={() => handleOpenEdit(mobileActiveDay as DayOfWeek, period.periodNumber)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                    isCurrent
                      ? 'bg-indigo-50/80 border-indigo-500 ring-2 ring-indigo-300 shadow-sm'
                      : slot
                      ? `${colorInfo.bg} ${colorInfo.border} shadow-2xs`
                      : 'bg-white border-dashed border-slate-300 hover:border-indigo-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-slate-700 bg-white/80 px-2 py-0.5 rounded-md border border-slate-200">
                        {period.name}
                      </span>
                      <span className="text-[11px] text-slate-500 font-mono">
                        {period.startTime} - {period.endTime}
                      </span>
                    </div>
                    {isCurrent && (
                      <span className="px-2 py-0.5 bg-emerald-600 text-white font-bold text-[10px] rounded-full animate-pulse">
                        現正上課中
                      </span>
                    )}
                  </div>

                  {slot ? (
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-base font-bold text-slate-900">{slot.subject}</span>
                        <span className="text-xs font-medium text-slate-600 flex items-center gap-1">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          <span>{slot.teacher}</span>
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span>{slot.room || '本班教室'}</span>
                        </span>
                        {slot.note && (
                          <span className="text-[11px] text-indigo-700 font-medium bg-white/70 px-1.5 py-0.5 rounded border border-indigo-100">
                            📌 {slot.note}
                          </span>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="py-2 text-center text-xs text-slate-400 flex items-center justify-center gap-1">
                      <Plus className="w-3.5 h-3.5" />
                      <span>尚未安排課程，點擊排課</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Weekly Timetable Grid Table (Visible on Desktop or when mobileActiveDay === 0) */}
      <div
        className={`bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden ${
          mobileActiveDay !== 0 ? 'hidden lg:block' : ''
        }`}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[760px]">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/90 text-xs text-slate-700">
                <th className="py-3 px-3 w-28 text-center font-bold">節次 / 時間</th>
                {DAYS_MAP.map((d) => {
                  const isToday = d.day === currentDay;
                  return (
                    <th
                      key={d.day}
                      className={`py-3 px-3 text-center font-bold ${
                        isToday ? 'bg-indigo-50/70 text-indigo-950 border-x border-indigo-100' : ''
                      }`}
                    >
                      <div className="flex items-center justify-center gap-1.5">
                        <span>{d.name}</span>
                        {isToday && (
                          <span className="px-1.5 py-0.2 text-[10px] font-bold bg-indigo-600 text-white rounded">
                            今日
                          </span>
                        )}
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {DEFAULT_PERIODS.map((period) => {
                if (period.isBreak) {
                  return (
                    <tr key={period.periodNumber} className="bg-slate-50/60 border-y border-slate-200">
                      <td className="py-2.5 px-3 text-center font-semibold text-slate-500 text-[11px]">
                        <div>{period.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {period.startTime} - {period.endTime}
                        </div>
                      </td>
                      <td colSpan={5} className="py-2.5 px-3 text-center text-slate-400 text-xs font-medium tracking-wide">
                        🍱 午餐休憩與自由活動時間 (12:00 - 13:10)
                      </td>
                    </tr>
                  );
                }

                const isCurrentPeriod =
                  currentTimeStr >= period.startTime && currentTimeStr <= period.endTime;

                return (
                  <tr
                    key={period.periodNumber}
                    className={`hover:bg-slate-50/40 transition-colors ${
                      isCurrentPeriod ? 'bg-indigo-50/20' : ''
                    }`}
                  >
                    {/* Period Label Column */}
                    <td className="py-3 px-3 text-center border-r border-slate-100 bg-slate-50/50">
                      <div className="font-bold text-slate-800 text-xs flex items-center justify-center gap-1">
                        <span>{period.name}</span>
                        {isCurrentPeriod && (
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                        {period.startTime} - {period.endTime}
                      </div>
                    </td>

                    {/* Monday to Friday Cells */}
                    {DAYS_MAP.map((d) => {
                      const slot = slotMap.get(`${d.day}-${period.periodNumber}`);
                      const isToday = d.day === currentDay;
                      const isCurrentCell = isToday && isCurrentPeriod;
                      const colorInfo = slot?.color
                        ? SUBJECT_COLORS[slot.color] || SUBJECT_COLORS.blue
                        : SUBJECT_COLORS.slate;

                      return (
                        <td
                          key={d.day}
                          onClick={() => handleOpenEdit(d.day, period.periodNumber)}
                          className={`py-2 px-2 border-r border-slate-100 last:border-r-0 cursor-pointer transition-all ${
                            isToday ? 'bg-indigo-50/30' : ''
                          }`}
                        >
                          {slot ? (
                            <div
                              className={`p-2.5 rounded-xl border transition-all hover:scale-[1.02] hover:shadow-xs group ${colorInfo.bg} ${colorInfo.border} ${
                                isCurrentCell ? 'ring-2 ring-indigo-500 shadow-xs' : ''
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-slate-900 text-sm">
                                  {slot.subject}
                                </span>
                                <Edit3 className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                              </div>

                              <div className="mt-1 flex items-center justify-between text-[11px] text-slate-600">
                                <span className="truncate max-w-[100px]">{slot.teacher}</span>
                                <span className="text-[10px] text-slate-400 font-mono">
                                  {slot.room === '本班教室' ? '' : slot.room}
                                </span>
                              </div>

                              {slot.note && (
                                <div className="mt-1 text-[10px] text-indigo-700 bg-white/80 px-1.5 py-0.5 rounded truncate border border-indigo-100 font-medium">
                                  📌 {slot.note}
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="h-16 rounded-xl border border-dashed border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/30 flex items-center justify-center text-slate-300 hover:text-indigo-600 transition-colors">
                              <Plus className="w-4 h-4" />
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Printable Poster Layout (Only shown in window.print) */}
      <div className="hidden print:block space-y-4">
        <div className="text-center border-b-2 border-slate-900 pb-3">
          <h1 className="text-2xl font-black text-slate-900">{classroom.schoolName}</h1>
          <h2 className="text-xl font-bold text-slate-800 mt-1">
            {classroom.name} {classroom.academicYear} {classroom.semester} 班級正式課表
          </h2>
          <p className="text-xs text-slate-600 mt-1">導師：{classroom.teacherName} · 教室排數：{classroom.layoutRows} 排 {classroom.layoutCols} 列</p>
        </div>
      </div>

      {/* Modal: Edit Timetable Slot */}
      {editingSlot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-2xs p-4 no-print">
          <div className="bg-white rounded-3xl shadow-xl border border-slate-200 max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-base">
                  編輯課程安排
                </h3>
                <p className="text-xs text-slate-400">
                  {DAYS_MAP.find((d) => d.day === editingSlot.dayOfWeek)?.name} ·{' '}
                  {DEFAULT_PERIODS.find((p) => p.periodNumber === editingSlot.periodNumber)?.name}
                </p>
              </div>
              <button
                onClick={() => setEditingSlot(null)}
                className="text-slate-400 hover:text-slate-600 text-sm"
              >
                ✕
              </button>
            </div>

            {/* Quick Preset Subject Chips */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                常用科目快速點選
              </label>
              <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
                {PRESET_SUBJECTS.map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => handleSelectPreset(preset)}
                    className={`px-2 py-1 text-xs rounded-lg border font-medium transition-colors ${
                      formSubject === preset.name
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {preset.name}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleSaveSlot} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">科目名稱 *</label>
                <input
                  type="text"
                  required
                  value={formSubject}
                  onChange={(e) => setFormSubject(e.target.value)}
                  placeholder="例如：國文、數學、英語、理化..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">任課教師</label>
                  <input
                    type="text"
                    value={formTeacher}
                    onChange={(e) => setFormTeacher(e.target.value)}
                    placeholder="例如：林老師"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">上課教室 / 地點</label>
                  <input
                    type="text"
                    value={formRoom}
                    onChange={(e) => setFormRoom(e.target.value)}
                    placeholder="例如：本班教室、操場..."
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">色彩標籤</label>
                <div className="flex flex-wrap gap-2">
                  {Object.keys(SUBJECT_COLORS).map((cKey) => (
                    <button
                      key={cKey}
                      type="button"
                      onClick={() => setFormColor(cKey)}
                      className={`w-6 h-6 rounded-full border-2 transition-transform ${
                        formColor === cKey ? 'scale-115 ring-2 ring-indigo-400 border-white' : 'border-transparent'
                      } ${SUBJECT_COLORS[cKey].bg}`}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">課堂叮嚀與用具備註</label>
                <input
                  type="text"
                  value={formNote}
                  onChange={(e) => setFormNote(e.target.value)}
                  placeholder="例如：自備水彩、攜帶習作、穿運動服..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                {editingSlot.existing ? (
                  <button
                    type="button"
                    onClick={handleDeleteCurrent}
                    className="text-rose-600 hover:text-rose-700 font-semibold flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>清空此堂</span>
                  </button>
                ) : (
                  <div />
                )}

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingSlot(null)}
                    className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-medium"
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold shadow-2xs transition-colors"
                  >
                    儲存課程
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
