import React, { useState, useEffect, useMemo } from 'react';
import { Classroom, TimetableSlot, DayOfWeek, TimetablePeriod } from '../types';
import { DEFAULT_PERIODS } from '../data/mockData';
import {
  Clock,
  Calendar,
  BookOpen,
  MapPin,
  User,
  AlertCircle,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Sparkles,
  CheckCircle2,
  Hourglass,
  CalendarDays,
  Coffee,
  RotateCcw,
} from 'lucide-react';

interface Props {
  classroom: Classroom;
  timetableSlots: TimetableSlot[];
  onNavigateToTimetable: () => void;
  onNavigateToAttendance?: () => void;
}

const WEEKDAY_NAMES: Record<DayOfWeek, string> = {
  1: '星期一',
  2: '星期二',
  3: '星期三',
  4: '星期四',
  5: '星期五',
};

const COLOR_MAP: Record<string, { bg: string; text: string; border: string; ring: string }> = {
  blue: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', ring: 'ring-blue-500' },
  emerald: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', ring: 'ring-emerald-500' },
  purple: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', ring: 'ring-purple-500' },
  amber: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', ring: 'ring-amber-500' },
  rose: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', ring: 'ring-rose-500' },
  indigo: { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200', ring: 'ring-indigo-500' },
  cyan: { bg: 'bg-cyan-50', text: 'text-cyan-700', border: 'border-cyan-200', ring: 'ring-cyan-500' },
  teal: { bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-200', ring: 'ring-teal-500' },
  orange: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', ring: 'ring-orange-500' },
  violet: { bg: 'bg-violet-50', text: 'text-violet-700', border: 'border-violet-200', ring: 'ring-violet-500' },
  fuchsia: { bg: 'bg-fuchsia-50', text: 'text-fuchsia-700', border: 'border-fuchsia-200', ring: 'ring-fuchsia-500' },
  slate: { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-200', ring: 'ring-slate-500' },
};

export const TodayScheduleReminder: React.FC<Props> = ({
  classroom,
  timetableSlots,
  onNavigateToTimetable,
  onNavigateToAttendance,
}) => {
  // Clock state (ticks every 10 seconds)
  const [now, setNow] = useState<Date>(new Date());
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [simulationMode, setSimulationMode] = useState<boolean>(false);
  const [simulatedTime, setSimulatedTime] = useState<string>('10:12'); // Example break before Period 3

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  // Determine current day of week (1..5). If weekend, default to Wednesday (mid-week demonstration) or Monday
  const realDay = now.getDay();
  const currentDayOfWeek: DayOfWeek = (realDay >= 1 && realDay <= 5 ? realDay : 3) as DayOfWeek;

  // Real or simulated time in HH:mm
  const currentTimeStr = useMemo(() => {
    if (simulationMode) {
      return simulatedTime;
    }
    const h = String(now.getHours()).padStart(2, '0');
    const m = String(now.getMinutes()).padStart(2, '0');
    return `${h}:${m}`;
  }, [now, simulationMode, simulatedTime]);

  // Format today date display (e.g. 2026年9月23日 星期三)
  const formattedDate = useMemo(() => {
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const date = now.getDate();
    return `${year}年${month}月${date}日 ${WEEKDAY_NAMES[currentDayOfWeek]}`;
  }, [now, currentDayOfWeek]);

  // Today's slots for this classroom
  const todaySlots = useMemo(() => {
    return timetableSlots.filter(
      (s) => s.classId === classroom.id && s.dayOfWeek === currentDayOfWeek
    );
  }, [timetableSlots, classroom.id, currentDayOfWeek]);

  // Combined periods with slot data
  const combinedPeriods = useMemo(() => {
    return DEFAULT_PERIODS.map((period) => {
      const slot = todaySlots.find((s) => s.periodNumber === period.periodNumber);
      return {
        ...period,
        slot,
      };
    });
  }, [todaySlots]);

  // Convert HH:mm to minutes from midnight
  const toMinutes = (timeStr: string) => {
    const [h, m] = timeStr.split(':').map(Number);
    return h * 60 + m;
  };

  const currentMinutes = toMinutes(currentTimeStr);

  // Determine Ongoing Class and Next Class
  const { ongoingPeriod, nextPeriod, minutesUntilNext, allDoneToday, isLunchBreak } = useMemo(() => {
    let ongoing: (TimetablePeriod & { slot?: TimetableSlot }) | null = null;
    let next: (TimetablePeriod & { slot?: TimetableSlot }) | null = null;
    let minDiff = Infinity;
    let lunch = false;

    for (const p of combinedPeriods) {
      const startMin = toMinutes(p.startTime);
      const endMin = toMinutes(p.endTime);

      // Check if currently ongoing
      if (currentMinutes >= startMin && currentMinutes <= endMin) {
        if (p.isBreak) {
          lunch = true;
        } else {
          ongoing = p;
        }
      }

      // Check upcoming next class
      if (startMin > currentMinutes) {
        const diff = startMin - currentMinutes;
        if (diff < minDiff) {
          minDiff = diff;
          next = p;
        }
      }
    }

    const allDone = !ongoing && !next && !lunch;

    return {
      ongoingPeriod: ongoing,
      nextPeriod: next,
      minutesUntilNext: minDiff !== Infinity ? minDiff : null,
      allDoneToday: allDone,
      isLunchBreak: lunch,
    };
  }, [combinedPeriods, currentMinutes]);

  // Tomorrow's first class preview if today's classes are done
  const tomorrowPreview = useMemo(() => {
    if (!allDoneToday) return null;
    const nextDay: DayOfWeek = currentDayOfWeek < 5 ? ((currentDayOfWeek + 1) as DayOfWeek) : 1;
    const nextDaySlots = timetableSlots.filter(
      (s) => s.classId === classroom.id && s.dayOfWeek === nextDay
    );
    const firstSlot = nextDaySlots.sort((a, b) => a.periodNumber - b.periodNumber)[0];
    const periodInfo = DEFAULT_PERIODS.find((p) => p.periodNumber === firstSlot?.periodNumber);
    return {
      dayName: WEEKDAY_NAMES[nextDay],
      slot: firstSlot,
      periodInfo,
    };
  }, [allDoneToday, currentDayOfWeek, timetableSlots, classroom.id]);

  const nextColor = (nextPeriod?.slot?.color && COLOR_MAP[nextPeriod.slot.color]) || COLOR_MAP.indigo;

  return (
    <div className="mb-6 bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition-shadow overflow-hidden">
      {/* Header Bar */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white px-4 py-3 sm:px-5 sm:py-3.5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-indigo-600/90 text-white flex items-center justify-center shadow-xs shrink-0">
            <CalendarDays className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-sm text-white tracking-tight">今日課務即時提醒</span>
              <span className="text-[10px] bg-indigo-500/30 text-indigo-200 px-2 py-0.5 rounded-full font-semibold border border-indigo-400/20">
                {classroom.name}
              </span>
            </div>
            <div className="text-[11px] text-slate-300 flex items-center gap-2 mt-0.5">
              <span>{formattedDate}</span>
              <span className="opacity-40">·</span>
              <span className="font-mono text-indigo-200 flex items-center gap-1 font-semibold">
                <Clock className="w-3 h-3" />
                {currentTimeStr}
              </span>
              {simulationMode && (
                <span className="text-[10px] bg-amber-500/30 text-amber-300 px-1.5 py-0.2 rounded font-medium">
                  模擬時間中
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right Actions: Time Simulation & Collapse Toggle */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setSimulationMode(!simulationMode)}
            className={`text-xs px-2.5 py-1 rounded-lg border font-medium transition-colors hidden sm:flex items-center gap-1 ${
              simulationMode
                ? 'bg-amber-500 text-white border-amber-400 font-bold'
                : 'bg-white/10 hover:bg-white/20 text-slate-200 border-white/20'
            }`}
            title="模擬白天上課各時段以檢視倒數效果"
          >
            <Sparkles className="w-3 h-3" />
            <span>{simulationMode ? '退出模擬' : '時段模擬'}</span>
          </button>

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            title={isCollapsed ? '展開卡片' : '收合卡片'}
          >
            {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Time Simulation Quick Buttons (When Active) */}
      {simulationMode && !isCollapsed && (
        <div className="bg-amber-50/80 border-b border-amber-200/80 px-4 py-2 flex items-center justify-between text-xs text-amber-900 gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 font-bold">
            <Hourglass className="w-3.5 h-3.5 text-amber-700" />
            <span>快速切換上課時段情境：</span>
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => setSimulatedTime('08:00')}
              className={`px-2 py-0.5 rounded border text-[11px] font-medium transition-colors ${
                simulatedTime === '08:00' ? 'bg-amber-600 text-white font-bold' : 'bg-white border-amber-300 hover:bg-amber-100'
              }`}
            >
              早自習 (08:00)
            </button>
            <button
              onClick={() => setSimulatedTime('09:18')}
              className={`px-2 py-0.5 rounded border text-[11px] font-medium transition-colors ${
                simulatedTime === '09:18' ? 'bg-amber-600 text-white font-bold' : 'bg-white border-amber-300 hover:bg-amber-100'
              }`}
            >
              一二節下課 (09:18)
            </button>
            <button
              onClick={() => setSimulatedTime('10:12')}
              className={`px-2 py-0.5 rounded border text-[11px] font-medium transition-colors ${
                simulatedTime === '10:12' ? 'bg-amber-600 text-white font-bold' : 'bg-white border-amber-300 hover:bg-amber-100'
              }`}
            >
              二三節下課 (10:12)
            </button>
            <button
              onClick={() => setSimulatedTime('13:10')}
              className={`px-2 py-0.5 rounded border text-[11px] font-medium transition-colors ${
                simulatedTime === '13:10' ? 'bg-amber-600 text-white font-bold' : 'bg-white border-amber-300 hover:bg-amber-100'
              }`}
            >
              午休即將結束 (13:10)
            </button>
            <button
              onClick={() => setSimulatedTime('15:05')}
              className={`px-2 py-0.5 rounded border text-[11px] font-medium transition-colors ${
                simulatedTime === '15:05' ? 'bg-amber-600 text-white font-bold' : 'bg-white border-amber-300 hover:bg-amber-100'
              }`}
            >
              下午第七節前 (15:05)
            </button>
            <button
              onClick={() => {
                setSimulationMode(false);
              }}
              className="text-amber-800 hover:text-amber-950 underline text-[11px] ml-1"
            >
              恢復當前實時
            </button>
          </div>
        </div>
      )}

      {/* Main Card Content */}
      {!isCollapsed && (
        <div className="p-4 sm:p-5 space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
            {/* Left Box: Upcoming Next Class (The Core Request) */}
            <div className="lg:col-span-7 bg-gradient-to-br from-slate-50 to-indigo-50/40 rounded-xl p-4 border border-indigo-100 flex flex-col justify-between shadow-2xs">
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-indigo-600 animate-ping" />
                    <span className="text-xs font-bold text-indigo-900 tracking-wide uppercase">
                      下一堂即將開始課程
                    </span>
                  </div>

                  {minutesUntilNext !== null && (
                    <div
                      className={`text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-2xs ${
                        minutesUntilNext <= 10
                          ? 'bg-rose-500 text-white animate-pulse'
                          : 'bg-indigo-600 text-white'
                      }`}
                    >
                      <Hourglass className="w-3.5 h-3.5" />
                      <span>
                        {minutesUntilNext <= 0
                          ? '上課鐘響中'
                          : `距開始還有 ${minutesUntilNext} 分鐘`}
                      </span>
                    </div>
                  )}
                </div>

                {/* Next Class Content */}
                {nextPeriod ? (
                  <div className="space-y-2 mt-1">
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <span className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                        {nextPeriod.slot?.subject || nextPeriod.name}
                      </span>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-indigo-100 text-indigo-800">
                        {nextPeriod.name} · {nextPeriod.startTime} ~ {nextPeriod.endTime}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600 pt-1">
                      <div className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="text-slate-500">授課教師：</span>
                        <span className="font-semibold text-slate-800">
                          {nextPeriod.slot?.teacher || classroom.teacherName || '任課教師'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="text-slate-500">上課地點：</span>
                        <span className="font-semibold text-slate-800">
                          {nextPeriod.slot?.room || '本班教室'}
                        </span>
                      </div>
                    </div>

                    {/* Note / Special requirement alert */}
                    {nextPeriod.slot?.note && (
                      <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200/80 text-xs text-amber-900 flex items-start gap-2 mt-2">
                        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold">課前準備提醒：</span>
                          <span>{nextPeriod.slot.note}</span>
                        </div>
                      </div>
                    )}
                  </div>
                ) : allDoneToday ? (
                  <div className="py-3 space-y-2">
                    <div className="flex items-center gap-2 text-emerald-700 font-bold text-sm">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      <span>今日所有課程已全部圓滿結束！</span>
                    </div>
                    {tomorrowPreview && (
                      <div className="p-2.5 rounded-lg bg-white border border-slate-200 text-xs text-slate-600 flex items-center justify-between flex-wrap gap-2">
                        <div>
                          <span className="text-slate-400">明日 ({tomorrowPreview.dayName}) 第一堂：</span>
                          <span className="font-bold text-slate-800 ml-1">
                            {tomorrowPreview.slot?.subject} ({tomorrowPreview.periodInfo?.startTime} 開始)
                          </span>
                        </div>
                        <span className="text-[11px] text-indigo-600 font-semibold">
                          授課：{tomorrowPreview.slot?.teacher}
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-xs text-slate-500 py-3">尚無後續排定課程資料。</div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-3 mt-3 border-t border-indigo-100/80 flex items-center justify-between gap-2 flex-wrap">
                <div className="text-[11px] text-slate-500">
                  {classroom.name} · {classroom.grade}年級課表
                </div>
                <div className="flex items-center gap-2">
                  {onNavigateToAttendance && nextPeriod && (
                    <button
                      onClick={onNavigateToAttendance}
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-2xs transition-colors flex items-center gap-1"
                    >
                      <span>準備本節點名</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    onClick={onNavigateToTimetable}
                    className="px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors"
                  >
                    查看完整週課表
                  </button>
                </div>
              </div>
            </div>

            {/* Right Box: Current Status & Today's Schedule Overview */}
            <div className="lg:col-span-5 bg-slate-50 rounded-xl p-4 border border-slate-200 flex flex-col justify-between">
              <div>
                <div className="text-xs font-bold text-slate-500 mb-2 flex items-center justify-between">
                  <span>當前課堂狀態</span>
                  <span className="text-[11px] text-slate-400">即時校對中</span>
                </div>

                {ongoingPeriod ? (
                  <div className="p-3 bg-white rounded-xl border border-indigo-200 shadow-2xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                        進行中 · {ongoingPeriod.name}
                      </span>
                      <span className="text-xs font-mono font-semibold text-slate-500">
                        {ongoingPeriod.startTime} ~ {ongoingPeriod.endTime}
                      </span>
                    </div>
                    <div className="text-base font-bold text-slate-900">
                      {ongoingPeriod.slot?.subject || ongoingPeriod.name}
                    </div>
                    <div className="text-xs text-slate-600 flex items-center gap-2">
                      <span>教師：{ongoingPeriod.slot?.teacher || classroom.teacherName}</span>
                      <span>·</span>
                      <span>教室：{ongoingPeriod.slot?.room || '本班教室'}</span>
                    </div>
                  </div>
                ) : isLunchBreak ? (
                  <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 shadow-2xs space-y-1">
                    <div className="text-xs font-bold text-amber-800 flex items-center gap-1.5">
                      <Coffee className="w-4 h-4 text-amber-600" />
                      <span>現正為：午餐與午休時間 (12:00 ~ 13:10)</span>
                    </div>
                    <p className="text-xs text-amber-700">
                      第 5 節課程將於 13:20 準時開始，請提醒學生提早做好準備。
                    </p>
                  </div>
                ) : (
                  <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-1">
                    <div className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <Coffee className="w-4 h-4 text-indigo-500" />
                      <span>課間下課休息中</span>
                    </div>
                    <p className="text-xs text-slate-500">
                      目前無課堂進行，請留意下一堂課程的開始倒數。
                    </p>
                  </div>
                )}
              </div>

              {/* Quick Today Class summary badges */}
              <div className="pt-3 mt-3 border-t border-slate-200/80 text-xs text-slate-600">
                <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1.5">
                  <span>今日課程總覽 (共 {todaySlots.length} 節課)</span>
                  <span className="text-indigo-600 font-semibold">{WEEKDAY_NAMES[currentDayOfWeek]}</span>
                </div>
                <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
                  {combinedPeriods
                    .filter((p) => !p.isBreak)
                    .map((p) => {
                      const isOngoing = ongoingPeriod?.periodNumber === p.periodNumber;
                      const isNext = nextPeriod?.periodNumber === p.periodNumber;
                      const isPast = toMinutes(p.endTime) < currentMinutes;

                      return (
                        <div
                          key={p.periodNumber}
                          title={`${p.name}: ${p.slot?.subject || '無'} (${p.startTime}~${p.endTime})`}
                          className={`px-2 py-1 rounded-md text-[10px] font-semibold whitespace-nowrap transition-all flex flex-col items-center ${
                            isOngoing
                              ? 'bg-indigo-600 text-white shadow-xs ring-2 ring-indigo-400'
                              : isNext
                              ? 'bg-amber-100 text-amber-900 border border-amber-300 font-bold'
                              : isPast
                              ? 'bg-slate-100 text-slate-400'
                              : 'bg-white text-slate-700 border border-slate-200'
                          }`}
                        >
                          <span className="text-[9px] opacity-75">
                            {p.periodNumber === 0 ? '早' : `第${p.periodNumber}節`}
                          </span>
                          <span className="truncate max-w-[45px]">
                            {p.slot?.subject ? p.slot.subject.slice(0, 2) : '-'}
                          </span>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
