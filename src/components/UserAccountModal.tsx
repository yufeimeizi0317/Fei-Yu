import React, { useState } from 'react';
import { UserAccount, UserRole, Classroom } from '../types';
import { USER_ROLES_INFO } from '../data/mockData';
import {
  User,
  Users,
  ShieldCheck,
  Check,
  Plus,
  LogOut,
  Mail,
  School,
  BookOpen,
  KeyRound,
  Trash2,
  Edit2,
  Sparkles,
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserAccount;
  users: UserAccount[];
  classes: Classroom[];
  onSwitchUser: (user: UserAccount) => void;
  onUpdateCurrentUser: (user: UserAccount) => void;
  onAddNewUser: (newUser: UserAccount) => void;
  onDeleteUser: (userId: string) => void;
}

const AVATAR_COLORS: { id: string; name: string; bg: string; text: string; ring: string }[] = [
  { id: 'indigo', name: '靛青藍', bg: 'bg-indigo-600', text: 'text-white', ring: 'ring-indigo-500' },
  { id: 'purple', name: '紫羅蘭', bg: 'bg-purple-600', text: 'text-white', ring: 'ring-purple-500' },
  { id: 'emerald', name: '翡翠綠', bg: 'bg-emerald-600', text: 'text-white', ring: 'ring-emerald-500' },
  { id: 'amber', name: '琥珀橘', bg: 'bg-amber-600', text: 'text-white', ring: 'ring-amber-500' },
  { id: 'rose', name: '玫瑰紅', bg: 'bg-rose-600', text: 'text-white', ring: 'ring-rose-500' },
  { id: 'sky', name: '晴空藍', bg: 'bg-sky-600', text: 'text-white', ring: 'ring-sky-500' },
  { id: 'teal', name: '松石綠', bg: 'bg-teal-600', text: 'text-white', ring: 'ring-teal-500' },
];

