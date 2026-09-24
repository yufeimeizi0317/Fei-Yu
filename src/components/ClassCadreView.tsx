import React, { useState, useMemo } from 'react';
import { Classroom, Student, ClassCadre, CadreCategory, ClassTask } from '../types';
import { CADRE_CATEGORIES_INFO } from '../data/mockData';
import {
  Users,
  UserCheck,
  Shield,
  Award,
  Sparkles,
  Plus,
  Edit2,
  Trash2,
  Search,
  CheckCircle,
  AlertCircle,
  FileSpreadsheet,
  Printer,
  ChevronRight,
  ListTodo,
  Phone,
  Mail,
  UserPlus,
} from 'lucide-react';

interface Props {
  classroom: Classroom;
  students: Student[];
  cadres: ClassCadre[];
  tasks: ClassTask[];
  onUpdateCadre: (cadre: ClassCadre) => void;
  onAddCadre: (cadre: Omit<ClassCadre, 'id'>) => void;
  onDeleteCadre: (cadreId: string) => void;
  onNavigateToTasks?: (cadreRole?: string) => void;
}

export const ClassCadreView: React.FC<Props> = ({
  classroom,
  students,
  cadres,
  tasks,
  onUpdateCadre,
  onAddCadre,
  onDeleteCadre,
  onNavigateToTasks,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [editingCadre, setEditingCadre] = useState<ClassCadre | null>(null);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);

  // New Cadre Form State
  const [newRoleName, setNewRoleName] = useState('');
  const [newCategory, setNewCategory] = useState<CadreCategory>('core_admin');
  const [newStudentId, setNewStudentId] = useState('');
  const [newDuty, setNewDuty] = useState('');
  const [newNotes, setNewNotes] = useState('');

  // Class specific cadres
  const currentClassCadres = useMemo(() => {
    return cadres.filter((c) => c.classId === classroom.id);
  }, [cadres, classroom.id]);

  // Filtered cadres
  const filteredCadres = useMemo(() => {
    return currentClassCadres.filter((cadre) => {
      const matchCat = selectedCategory === 'all' || cadre.category === selectedCategory;
      const student = students.find((s) => s.id === cadre.studentId);
      const studentName = student ? student.name : '';
      const seatStr = student ? `${student.seatNumber}號` : '';
      const matchSearch =
        searchQuery === '' ||
        cadre.roleName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        studentName.includes(searchQuery) ||
        seatStr.includes(searchQuery) ||
        cadre.dutyDescription.includes(searchQuery);
      return matchCat && matchSearch;
    });
  }, [currentClassCadres, selectedCategory, searchQuery, students]);

  // Cadre Statistics
  const stats = useMemo(() => {
    const total = currentClassCadres.length;
    const assigned = currentClassCadres.filter((c) => !!c.studentId).length;
    const vacant = total - assigned;
    return { total, assigned, vacant };
  }, [currentClassCadres]);

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCadre) return;
    onUpdateCadre(editingCadre);
    setEditingCadre(null);
  };

  const handleCreateCadre = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoleName.trim()) return;

    onAddCadre({
      classId: classroom.id,
      roleName: newRoleName.trim(),
      category: newCategory,
      studentId: newStudentId || undefined,
      dutyDescription: newDuty.trim() || '依導師及校務指示辦理相關事務。',
      status: newStudentId ? 'active' : 'vacant',
      appointedDate: new Date().toISOString().slice(0, 10),
      notes: newNotes.trim() || undefined,
    });

    // Reset
    setNewRoleName('');
    setNewDuty('');
    setNewStudentId('');
    setNewNotes('');
    setShowAddModal(false);
  };

  const handlePrintCadres = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Statistics */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-5 text-white shadow-md border border-indigo-500/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight text-white flex items-center gap-2">
                <span>班級幹部與小老師團隊</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
                  {classroom.name}
                </span>
              </h2>
              <p className="text-xs text-slate-300">
                建置全方位班級自治編制，指派得力幹部協同班級常規、各科課業與活動事務。
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
          <div className="flex items-center gap-2">
            <div className="px-3 py-1.5 rounded-xl bg-white/10 border border-white/10 text-center">
              <div className="text-[10px] text-slate-300">總編制幹部</div>
              <div className="text-base font-black text-white">{stats.total}</div>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-400/30 text-center">
              <div className="text-[10px] text-emerald-200">已就任</div>
              <div className="text-base font-black text-emerald-300">{stats.assigned}</div>
            </div>
            {stats.vacant > 0 && (
              <div className="px-3 py-1.5 rounded-xl bg-amber-500/20 border border-amber-400/30 text-center">
                <div className="text-[10px] text-amber-200">待遴選</div>
                <div className="text-base font-black text-amber-300">{stats.vacant}</div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handlePrintCadres}
              className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-colors"
              title="列印或匯出幹部名單"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-3.5 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl text-xs font-bold shadow-md transition-colors flex items-center gap-1.5 shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>新增職務</span>
            </button>
          </div>
        </div>
      </div>

      {/* Control Bar: Categories & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
              selectedCategory === 'all'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            全部幹部 ({currentClassCadres.length})
          </button>
          {(Object.keys(CADRE_CATEGORIES_INFO) as CadreCategory[]).map((cat) => {
            const count = currentClassCadres.filter((c) => c.category === cat).length;
            const info = CADRE_CATEGORIES_INFO[cat];
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1 ${
                  selectedCategory === cat
                    ? 'bg-indigo-600 text-white font-bold shadow-2xs'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <span>{info.label}</span>
                <span className="opacity-75 text-[10px]">({count})</span>
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[200px] sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="搜尋職稱、姓名或座號..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Cadres Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCadres.map((cadre) => {
          const student = students.find((s) => s.id === cadre.studentId);
          const catInfo = CADRE_CATEGORIES_INFO[cadre.category] || CADRE_CATEGORIES_INFO.core_admin;
          const assignedTasks = tasks.filter(
            (t) =>
              t.classId === classroom.id &&
              (t.assignedCadreRole === cadre.roleName ||
                (cadre.studentId && t.assignedStudentId === cadre.studentId)) &&
              t.status !== 'completed'
          );

          return (
            <div
              key={cadre.id}
              className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-all p-4.5 flex flex-col justify-between group relative"
            >
              <div>
                {/* Card Header: Role Name & Category Badge */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-base font-black text-slate-900 tracking-tight">
                      {cadre.roleName}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${catInfo.bg} ${catInfo.text} ${catInfo.border}`}
                    >
                      {catInfo.label}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => setEditingCadre(cadre)}
                      className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors"
                      title="編輯職務或指派學生"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`確定要刪除「${cadre.roleName}」此項職務編制嗎？`)) {
                          onDeleteCadre(cadre.id);
                        }
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded-lg transition-colors"
                      title="刪除職務"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Assigned Student Profile Section */}
                <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-100 mb-3">
                  {student ? (
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 text-white font-black text-sm flex items-center justify-center shrink-0 shadow-2xs">
                          {student.seatNumber}
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                            <span>{student.name}</span>
                            <span className="text-[11px] text-slate-400 font-normal">
                              ({student.gender === 'male' ? '男' : '女'})
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-500 truncate">
                            學號：{student.studentId}
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => setEditingCadre(cadre)}
                        className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 bg-white px-2 py-1 rounded-lg border border-slate-200 shadow-2xs shrink-0"
                      >
                        更換
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between gap-2 py-1">
                      <div className="flex items-center gap-2 text-amber-700 text-xs font-semibold">
                        <AlertCircle className="w-4 h-4 text-amber-500" />
                        <span>目前出缺，尚未指派學生</span>
                      </div>
                      <button
                        onClick={() => setEditingCadre(cadre)}
                        className="text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 px-2.5 py-1 rounded-lg shadow-2xs"
                      >
                        指派學生
                      </button>
                    </div>
                  )}
                </div>

                {/* Duty Description */}
                <div className="space-y-1 mb-3">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    工作職掌
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                    {cadre.dutyDescription}
                  </p>
                </div>

                {/* Notes if any */}
                {cadre.notes && (
                  <div className="text-[11px] text-indigo-700 bg-indigo-50/70 p-2 rounded-lg border border-indigo-100 mb-3 flex items-start gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-500 shrink-0 mt-0.5" />
                    <span>{cadre.notes}</span>
                  </div>
                )}
              </div>

              {/* Bottom Card Footer: Associated Tasks */}
              <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <ListTodo className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-[11px] text-slate-500">
                    協辦待辦：
                    <strong className="text-slate-800 ml-0.5">
                      {assignedTasks.length} 件未完
                    </strong>
                  </span>
                </div>

                {onNavigateToTasks && (
                  <button
                    onClick={() => onNavigateToTasks(cadre.roleName)}
                    className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-0.5"
                  >
                    <span>查看任務</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Cadre Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-2xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 text-slate-900 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold">
                  <Plus className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-base text-slate-900">新增班級幹部或小老師</h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCadre} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  幹部職稱 <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="例如：生科小老師、午餐股長、圖書小天使"
                  value={newRoleName}
                  onChange={(e) => setNewRoleName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">分類領域</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as CadreCategory)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {(Object.keys(CADRE_CATEGORIES_INFO) as CadreCategory[]).map((cat) => (
                    <option key={cat} value={cat}>
                      {CADRE_CATEGORIES_INFO[cat].label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">指派學生</label>
                <select
                  value={newStudentId}
                  onChange={(e) => setNewStudentId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">-- 先行留空 (暫不出缺就任) --</option>
                  {students.map((stu) => (
                    <option key={stu.id} value={stu.id}>
                      {stu.seatNumber}號 {stu.name} ({stu.studentId})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">主要工作職掌</label>
                <textarea
                  rows={2}
                  placeholder="簡要描述職責，例如：收發各組作業、記錄實驗器材..."
                  value={newDuty}
                  onChange={(e) => setNewDuty(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">備註 / 導師叮嚀</label>
                <input
                  type="text"
                  placeholder="選填備註或要求"
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors shadow-md"
                >
                  確認建立幹部
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Cadre Modal */}
      {editingCadre && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-2xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 text-slate-900 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold">
                  <Edit2 className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-base text-slate-900">
                  編輯職務：{editingCadre.roleName}
                </h3>
              </div>
              <button
                onClick={() => setEditingCadre(null)}
                className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">幹部職稱</label>
                <input
                  type="text"
                  required
                  value={editingCadre.roleName}
                  onChange={(e) => setEditingCadre({ ...editingCadre, roleName: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">指派學生</label>
                <select
                  value={editingCadre.studentId || ''}
                  onChange={(e) =>
                    setEditingCadre({
                      ...editingCadre,
                      studentId: e.target.value || undefined,
                      status: e.target.value ? 'active' : 'vacant',
                    })
                  }
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">-- 無 (缺額待指派) --</option>
                  {students.map((stu) => (
                    <option key={stu.id} value={stu.id}>
                      {stu.seatNumber}號 {stu.name} ({stu.studentId})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">工作職掌說明</label>
                <textarea
                  rows={3}
                  value={editingCadre.dutyDescription}
                  onChange={(e) =>
                    setEditingCadre({ ...editingCadre, dutyDescription: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">備註 / 評價</label>
                <input
                  type="text"
                  value={editingCadre.notes || ''}
                  onChange={(e) =>
                    setEditingCadre({ ...editingCadre, notes: e.target.value || undefined })
                  }
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingCadre(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors shadow-md"
                >
                  儲存變更
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
