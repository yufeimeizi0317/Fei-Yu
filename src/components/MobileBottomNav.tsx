import React, { useState } from 'react';
import { ActiveTab } from './Header';
import { Classroom, UserAccount } from '../types';
import { USER_ROLES_INFO } from '../data/mockData';
import {
  UserCheck,
  QrCode,
  BookOpen,
  BarChart3,
  Menu,
  Mail,
  Users,
  Sparkles,
  Database,
  X,
  School,
  Plus,
  Calendar,
  User,
  Download,
  Smartphone,
  ListTodo,
  Shield,
} from 'lucide-react';

interface Props {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  classes: Classroom[];
  currentClass: Classroom;
  onSelectClass: (c: Classroom) => void;
  onOpenNewClass: () => void;
  onOpenPicker: () => void;
  onOpenBackup: () => void;
  currentUser?: UserAccount;
  onOpenUserAccount?: () => void;
  onOpenInstallGuide?: () => void;
}

export const MobileBottomNav: React.FC<Props> = ({
  activeTab,
  onTabChange,
  classes,
  currentClass,
  onSelectClass,
  onOpenNewClass,
  onOpenPicker,
  onOpenBackup,
  currentUser,
  onOpenUserAccount,
  onOpenInstallGuide,
}) => {
  const [showMoreDrawer, setShowMoreDrawer] = useState(false);

  return (
    <>
      {/* Mobile Fixed Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-lg flex items-center justify-around px-2 py-1.5 md:hidden no-print">
        {/* 1. Attendance */}
        <button
          onClick={() => onTabChange('attendance')}
          className={`flex flex-col items-center justify-center flex-1 py-1 text-[10px] font-medium transition-colors ${
            activeTab === 'attendance' ? 'text-indigo-600 font-bold' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <UserCheck className="w-5 h-5 mb-0.5" />
          <span>點名簽到</span>
        </button>

        {/* 2. Homework */}
        <button
          onClick={() => onTabChange('homework')}
          className={`flex flex-col items-center justify-center flex-1 py-1 text-[10px] font-medium transition-colors ${
            activeTab === 'homework' ? 'text-indigo-600 font-bold' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <BookOpen className="w-5 h-5 mb-0.5" />
          <span>作業盤點</span>
        </button>

        {/* 3. Center Prominent QR Scanner Button */}
        <div className="relative -top-3 flex flex-col items-center">
          <button
            onClick={() => onTabChange('qrcode')}
            className={`w-13 h-13 rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-95 ${
              activeTab === 'qrcode'
                ? 'bg-gradient-to-tr from-indigo-700 to-indigo-500 text-white ring-4 ring-indigo-100'
                : 'bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white shadow-indigo-200'
            }`}
            title="開啟相機掃描報到"
          >
            <QrCode className="w-6 h-6" />
          </button>
          <span
            className={`text-[10px] font-semibold mt-0.5 ${
              activeTab === 'qrcode' ? 'text-indigo-600 font-bold' : 'text-slate-600'
            }`}
          >
            QR報到
          </span>
        </div>

        {/* 4. Reports */}
        <button
          onClick={() => onTabChange('reports')}
          className={`flex flex-col items-center justify-center flex-1 py-1 text-[10px] font-medium transition-colors ${
            activeTab === 'reports' ? 'text-indigo-600 font-bold' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <BarChart3 className="w-5 h-5 mb-0.5" />
          <span>統計報表</span>
        </button>

        {/* 5. More / Menu Drawer */}
        <button
          onClick={() => setShowMoreDrawer(true)}
          className={`flex flex-col items-center justify-center flex-1 py-1 text-[10px] font-medium transition-colors ${
            activeTab === 'emails' || activeTab === 'roster'
              ? 'text-indigo-600 font-bold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Menu className="w-5 h-5 mb-0.5" />
          <span>功能更多</span>
        </button>
      </nav>

      {/* Mobile Slide-Up Drawer for More features */}
      {showMoreDrawer && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end bg-slate-900/60 backdrop-blur-2xs md:hidden no-print">
          <div
            className="flex-1"
            onClick={() => setShowMoreDrawer(false)}
          />
          <div className="bg-white rounded-t-3xl border-t border-slate-200 p-5 shadow-2xl space-y-4 animate-in slide-in-from-bottom duration-200 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-900 text-base">班級功能選單</h3>
                <p className="text-xs text-slate-400">目前：{currentClass.name} · {currentClass.teacherName}</p>
              </div>
              <button
                onClick={() => setShowMoreDrawer(false)}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Current Logged-in User Profile Card */}
            {currentUser && (
              <div
                onClick={() => {
                  setShowMoreDrawer(false);
                  if (onOpenUserAccount) onOpenUserAccount();
                }}
                className="p-3 bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-2xl flex items-center justify-between cursor-pointer shadow-xs active:scale-[0.99] transition-transform"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white font-bold flex items-center justify-center shadow-2xs">
                    {currentUser.name.charAt(0)}
                  </div>
                  <div>
                    <div className="text-xs font-bold flex items-center gap-1.5">
                      <span>{currentUser.name}</span>
                      <span className="text-[10px] bg-white/20 px-1.5 py-0.2 rounded font-semibold">
                        {USER_ROLES_INFO[currentUser.role]?.label || '教師'}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-300 truncate max-w-[180px]">
                      {currentUser.title || currentUser.email}
                    </div>
                  </div>
                </div>
                <span className="text-xs text-indigo-300 font-semibold shrink-0">切換帳號 &gt;</span>
              </div>
            )}

            {/* Navigation options in drawer */}
            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={() => {
                  onTabChange('tasks');
                  setShowMoreDrawer(false);
                }}
                className={`p-3 rounded-xl border text-left flex items-center gap-3 transition-colors ${
                  activeTab === 'tasks'
                    ? 'bg-indigo-50 border-indigo-200 text-indigo-900 font-bold'
                    : 'bg-slate-50 border-slate-200 text-slate-800'
                }`}
              >
                <div className="w-9 h-9 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
                  <ListTodo className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold">待辦事項</div>
                  <div className="text-[10px] text-slate-400">日常任務與截止日</div>
                </div>
              </button>

              <button
                onClick={() => {
                  onTabChange('cadres');
                  setShowMoreDrawer(false);
                }}
                className={`p-3 rounded-xl border text-left flex items-center gap-3 transition-colors ${
                  activeTab === 'cadres'
                    ? 'bg-indigo-50 border-indigo-200 text-indigo-900 font-bold'
                    : 'bg-slate-50 border-slate-200 text-slate-800'
                }`}
              >
                <div className="w-9 h-9 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold">班級幹部團隊</div>
                  <div className="text-[10px] text-slate-400">幹部與各科小老師</div>
                </div>
              </button>

              <button
                onClick={() => {
                  onTabChange('timetable');
                  setShowMoreDrawer(false);
                }}
                className={`p-3 rounded-xl border text-left flex items-center gap-3 transition-colors ${
                  activeTab === 'timetable'
                    ? 'bg-indigo-50 border-indigo-200 text-indigo-900 font-bold'
                    : 'bg-slate-50 border-slate-200 text-slate-800'
                }`}
              >
                <div className="w-9 h-9 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold">班級正式課表</div>
                  <div className="text-[10px] text-slate-400">週課表與今日課程</div>
                </div>
              </button>

              <button
                onClick={() => {
                  onTabChange('roster');
                  setShowMoreDrawer(false);
                }}
                className={`p-3 rounded-xl border text-left flex items-center gap-3 transition-colors ${
                  activeTab === 'roster'
                    ? 'bg-indigo-50 border-indigo-200 text-indigo-900 font-bold'
                    : 'bg-slate-50 border-slate-200 text-slate-800'
                }`}
              >
                <div className="w-9 h-9 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold">班級名冊管理</div>
                  <div className="text-[10px] text-slate-400">名冊增修與匯入</div>
                </div>
              </button>

              <button
                onClick={() => {
                  onTabChange('emails');
                  setShowMoreDrawer(false);
                }}
                className={`p-3 rounded-xl border text-left flex items-center gap-3 transition-colors ${
                  activeTab === 'emails'
                    ? 'bg-indigo-50 border-indigo-200 text-indigo-900 font-bold'
                    : 'bg-slate-50 border-slate-200 text-slate-800'
                }`}
              >
                <div className="w-9 h-9 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold">自動寄信通知</div>
                  <div className="text-[10px] text-slate-400">缺席與催繳信</div>
                </div>
              </button>

              <button
                onClick={() => {
                  setShowMoreDrawer(false);
                  onOpenPicker();
                }}
                className="p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-left flex items-center gap-3 transition-colors"
              >
                <div className="w-9 h-9 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-800">課堂隨機抽點</div>
                  <div className="text-[10px] text-slate-400">回答與活動輪候</div>
                </div>
              </button>

              <button
                onClick={() => {
                  setShowMoreDrawer(false);
                  onOpenBackup();
                }}
                className="p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-left flex items-center gap-3 transition-colors"
              >
                <div className="w-9 h-9 rounded-lg bg-slate-200 text-slate-700 flex items-center justify-center">
                  <Database className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-800">資料備份/匯出</div>
                  <div className="text-[10px] text-slate-400">JSON備份與重置</div>
                </div>
              </button>

              {/* Install PWA Mobile Shortcut */}
              {onOpenInstallGuide && (
                <button
                  onClick={() => {
                    setShowMoreDrawer(false);
                    onOpenInstallGuide();
                  }}
                  className="col-span-2 p-3 rounded-xl border border-indigo-200 bg-gradient-to-r from-indigo-50 to-indigo-100/70 hover:from-indigo-100 hover:to-indigo-200/70 text-left flex items-center justify-between transition-colors shadow-2xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                      <Download className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-indigo-950">安裝至手機主畫面</div>
                      <div className="text-[10px] text-indigo-700">支援離線運作、全螢幕原生手感</div>
                    </div>
                  </div>
                  <span className="text-[11px] font-bold px-2.5 py-1 bg-indigo-600 text-white rounded-lg shadow-2xs">
                    安裝
                  </span>
                </button>
              )}
            </div>

            {/* Quick Class Switcher in Drawer */}
            <div className="pt-3 border-t border-slate-100">
              <div className="text-xs font-bold text-slate-500 mb-2 flex items-center justify-between">
                <span>切換所屬班級</span>
                <button
                  onClick={() => {
                    setShowMoreDrawer(false);
                    onOpenNewClass();
                  }}
                  className="text-indigo-600 text-xs font-semibold flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>新增班級</span>
                </button>
              </div>

              <div className="space-y-1.5">
                {classes.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => {
                      onSelectClass(c);
                      setShowMoreDrawer(false);
                    }}
                    className={`w-full p-2.5 rounded-xl text-xs flex items-center justify-between transition-colors ${
                      c.id === currentClass.id
                        ? 'bg-indigo-600 text-white font-bold shadow-xs'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <School className="w-4 h-4 shrink-0" />
                      <span>{c.name}</span>
                      <span className="opacity-75 text-[11px]">({c.teacherName})</span>
                    </div>
                    {c.id === currentClass.id && <span className="text-xs">✓ 當前</span>}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
