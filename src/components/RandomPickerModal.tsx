import React, { useState, useEffect } from 'react';
import { Student } from '../types';
import { Sparkles, X, RotateCcw, Volume2, VolumeX, Award } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  students: Student[];
  onPickStudent?: (student: Student) => void;
}

export const RandomPickerModal: React.FC<Props> = ({
  isOpen,
  onClose,
  students,
  onPickStudent,
}) => {
  const [isRunning, setIsRunning] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [displayedStudent, setDisplayedStudent] = useState<Student | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [pickedHistory, setPickedHistory] = useState<Student[]>([]);
  const [excludePicked, setExcludePicked] = useState(false);

  // Simple Web Audio API sound generator
  const playBeep = (freq: number, type: OscillatorType = 'sine', duration = 0.08) => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch {
      // ignore
    }
  };

  const playFanfare = () => {
    if (!soundEnabled) return;
    [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
      setTimeout(() => playBeep(freq, 'triangle', 0.25), idx * 100);
    });
  };

  const eligibleStudents = students.filter(
    (s) => !excludePicked || !pickedHistory.some((h) => h.id === s.id)
  );

  const startPicking = () => {
    if (eligibleStudents.length === 0) return;
    setIsRunning(true);
    setSelectedStudent(null);

    let speed = 40;
    let count = 0;
    const maxCount = 28 + Math.floor(Math.random() * 8);

    const step = () => {
      count++;
      const randomIdx = Math.floor(Math.random() * eligibleStudents.length);
      const current = eligibleStudents[randomIdx];
      setDisplayedStudent(current);
      playBeep(440 + (count % 8) * 40, 'sine', 0.04);

      if (count < maxCount) {
        speed = Math.floor(speed * 1.08);
        setTimeout(step, speed);
      } else {
        setIsRunning(false);
        setSelectedStudent(current);
        setPickedHistory((prev) => [current, ...prev]);
        playFanfare();
        if (onPickStudent) {
          onPickStudent(current);
        }
      }
    };

    step();
  };

  useEffect(() => {
    if (!isOpen) {
      setIsRunning(false);
    } else {
      if (!selectedStudent && students.length > 0) {
        setDisplayedStudent(students[0]);
      }
    }
  }, [isOpen, students]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 no-print">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 text-base">課堂隨機抽點 (Roll Call Picker)</h3>
              <p className="text-xs text-slate-500">回答問題、課堂抽問、朗讀課文或隨機點名</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              title={soundEnabled ? '音效開啟' : '音效已靜音'}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60 transition-colors"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 text-center">
          {/* Display Card */}
          <div
            className={`py-10 px-6 rounded-xl border transition-all duration-200 ${
              selectedStudent
                ? 'bg-gradient-to-b from-indigo-50/90 to-white border-indigo-300 shadow-sm'
                : 'bg-slate-50 border-slate-200'
            }`}
          >
            <div className="text-xs font-semibold tracking-wider text-slate-400 uppercase mb-2">
              {isRunning ? '抽取中...' : selectedStudent ? '🎯 幸運被抽中同學' : '點擊下方按鈕開始抽籤'}
            </div>

            <div className="min-h-[100px] flex flex-col items-center justify-center">
              {displayedStudent ? (
                <>
                  <div className="text-slate-500 text-sm font-medium mb-1">
                    座號 <span className="text-indigo-600 font-bold text-lg">{displayedStudent.seatNumber}</span> 號
                  </div>
                  <div
                    className={`text-4xl font-bold tracking-tight transition-transform ${
                      selectedStudent ? 'text-indigo-900 scale-110' : 'text-slate-800'
                    }`}
                  >
                    {displayedStudent.name}
                  </div>
                </>
              ) : (
                <div className="text-slate-400 text-sm">名冊中目前無學生</div>
              )}
            </div>

            {selectedStudent && (
              <div className="mt-4 flex items-center justify-center gap-1 text-xs text-indigo-700 font-medium bg-indigo-100/60 py-1 px-3 rounded-full w-fit mx-auto">
                <Award className="w-3.5 h-3.5" />
                <span>請該生起立回答或參與課堂互動</span>
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={startPicking}
              disabled={isRunning || eligibleStudents.length === 0}
              className="w-full sm:w-auto px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium text-sm rounded-lg shadow-xs hover:shadow transition-all flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isRunning ? '正在抽點中...' : '開始隨機抽點'}</span>
            </button>

            {pickedHistory.length > 0 && (
              <button
                onClick={() => {
                  setPickedHistory([]);
                  setSelectedStudent(null);
                }}
                disabled={isRunning}
                className="px-3 py-2 text-xs text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>重置抽籤紀錄</span>
              </button>
            )}
          </div>

          {/* Options */}
          <div className="mt-4 flex items-center justify-center gap-4 text-xs text-slate-600">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={excludePicked}
                onChange={(e) => setExcludePicked(e.target.checked)}
                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span>不重複抽點已抽過的同學</span>
            </label>
            <span className="text-slate-300">|</span>
            <span>
              可抽名單：<b className="text-slate-900">{eligibleStudents.length}</b> / {students.length} 人
            </span>
          </div>

          {/* Recent Picks History */}
          {pickedHistory.length > 0 && (
            <div className="mt-5 pt-4 border-t border-slate-100 text-left">
              <div className="text-xs font-semibold text-slate-500 mb-2">本次抽中紀錄 (共 {pickedHistory.length} 次)：</div>
              <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto">
                {pickedHistory.map((s, idx) => (
                  <span
                    key={`${s.id}-${idx}`}
                    className="inline-flex items-center text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200"
                  >
                    #{s.seatNumber} {s.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