export const UserAccountModal: React.FC<Props> = ({
  isOpen,
  onClose,
  currentUser,
  users,
  classes,
  onSwitchUser,
  onUpdateCurrentUser,
  onAddNewUser,
  onDeleteUser,
}) => {
  const [activeTab, setActiveTab] = useState<'switch' | 'profile' | 'create'>('switch');

  // Profile Edit Form state
  const [name, setName] = useState(currentUser.name);
  const [email, setEmail] = useState(currentUser.email);
  const [title, setTitle] = useState(currentUser.title);
  const [schoolName, setSchoolName] = useState(currentUser.schoolName);
  const [subject, setSubject] = useState(currentUser.subject || '');
  const [avatarColor, setAvatarColor] = useState(currentUser.avatarColor || 'indigo');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // New User Form state
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('homeroom_teacher');
  const [newTitle, setNewTitle] = useState('');
  const [newSchool, setNewSchool] = useState(currentUser.schoolName || '市立大安國民中學');
  const [newSubject, setNewSubject] = useState('');
  const [newAvatarColor, setNewAvatarColor] = useState('emerald');
  const [selectedClassIds, setSelectedClassIds] = useState<string[]>(['*']);

  if (!isOpen) return null;

  // Handle saving profile changes
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: UserAccount = {
      ...currentUser,
      name: name.trim(),
      email: email.trim(),
      title: title.trim(),
      schoolName: schoolName.trim(),
      subject: subject.trim() || undefined,
      avatarColor,
    };
    onUpdateCurrentUser(updated);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  // Handle creating new user
  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newEmail.trim()) return;

    const newUser: UserAccount = {
      id: `user-${Date.now()}`,
      name: newName.trim(),
      email: newEmail.trim(),
      role: newRole,
      title: newTitle.trim() || `${USER_ROLES_INFO[newRole].label}`,
      schoolName: newSchool.trim() || currentUser.schoolName,
      avatarColor: newAvatarColor,
      assignedClassIds: selectedClassIds.length === 0 ? ['*'] : selectedClassIds,
      subject: newSubject.trim() || undefined,
      createdAt: new Date().toISOString().split('T')[0],
      lastLoginAt: '剛剛',
    };

    onAddNewUser(newUser);
    // Auto switch to newly created user
    onSwitchUser(newUser);
    setActiveTab('switch');
    // Reset
    setNewName('');
    setNewEmail('');
    setNewTitle('');
  };

  const getAvatarBg = (colorKey: string) => {
    const item = AVATAR_COLORS.find((c) => c.id === colorKey);
    return item ? item.bg : 'bg-indigo-600';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-2xs p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Top Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`w-12 h-12 rounded-2xl ${getAvatarBg(
                  currentUser.avatarColor
                )} flex items-center justify-center text-white font-bold text-lg shadow-md ring-2 ring-white/20`}
              >
                {currentUser.name.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-white">{currentUser.name}</h2>
                  <span className="px-2 py-0.5 text-[11px] font-semibold bg-white/20 text-white rounded-full">
                    {USER_ROLES_INFO[currentUser.role]?.label || '教師'}
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-0.5">
                  {currentUser.title} · {currentUser.schoolName}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-200 flex items-center justify-center transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Sub Navigation Tabs */}
          <div className="flex items-center gap-2 mt-5 border-b border-white/10">
            <button
              onClick={() => setActiveTab('switch')}
              className={`pb-2.5 px-3 text-xs font-semibold flex items-center gap-1.5 transition-colors border-b-2 ${
                activeTab === 'switch'
                  ? 'border-indigo-400 text-white'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>切換使用者 ({users.length})</span>
            </button>

            <button
              onClick={() => {
                setName(currentUser.name);
                setEmail(currentUser.email);
                setTitle(currentUser.title);
                setSchoolName(currentUser.schoolName);
                setSubject(currentUser.subject || '');
                setAvatarColor(currentUser.avatarColor || 'indigo');
                setActiveTab('profile');
              }}
              className={`pb-2.5 px-3 text-xs font-semibold flex items-center gap-1.5 transition-colors border-b-2 ${
                activeTab === 'profile'
                  ? 'border-indigo-400 text-white'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>個人帳號設定</span>
            </button>

            <button
              onClick={() => setActiveTab('create')}
              className={`pb-2.5 px-3 text-xs font-semibold flex items-center gap-1.5 transition-colors border-b-2 ${
                activeTab === 'create'
                  ? 'border-indigo-400 text-white'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>註冊新教師 / 幹部帳號</span>
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {/* 1. SWITCH USER VIEW */}
          {activeTab === 'switch' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                <span>點擊任意身分即可立即切換登入視角：</span>
                <span className="font-medium text-indigo-600">目前身分：{currentUser.name}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {users.map((user) => {
                  const isCurrent = user.id === currentUser.id;
                  const roleInfo = USER_ROLES_INFO[user.role] || USER_ROLES_INFO.homeroom_teacher;

                  return (
                    <div
                      key={user.id}
                      onClick={() => {
                        onSwitchUser(user);
                        onClose();
                      }}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer relative group ${
                        isCurrent
                          ? 'bg-indigo-50/70 border-indigo-400 ring-2 ring-indigo-200 shadow-xs'
                          : 'bg-white border-slate-200 hover:border-indigo-300 hover:bg-slate-50/70'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-10 h-10 rounded-xl ${getAvatarBg(
                              user.avatarColor
                            )} text-white font-bold flex items-center justify-center shadow-2xs`}
                          >
                            {user.name.charAt(0)}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-slate-900 text-sm">{user.name}</span>
                              {isCurrent && (
                                <span className="px-1.5 py-0.2 bg-indigo-600 text-white text-[10px] font-bold rounded">
                                  使用中
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                              {user.email}
                            </div>
                          </div>
                        </div>

                        {/* Delete button (only if not current and more than 1 user) */}
                        {!isCurrent && users.length > 1 && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (window.confirm(`確定要刪除帳號「${user.name}」嗎？`)) {
                                onDeleteUser(user.id);
                              }
                            }}
                            className="text-slate-300 hover:text-rose-500 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            title="刪除此帳號"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      <div className="mt-2.5 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
                        <span className={`px-2 py-0.5 rounded-md border text-[11px] font-semibold ${roleInfo.badgeBg}`}>
                          {roleInfo.label}
                        </span>
                        <span className="text-[11px] text-slate-400 truncate max-w-[140px]">
                          {user.title}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Roles explanation banner */}
              <div className="bg-slate-50 rounded-2xl border border-slate-200 p-3.5 text-xs text-slate-600 mt-4">
                <div className="font-semibold text-slate-800 mb-1.5 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-indigo-600" />
                  <span>身分權限說明</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-500">
                  <div>• <b>導師</b>：班級全權點名、成績作業統整、個別發信通報</div>
                  <div>• <b>科任老師</b>：該科專任課堂點名、專科作業盤點</div>
                  <div>• <b>行政主管</b>：全校班級切換、資料匯出備份與系統設定</div>
                  <div>• <b>課務幹部</b>：協助班級現場 QR 報到與作業清點</div>
                </div>
              </div>
            </div>
          )}

          {/* 2. PROFILE EDIT VIEW */}
          {activeTab === 'profile' && (
            <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
              {saveSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>個人資料已成功更新儲存！</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">真實姓名 *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">校務電子郵件 *</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">任職學校</label>
                  <input
                    type="text"
                    value={schoolName}
                    onChange={(e) => setSchoolName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">職稱與職責</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">任教學科領域</label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="例如：國文、數學、英語、理化..."
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1.5">代表頭像代表色</label>
                  <div className="flex items-center gap-2">
                    {AVATAR_COLORS.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setAvatarColor(c.id)}
                        className={`w-7 h-7 rounded-full ${c.bg} transition-transform ${
                          avatarColor === c.id ? 'ring-2 ring-offset-2 ring-indigo-500 scale-110' : 'opacity-80 hover:opacity-100'
                        }`}
                        title={c.name}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-medium"
                >
                  關閉
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold shadow-2xs transition-colors"
                >
                  儲存個人檔案
                </button>
              </div>
            </form>
          )}

          {/* 3. CREATE NEW USER VIEW */}
          {activeTab === 'create' && (
            <form onSubmit={handleCreateUser} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">教師 / 幹部姓名 *</label>
                  <input
                    type="text"
                    required
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="例如：黃淑玲 老師"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">校務登入信箱 *</label>
                  <input
                    type="email"
                    required
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="teacher@school.edu.tw"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">系統身分角色 *</label>
                  <select
                    value={newRole}
                    onChange={(e) => {
                      const r = e.target.value as UserRole;
                      setNewRole(r);
                      setNewTitle(USER_ROLES_INFO[r].label);
                    }}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                  >
                    <option value="homeroom_teacher">班級導師</option>
                    <option value="subject_teacher">科任教師</option>
                    <option value="admin">學務行政 / 主任</option>
                    <option value="class_officer">課務幹部 / 班長</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">職稱與備註</label>
                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="例如：八年義班 導師 (地理專任)"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">任教學科</label>
                  <input
                    type="text"
                    value={newSubject}
                    onChange={(e) => setNewSubject(e.target.value)}
                    placeholder="例如：地理、歷史、音樂..."
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1.5">代表顏色</label>
                  <div className="flex items-center gap-2">
                    {AVATAR_COLORS.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setNewAvatarColor(c.id)}
                        className={`w-7 h-7 rounded-full ${c.bg} transition-transform ${
                          newAvatarColor === c.id ? 'ring-2 ring-offset-2 ring-indigo-500 scale-110' : 'opacity-80 hover:opacity-100'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Class permissions */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  授權管理班級
                </label>
                <div className="flex flex-wrap gap-2">
                  <label className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedClassIds.includes('*')}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedClassIds(['*']);
                        } else {
                          setSelectedClassIds([classes[0]?.id || 'class-802']);
                        }
                      }}
                      className="rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>全校所有班級 (*)</span>
                  </label>

                  {!selectedClassIds.includes('*') &&
                    classes.map((c) => (
                      <label
                        key={c.id}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selectedClassIds.includes(c.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedClassIds([...selectedClassIds, c.id]);
                            } else {
                              setSelectedClassIds(selectedClassIds.filter((id) => id !== c.id));
                            }
                          }}
                          className="rounded text-indigo-600 focus:ring-indigo-500"
                        />
                        <span>{c.name}</span>
                      </label>
                    ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('switch')}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-medium"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold shadow-2xs transition-colors"
                >
                  完成註冊並登入
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
