import React, { useState, useMemo } from 'react';
import { Classroom, Student, ClassTask, ClassCadre, TaskStatus, TaskPriority, TaskCategory } from '../types';
import { TASK_CATEGORIES_INFO, TASK_PRIORITY_INFO } from '../data/mockData';
import {
  ListTodo,
  CheckCircle2,
  Circle,
  Clock,
  AlertTriangle,
  Plus,
  Search,
  Filter,
  Star,
  UserCheck,
  Calendar,
  Trash2,
  Edit3,
  Sparkles,
  ArrowRight,
  Send,
  CheckSquare2,
  Tag,
  ChevronDown,
} from 'lucide-react';

interface Props {
  classroom: Classroom;
  students: Student[];
  cadres: ClassCadre[];
  tasks: ClassTask[];
  onAddTask: (task: Omit<ClassTask, 'id' | 'createdAt'>) => void;
  onUpdateTask: (task: ClassTask) => void;
  onDeleteTask: (taskId: string) => void;
  filterByCadreRole?: string;
  onNavigateToCadres?: () => void;
  onTriggerEmail?: (studentIds: string[]) => void;
}

const QUICK_TASK_TEMPLATES = [
  {
    title: '收回校外教學家長同意書與午餐調查表',
    category: 'student_affairs' as TaskCategory,
    priority: 'urgent' as TaskPriority,
    cadreRole: '班長',
    desc: '清點全班家長簽名、葷素統計及特殊疾病欄位，放學前交至學務處。',
  },
  {
    title: '催收定期評量各科習作與段落賞析作業',
    category: 'academic' as TaskCategory,
    priority: 'high' as TaskPriority,
    cadreRole: '學藝股長',
    desc: '清點缺繳名單並寄發催繳通知信。',
  },
  {
    title: '彙整本學期第一次班費收支明細表',
    category: 'general_affairs' as TaskCategory,
    priority: 'normal' as TaskPriority,
    cadreRole: '總務股長',
    desc: '核對文具耗材支出單據，產出報表公告家長群組。',
  },
  {
    title: '安排下週教室與外掃區打掃責任名冊',
    category: 'homeroom' as TaskCategory,
    priority: 'normal' as TaskPriority,
    cadreRole: '衛生股長',
    desc: '檢查竹掃把、拖把耗損情況，視需求向總務處請領。',
  },
  {
    title: '校慶運動會各項目報名表彙整與號碼布發放',
    category: 'activity' as TaskCategory,
    priority: 'normal' as TaskPriority,
    cadreRole: '體育股長',
    desc: '統計大隊接力棒次與個人田徑徑賽報名選手名單。',
  },
];

