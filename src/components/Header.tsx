import React from 'react';
import { Classroom, UserAccount } from '../types';
import { Sparkles, ChevronDown, Plus, School, Database, User, Smartphone } from 'lucide-react';
import { USER_ROLES_INFO } from '../data/mockData';

export type ActiveTab =
  | 'attendance'
  | 'qrcode'
  | 'timetable'
  | 'homework'
  | 'tasks'
  | 'cadres'
  | 'reports'
  | 'emails'
  | 'roster';

interface Props {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  classes: Classroom[];
  currentClass: Classroom;
  onSelectClass: (c: Classroom) => void;
  onOpenNewClass: () => void;
  onOpenPicker: () => void;
  onOpenBackup: () => void;
  currentUser: UserAccount;
  onOpenUserAccount: () => void;
  onOpenInstallGuide?: () => void;
}

export const Header: React.FC<Props> = ({
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
  const [classDropdownOpen, setClassDropdownOpen] = React.useState(false);

  const navItems: { id: ActiveTab; label: string }[] = [
    { id: 'attendance', label: '點名簽到' },
    { id: 'qrcode', label: 'QR 報到' },
    { id: 'timetable', label: '班級課表' },
    { id: 'homework', label: '作業盤點' },
    { id: 'tasks', label: '待辦事項' },
    { id: 'cadres', label: '班級幹部' },
    { id: 'reports', label: '統計報表' },
    { id: 'emails', label: '自動寄信' },
    { id: 'roster', label: '班級名冊' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-2xs no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => onTabChange('attendance')}
            className="text-lg font-bold tracking-tight text-slate-900 flex items-center gap-2 hover:opacity-90 transition-opacity"
          >
            <span className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-black text-sm">
              CD
            </span>
            <span>ClassDesk</span>
          </button>

          {/* Class Switcher Pill Button */}
          <div className="relative">
            <button
              onClick={() => setClassDropdownOpen(!classDropdownOpen)}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200/80 rounded-md border border-slate-200 transition-colors"
            >
              <School className="w-3.5 h-3.5 text-slate-500" />
              <span className="font-semibold text-slate-900">{currentClass.name}</span>
              <span className="text-slate-400">·</span>
              <span className="text-slate-500 hidden sm:inline">{currentClass.teacherName}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-0.5" />
            </button>

            {classDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-20"
                  onClick={() => setClassDropdownOpen(false)}
                />
                <div className="absolute left-0 mt-1.5 w-64 bg-white rounded-lg shadow-lg border border-slate-200 py-1.5 z-30 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3 py-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    切換所屬班級
                  </div>
                  {classes.map((cls) => (
                    <button
                      key={cls.id}
                      onClick={() => {
                        onSelectClass(cls);
                        setClassDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between transition-colors ${
                        cls.id === currentClass.id
                          ? 'bg-indigo-50/80 text-indigo-900 font-semibold'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <div>
                        <div>{cls.name}</div>
                        <div className="text-slate-400 text-[11px]">{cls.schoolName} · {cls.teacherName}</div>
                      </div>
                      {cls.id === currentClass.id && (
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
                      )}
                    </button>
                  ))}
                  <div className="border-t border-slate-100 my-1 pt-1">
                    <button
                      onClick={() => {
                        setClassDropdownOpen(false);
                        onOpenNewClass();
                      }}
                      className="w-full text-left px-3 py-1.5 text-xs text-indigo-600 hover:bg-indigo-50/60 font-medium flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>新增管理班級...</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Zone 2: Clean text navigation links */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
                  isActive
                    ? 'text-indigo-600 bg-indigo-50 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: 1-2 primary actions */}
        <div className="flex items-center gap-2">
          {/* Mobile App Install Pill */}
          {onOpenInstallGuide && (
            <button
              onClick={onOpenInstallGuide}
              className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50/80 hover:bg-indigo-100 border border-indigo-200 rounded-md transition-colors"
              title="安裝至手機或電腦桌面（支援離線）"
            >
              <Smartphone className="w-3.5 h-3.5 text-indigo-600" />
              <span>手機 App</span>
            </button>
          )}

          <button
            onClick={onOpenPicker}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-md transition-colors whitespace-nowrap"
            title="隨機抽取一位學生回答或點名"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">課堂抽點</span>
          </button>

          <button
            onClick={onOpenBackup}
            className="p-1.5 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
            title="系統備份與資料重置"
          >
            <Database className="w-4 h-4" />
          </button>

          <div className="h-5 w-px bg-slate-200 mx-0.5" />

          {/* User Account Trigger Pill */}
          <button
            onClick={onOpenUserAccount}
            className="flex items-center gap-1.5 pl-1 pr-2 py-1 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-full border border-slate-200 transition-colors shadow-2xs"
            title="點擊切換使用者身分或查看個人檔案"
          >
            <div className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold text-[11px] flex items-center justify-center shadow-2xs">
              {currentUser.name.charAt(0)}
            </div>
            <div className="hidden sm:block text-left">
              <div className="text-[11px] font-bold text-slate-900 leading-tight truncate max-w-[80px]">
                {currentUser.name}
              </div>
              <div className="text-[9px] text-slate-400 leading-none">
                {USER_ROLES_INFO[currentUser.role]?.label || '教師'}
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Mobile Nav strip */}
      <div className="md:hidden border-t border-slate-100 bg-slate-50/90 px-3 py-1.5 overflow-x-auto flex items-center gap-1 scrollbar-none">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`px-2.5 py-1 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                isActive
                  ? 'bg-indigo-600 text-white font-semibold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 bg-white border border-slate-200'
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>
    </header>
  );
};
