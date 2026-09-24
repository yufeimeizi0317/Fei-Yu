import React, { useState, useMemo } from 'react';
import { Classroom, Student } from '../types';
import { exportToCsv } from '../utils/helpers';
import {
  Plus,
  Search,
  Download,
  Upload,
  Edit2,
  Trash2,
} from 'lucide-react';

interface Props {
  classroom: Classroom;
  students: Student[];
  onAddStudent: (student: Student) => void;
  onUpdateStudent: (student: Student) => void;
  onDeleteStudent: (studentId: string) => void;
  onBatchImportStudents: (students: Student[]) => void;
  onUpdateClassroom: (classroom: Classroom) => void;
}

export const StudentRosterView: React.FC<Props> = ({
  classroom,
  students,
  onAddStudent,
  onUpdateStudent,
  onDeleteStudent,
  onBatchImportStudents,
  onUpdateClassroom,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [genderFilter, setGenderFilter] = useState<'all' | 'male' | 'female'>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  // Add/Edit student form state
  const [formSeat, setFormSeat] = useState<number>(students.length + 1);
  const [formName, setFormName] = useState('');
  const [formGender, setFormGender] = useState<'male' | 'female'>('male');
  const [formStudentId, setFormStudentId] = useState('');

  // Batch import text
  const [batchText, setBatchText] = useState('');

  // Filter students
  const filteredStudents = useMemo(() => {
    return students
      .filter((s) => {
        const matchSearch =
          s.name.includes(searchQuery) ||
          String(s.seatNumber).includes(searchQuery) ||
          s.studentId.includes(searchQuery);

        const matchGender = genderFilter === 'all' || s.gender === genderFilter;
        return matchSearch && matchGender;
      })
      .sort((a, b) => a.seatNumber - b.seatNumber);
  }, [students, searchQuery, genderFilter]);

  const openAddModal = () => {
    setEditingStudent(null);
    setFormSeat(students.length + 1);
    setFormName('');
    setFormGender('male');
    setFormStudentId(`${classroom.name.slice(0, 3)}${String(students.length + 1).padStart(2, '0')}`);
    setShowAddModal(true);
  };

  const openEditModal = (student: Student) => {
    setEditingStudent(student);
    setFormSeat(student.seatNumber);
    setFormName(student.name);
    setFormGender(student.gender);
    setFormStudentId(student.studentId);
    setShowAddModal(true);
  };

  const handleSaveStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    if (editingStudent) {
      const updated: Student = {
        ...editingStudent,
        seatNumber: formSeat,
        name: formName.trim(),
        gender: formGender,
        studentId: formStudentId.trim(),
      };
      onUpdateStudent(updated);
    } else {
      const newStu: Student = {
        id: `stu-${Date.now()}`,
        classId: classroom.id,
        seatNumber: formSeat,
        name: formName.trim(),
        gender: formGender,
        studentId: formStudentId.trim() || `S${formSeat}`,
      };
      onAddStudent(newStu);
    }

    setShowAddModal(false);
  };

  // Process batch import text
  const handleProcessBatch = () => {
    if (!batchText.trim()) return;

    const lines = batchText.trim().split('\n');
    const imported: Student[] = [];

    lines.forEach((line, idx) => {
      const parts = line.split(/[,\t，]/).map((p) => p.trim());
      if (parts.length >= 2) {
        const seat = parseInt(parts[0]) || idx + 1;
        const name = parts[1];
        const gender: 'male' | 'female' = parts[2]?.includes('女') ? 'female' : 'male';
        const studentId = parts[3] || `ID${seat}`;

        imported.push({
          id: `stu-import-${Date.now()}-${idx}`,
          classId: classroom.id,
          seatNumber: seat,
          name,
          gender,
          studentId,
        });
      }
    });

    if (imported.length > 0) {
      onBatchImportStudents(imported);
      setShowBatchModal(false);
      setBatchText('');
      alert(`成功匯入 ${imported.length} 位學生名單！`);
    } else {
      alert('格式不符，請參考範例輸入每行至少「座號, 姓名」。');
    }
  };

  // Export roster to CSV
  const handleExportCsv = () => {
    const headers = ['班級', '座號', '姓名', '性別', '學號'];
    const rows = students.map((s) => [
      classroom.name,
      s.seatNumber,
      s.name,
      s.gender === 'male' ? '男' : '女',
      s.studentId,
    ]);
    exportToCsv(`${classroom.name}_學生名冊`, headers, rows);
  };

  return (
    <div className="space-y-6">
      {/* Control bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="搜尋座號、姓名、學號或Email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
              {[
                { id: 'all', label: `全部 (${students.length})` },
                { id: 'male', label: `男生 (${students.filter((s) => s.gender === 'male').length})` },
                { id: 'female', label: `女生 (${students.filter((s) => s.gender === 'female').length})` },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setGenderFilter(tab.id as any)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                    genderFilter === tab.id
                      ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={openAddModal}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-2xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>新增學生</span>
            </button>

            <button
              onClick={() => setShowBatchModal(true)}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg transition-colors"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>批次文字匯入</span>
            </button>

            <button
              onClick={handleExportCsv}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>匯出名冊</span>
            </button>
          </div>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4 w-16 text-center">座號</th>
                <th className="py-3 px-4 w-44">學生姓名</th>
                <th className="py-3 px-4 w-28">性別</th>
                <th className="py-3 px-4 min-w-[160px]">學號</th>
                <th className="py-3 px-4 w-24 text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4 text-center font-mono tabular-nums font-bold text-slate-700">
                    {String(s.seatNumber).padStart(2, '0')}
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-900 text-sm">
                    {s.name}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[11px] font-medium ${
                        s.gender === 'male'
                          ? 'bg-sky-50 text-sky-700 border border-sky-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}
                    >
                      {s.gender === 'male' ? '男' : '女'}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-500">{s.studentId}</td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => openEditModal(s)}
                        className="p-1 text-slate-400 hover:text-indigo-600 rounded transition-colors"
                        title="編輯學生"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`確定要刪除學生「${s.name}」嗎？`)) {
                            onDeleteStudent(s.id);
                          }
                        }}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                        title="刪除學生"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Add or Edit Student */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-2xs p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base">
                {editingStudent ? '編輯學生資料' : '新增學生至名冊'}
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveStudent} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">座號</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    required
                    value={formSeat}
                    onChange={(e) => setFormSeat(Number(e.target.value))}
                    className="w-full px-3 py-2 font-mono border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">性別</label>
                  <select
                    value={formGender}
                    onChange={(e) => setFormGender(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="male">男</option>
                    <option value="female">女</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">學生姓名</label>
                  <input
                    type="text"
                    required
                    placeholder="例如：陳冠宇"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">學號</label>
                  <input
                    type="text"
                    value={formStudentId}
                    onChange={(e) => setFormStudentId(e.target.value)}
                    className="w-full px-3 py-2 font-mono border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors font-medium"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors font-medium shadow-xs"
                >
                  {editingStudent ? '儲存變更' : '確定新增'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Batch Import */}
      {showBatchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-2xs p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base">批次文字匯入名冊</h3>
              <button
                onClick={() => setShowBatchModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm"
              >
                ✕
              </button>
            </div>

            <div className="text-xs text-slate-500 space-y-1">
              <p>請將 Excel、試算表或文字貼上，每行一位學生，欄位以逗號或定位字元 (Tab) 分隔：</p>
              <div className="bg-slate-50 p-2 rounded border border-slate-200 font-mono text-[11px] text-slate-600">
                座號, 姓名, 性別, 學號<br/>
                1, 陳冠宇, 男, 80201<br/>
                2, 林語晴, 女, 80202<br/>
                3, 張家豪, 男, 80203
              </div>
            </div>

            <textarea
              rows={8}
              value={batchText}
              onChange={(e) => setBatchText(e.target.value)}
              placeholder="在此貼上多行名冊資料（格式：座號, 姓名, 性別, 學號）..."
              className="w-full px-3 py-2 text-xs font-mono border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />

            <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowBatchModal(false)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors font-medium text-xs"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleProcessBatch}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors font-medium text-xs shadow-xs"
              >
                解析並匯入名單
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