export const ClassTasksView: React.FC<Props> = ({
  classroom,
  students,
  cadres,
  tasks,
  onAddTask,
  onUpdateTask,
  onDeleteTask,
  filterByCadreRole,
  onNavigateToCadres,
  onTriggerEmail,
}) => {
  const [statusFilter, setStatusFilter] = useState<'all' | TaskStatus>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [cadreFilter, setCadreFilter] = useState<string>(filterByCadreRole || 'all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [editingTask, setEditingTask] = useState<ClassTask | null>(null);

  // Add Task Form State
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newDueDate, setNewDueDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [newDueTime, setNewDueTime] = useState('16:00');
  const [newCategory, setNewCategory] = useState<TaskCategory>('homeroom');
  const [newPriority, setNewPriority] = useState<TaskPriority>('normal');
  const [newCadreRole, setNewCadreRole] = useState<string>('');
  const [newStudentId, setNewStudentId] = useState<string>('');
  const [newIsImportant, setNewIsImportant] = useState<boolean>(false);

  // Today string YYYY-MM-DD
  const todayStr = useMemo(() => new Date().toISOString().slice(0, 10), []);

  // Class specific tasks
  const currentClassTasks = useMemo(() => {
    return tasks.filter((t) => t.classId === classroom.id);
  }, [tasks, classroom.id]);

  // Statistics
  const stats = useMemo(() => {
    const total = currentClassTasks.length;
    const pending = currentClassTasks.filter((t) => t.status === 'pending').length;
    const inProgress = currentClassTasks.filter((t) => t.status === 'in_progress').length;
    const completed = currentClassTasks.filter((t) => t.status === 'completed').length;
    const urgentOrDueToday = currentClassTasks.filter(
      (t) => t.status !== 'completed' && (t.priority === 'urgent' || t.dueDate === todayStr || t.dueDate < todayStr)
    ).length;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    return { total, pending, inProgress, completed, urgentOrDueToday, completionRate };
  }, [currentClassTasks, todayStr]);

  // Filtered tasks
  const filteredTasks = useMemo(() => {
    return currentClassTasks
      .filter((task) => {
        const matchStatus = statusFilter === 'all' || task.status === statusFilter;
        const matchCategory = categoryFilter === 'all' || task.category === categoryFilter;
        const matchPriority = priorityFilter === 'all' || task.priority === priorityFilter;
        const matchCadre = cadreFilter === 'all' || task.assignedCadreRole === cadreFilter;

        const assignedStudent = students.find((s) => s.id === task.assignedStudentId);
        const studentName = assignedStudent ? assignedStudent.name : '';

        const matchSearch =
          searchQuery === '' ||
          task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (task.assignedCadreRole && task.assignedCadreRole.includes(searchQuery)) ||
          studentName.includes(searchQuery);

        return matchStatus && matchCategory && matchPriority && matchCadre && matchSearch;
      })
      .sort((a, b) => {
        // Incomplete first, then important, then due date
        if (a.status === 'completed' && b.status !== 'completed') return 1;
        if (a.status !== 'completed' && b.status === 'completed') return -1;
        if (a.isImportant && !b.isImportant) return -1;
        if (!a.isImportant && b.isImportant) return 1;
        return a.dueDate.localeCompare(b.dueDate);
      });
  }, [currentClassTasks, statusFilter, categoryFilter, priorityFilter, cadreFilter, searchQuery, students]);

  // Toggle complete
  const handleToggleComplete = (task: ClassTask) => {
    const isNowDone = task.status !== 'completed';
    onUpdateTask({
      ...task,
      status: isNowDone ? 'completed' : 'pending',
      completedAt: isNowDone ? new Date().toISOString() : undefined,
    });
  };

  // Toggle important star
  const handleToggleImportant = (task: ClassTask) => {
    onUpdateTask({
      ...task,
      isImportant: !task.isImportant,
    });
  };

  // Create Task
  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    onAddTask({
      classId: classroom.id,
      title: newTitle.trim(),
      description: newDesc.trim() || undefined,
      dueDate: newDueDate,
      dueTime: newDueTime || undefined,
      priority: newPriority,
      category: newCategory,
      status: 'pending',
      assignedCadreRole: newCadreRole || undefined,
      assignedStudentId: newStudentId || undefined,
      isImportant: newIsImportant,
    });

    // Reset
    setNewTitle('');
    setNewDesc('');
    setNewCadreRole('');
    setNewStudentId('');
    setNewIsImportant(false);
    setShowAddModal(false);
  };

  // Apply Quick Template
  const handleApplyTemplate = (tmpl: (typeof QUICK_TASK_TEMPLATES)[0]) => {
    setNewTitle(tmpl.title);
    setNewDesc(tmpl.desc);
    setNewCategory(tmpl.category);
    setNewPriority(tmpl.priority);
    setNewCadreRole(tmpl.cadreRole);

    // Auto-match cadre's student
    const matchedCadre = cadres.find(
      (c) => c.classId === classroom.id && c.roleName === tmpl.cadreRole
    );
    if (matchedCadre?.studentId) {
      setNewStudentId(matchedCadre.studentId);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & KPI Summary */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-5 text-white shadow-md border border-indigo-500/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <ListTodo className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight text-white flex items-center gap-2">
                <span>班級日常待辦與任務指派</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
                  {classroom.name}
                </span>
              </h2>
              <p className="text-xs text-slate-300">
                掌握教務收發、學務活動、總務班費與常規事務，指派幹部協同執行更高效。
              </p>
            </div>
          </div>
        </div>

        {/* Action button */}
        <div className="flex items-center gap-2 self-end md:self-auto">
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl text-xs font-bold shadow-md transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>建立新待辦</span>
          </button>
        </div>
      </div>

      {/* 4 Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">總待辦事項</span>
            <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <ListTodo className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{stats.total}</span>
            <span className="text-xs text-slate-400">件</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">包含各類常規與活動</div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-rose-200/80 shadow-2xs bg-gradient-to-br from-white to-rose-50/30">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-700">今日到期 / 特急件</span>
            <div className="w-7 h-7 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-rose-800">{stats.urgentOrDueToday}</span>
            <span className="text-xs text-rose-600">件急需關注</span>
          </div>
          <div className="text-[11px] text-rose-600 mt-1">請提醒負責幹部跟進</div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">進行中處理中</span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-amber-800">{stats.inProgress}</span>
            <span className="text-xs text-slate-400">件</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">待處理尚有 {stats.pending} 件</div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">完成率</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-700">{stats.completionRate}%</span>
            <span className="text-xs text-slate-400">({stats.completed} 件完成)</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${stats.completionRate}%` }}
            />
          </div>
        </div>
      </div>

      {/* Control Bar: Status Tabs, Category Filter, Cadre Filter, Search */}
      <div className="space-y-3">
        {/* Row 1: Status Tabs */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
                statusFilter === 'all'
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              全部 ({stats.total})
            </button>
            <button
              onClick={() => setStatusFilter('pending')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
                statusFilter === 'pending'
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              待處理 ({stats.pending})
            </button>
            <button
              onClick={() => setStatusFilter('in_progress')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
                statusFilter === 'in_progress'
                  ? 'bg-amber-600 text-white shadow-2xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              進行中 ({stats.inProgress})
            </button>
            <button
              onClick={() => setStatusFilter('completed')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
                statusFilter === 'completed'
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              已完成 ({stats.completed})
            </button>
          </div>

          {/* Search Input */}
          <div className="relative min-w-[200px] sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="搜尋待辦事項、幹部或學生..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Row 2: Secondary Dropdown Filters */}
        <div className="flex items-center gap-2 flex-wrap text-xs text-slate-600">
          <div className="flex items-center gap-1.5 font-semibold text-slate-500">
            <Filter className="w-3.5 h-3.5" />
            <span>進階篩選：</span>
          </div>

          {/* Category Dropdown */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
          >
            <option value="all">所有類別 (全部)</option>
            {(Object.keys(TASK_CATEGORIES_INFO) as TaskCategory[]).map((cat) => (
              <option key={cat} value={cat}>
                {TASK_CATEGORIES_INFO[cat].label}
              </option>
            ))}
          </select>

          {/* Priority Dropdown */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
          >
            <option value="all">所有優先級</option>
            {(Object.keys(TASK_PRIORITY_INFO) as TaskPriority[]).map((p) => (
              <option key={p} value={p}>
                {TASK_PRIORITY_INFO[p].label}
              </option>
            ))}
          </select>

          {/* Cadre Filter Dropdown */}
          <select
            value={cadreFilter}
            onChange={(e) => setCadreFilter(e.target.value)}
            className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
          >
            <option value="all">所有協辦幹部</option>
            {cadres
              .filter((c) => c.classId === classroom.id)
              .map((c) => (
                <option key={c.id} value={c.roleName}>
                  {c.roleName}
                </option>
              ))}
          </select>

          {(categoryFilter !== 'all' || priorityFilter !== 'all' || cadreFilter !== 'all') && (
            <button
              onClick={() => {
                setCategoryFilter('all');
                setPriorityFilter('all');
                setCadreFilter('all');
              }}
              className="text-xs text-indigo-600 hover:text-indigo-800 underline ml-1"
            >
              清除篩選
            </button>
          )}
        </div>
      </div>

      {/* Task List Items */}
      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
              <CheckSquare2 className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-sm">目前無相符的待辦事項</h4>
              <p className="text-xs text-slate-400 mt-1">
                點擊上方「建立新待辦」或選擇範本快速建立。
              </p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold shadow-xs hover:bg-indigo-700 transition-colors inline-flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>新增第一筆任務</span>
            </button>
          </div>
        ) : (
          filteredTasks.map((task) => {
            const isDone = task.status === 'completed';
            const catInfo = TASK_CATEGORIES_INFO[task.category] || TASK_CATEGORIES_INFO.other;
            const priorityInfo = TASK_PRIORITY_INFO[task.priority] || TASK_PRIORITY_INFO.normal;
            const assignedStudent = students.find((s) => s.id === task.assignedStudentId);

            const isDueToday = task.dueDate === todayStr;
            const isOverdue = task.dueDate < todayStr && !isDone;

            return (
              <div
                key={task.id}
                className={`bg-white rounded-2xl border transition-all p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 group ${
                  isDone
                    ? 'border-slate-200 bg-slate-50/60 opacity-80'
                    : isOverdue
                    ? 'border-rose-300 shadow-xs ring-1 ring-rose-200'
                    : isDueToday
                    ? 'border-amber-300 shadow-xs'
                    : 'border-slate-200/90 shadow-2xs hover:shadow-md'
                }`}
              >
                {/* Left: Checkbox + Star + Content */}
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  {/* Checkbox Button */}
                  <button
                    onClick={() => handleToggleComplete(task)}
                    className="mt-0.5 text-slate-300 hover:text-indigo-600 transition-colors shrink-0"
                    title={isDone ? '標記為未完成' : '標記為已完成'}
                  >
                    {isDone ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 fill-emerald-100" />
                    ) : (
                      <Circle className="w-5 h-5 hover:text-indigo-600" />
                    )}
                  </button>

                  {/* Important Star */}
                  <button
                    onClick={() => handleToggleImportant(task)}
                    className="mt-0.5 text-slate-300 hover:text-amber-500 transition-colors shrink-0"
                    title={task.isImportant ? '取消星號標記' : '標記為重要事項'}
                  >
                    <Star
                      className={`w-4 h-4 ${
                        task.isImportant ? 'text-amber-500 fill-amber-400' : 'text-slate-300'
                      }`}
                    />
                  </button>

                  {/* Title & Meta Details */}
                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`text-sm font-bold tracking-tight text-slate-900 ${
                          isDone ? 'line-through text-slate-400' : ''
                        }`}
                      >
                        {task.title}
                      </span>

                      {/* Priority Badge */}
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded border font-semibold ${priorityInfo.badgeClass}`}
                      >
                        {priorityInfo.label}
                      </span>

                      {/* Category Badge */}
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded border font-semibold ${catInfo.bg} ${catInfo.text} ${catInfo.border}`}
                      >
                        {catInfo.label}
                      </span>
                    </div>

                    {/* Description if present */}
                    {task.description && (
                      <p
                        className={`text-xs text-slate-500 line-clamp-2 ${
                          isDone ? 'line-through text-slate-300' : ''
                        }`}
                      >
                        {task.description}
                      </p>
                    )}

                    {/* Meta row: Due Date, Assigned Cadre, Student */}
                    <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap pt-0.5">
                      {/* Due Date Indicator */}
                      <div
                        className={`flex items-center gap-1 font-medium ${
                          isOverdue
                            ? 'text-rose-600 font-bold'
                            : isDueToday
                            ? 'text-amber-600 font-bold'
                            : 'text-slate-500'
                        }`}
                      >
                        <Calendar className="w-3.5 h-3.5" />
                        <span>
                          {isOverdue ? '⚠️ 已逾期：' : isDueToday ? '⏰ 今日截止：' : '截止：'}
                          {task.dueDate} {task.dueTime || ''}
                        </span>
                      </div>

                      {/* Assigned Cadre */}
                      {task.assignedCadreRole && (
                        <div className="flex items-center gap-1 text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md font-semibold">
                          <UserCheck className="w-3.5 h-3.5 text-indigo-600" />
                          <span>協辦幹部：{task.assignedCadreRole}</span>
                          {assignedStudent && (
                            <span className="text-slate-600 font-normal">
                              ({assignedStudent.seatNumber}號 {assignedStudent.name})
                            </span>
                          )}
                        </div>
                      )}

                      {/* Completed At Timestamp */}
                      {task.completedAt && (
                        <span className="text-[11px] text-emerald-600">
                          ✓ 於 {task.completedAt.slice(0, 16).replace('T', ' ')} 完成
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                  {/* Status Toggle Pill */}
                  <select
                    value={task.status}
                    onChange={(e) =>
                      onUpdateTask({ ...task, status: e.target.value as TaskStatus })
                    }
                    className="text-xs px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-semibold focus:outline-none"
                  >
                    <option value="pending">待處理</option>
                    <option value="in_progress">進行中</option>
                    <option value="completed">已完成</option>
                  </select>

                  <button
                    onClick={() => setEditingTask(task)}
                    className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors"
                    title="編輯任務"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => {
                      if (confirm(`確定要刪除「${task.title}」這項待辦嗎？`)) {
                        onDeleteTask(task.id);
                      }
                    }}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded-lg transition-colors"
                    title="刪除任務"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Task Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-2xs p-4 animate-in fade-in duration-200 overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-slate-200 text-slate-900 space-y-4 my-8">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">建立班級待辦任務</h3>
                  <p className="text-[11px] text-slate-400">指派協辦幹部與設定截止期限</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            {/* Quick Template Buttons */}
            <div className="space-y-1.5">
              <div className="text-xs font-bold text-slate-500 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>常用教學常態範本（點選快速填寫）：</span>
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                {QUICK_TASK_TEMPLATES.map((tmpl, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleApplyTemplate(tmpl)}
                    className="px-2.5 py-1 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 rounded-lg text-[11px] font-medium border border-slate-200 transition-colors"
                  >
                    {tmpl.title.slice(0, 14)}...
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-3.5 pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  待辦事項標題 <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="例如：收回校外教學家長同意書、彙整班費..."
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  任務詳細說明與檢核標準
                </label>
                <textarea
                  rows={2}
                  placeholder="填寫任務細節、預算、繳交處或提醒事項..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">事務分類</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as TaskCategory)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {(Object.keys(TASK_CATEGORIES_INFO) as TaskCategory[]).map((cat) => (
                      <option key={cat} value={cat}>
                        {TASK_CATEGORIES_INFO[cat].label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">優先級別</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as TaskPriority)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {(Object.keys(TASK_PRIORITY_INFO) as TaskPriority[]).map((p) => (
                      <option key={p} value={p}>
                        {TASK_PRIORITY_INFO[p].label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    截止日期 <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={newDueDate}
                    onChange={(e) => setNewDueDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">截止時間</label>
                  <input
                    type="time"
                    value={newDueTime}
                    onChange={(e) => setNewDueTime(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    協辦幹部職稱
                  </label>
                  <select
                    value={newCadreRole}
                    onChange={(e) => {
                      const role = e.target.value;
                      setNewCadreRole(role);
                      const matched = cadres.find(
                        (c) => c.classId === classroom.id && c.roleName === role
                      );
                      if (matched?.studentId) {
                        setNewStudentId(matched.studentId);
                      }
                    }}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">-- 由導師自行處理 (不指派幹部) --</option>
                    {cadres
                      .filter((c) => c.classId === classroom.id)
                      .map((c) => (
                        <option key={c.id} value={c.roleName}>
                          {c.roleName}
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">指派特定學生</label>
                  <select
                    value={newStudentId}
                    onChange={(e) => setNewStudentId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">-- 依幹部預設或無特定 --</option>
                    {students.map((stu) => (
                      <option key={stu.id} value={stu.id}>
                        {stu.seatNumber}號 {stu.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="markImportant"
                  checked={newIsImportant}
                  onChange={(e) => setNewIsImportant(e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="markImportant" className="text-xs font-semibold text-slate-700 cursor-pointer">
                  加星號標記為焦點重要事項（置頂顯示）
                </label>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
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
                  確認建立待辦
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Task Modal */}
      {editingTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-2xs p-4 animate-in fade-in duration-200 overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-slate-200 text-slate-900 space-y-4 my-8">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold">
                  <Edit3 className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-base text-slate-900">編輯待辦事項</h3>
              </div>
              <button
                onClick={() => setEditingTask(null)}
                className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                onUpdateTask(editingTask);
                setEditingTask(null);
              }}
              className="space-y-3.5"
            >
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">標題</label>
                <input
                  type="text"
                  required
                  value={editingTask.title}
                  onChange={(e) => setEditingTask({ ...editingTask, title: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">詳細說明</label>
                <textarea
                  rows={2}
                  value={editingTask.description || ''}
                  onChange={(e) =>
                    setEditingTask({ ...editingTask, description: e.target.value || undefined })
                  }
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">事務分類</label>
                  <select
                    value={editingTask.category}
                    onChange={(e) =>
                      setEditingTask({ ...editingTask, category: e.target.value as TaskCategory })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {(Object.keys(TASK_CATEGORIES_INFO) as TaskCategory[]).map((cat) => (
                      <option key={cat} value={cat}>
                        {TASK_CATEGORIES_INFO[cat].label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">優先級別</label>
                  <select
                    value={editingTask.priority}
                    onChange={(e) =>
                      setEditingTask({ ...editingTask, priority: e.target.value as TaskPriority })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {(Object.keys(TASK_PRIORITY_INFO) as TaskPriority[]).map((p) => (
                      <option key={p} value={p}>
                        {TASK_PRIORITY_INFO[p].label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">截止日期</label>
                  <input
                    type="date"
                    required
                    value={editingTask.dueDate}
                    onChange={(e) => setEditingTask({ ...editingTask, dueDate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">執行狀態</label>
                  <select
                    value={editingTask.status}
                    onChange={(e) =>
                      setEditingTask({ ...editingTask, status: e.target.value as TaskStatus })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
                  >
                    <option value="pending">待處理</option>
                    <option value="in_progress">進行中</option>
                    <option value="completed">已完成</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">協辦幹部</label>
                  <select
                    value={editingTask.assignedCadreRole || ''}
                    onChange={(e) =>
                      setEditingTask({
                        ...editingTask,
                        assignedCadreRole: e.target.value || undefined,
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">-- 無指派 --</option>
                    {cadres
                      .filter((c) => c.classId === classroom.id)
                      .map((c) => (
                        <option key={c.id} value={c.roleName}>
                          {c.roleName}
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">指派學生</label>
                  <select
                    value={editingTask.assignedStudentId || ''}
                    onChange={(e) =>
                      setEditingTask({
                        ...editingTask,
                        assignedStudentId: e.target.value || undefined,
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">-- 無特定學生 --</option>
                    {students.map((stu) => (
                      <option key={stu.id} value={stu.id}>
                        {stu.seatNumber}號 {stu.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingTask(null)}
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
