import React, { useState } from 'react';
import { Classroom } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onAddClass: (newClass: Classroom) => void;
}

export const ClassModal: React.FC<Props> = ({ isOpen, onClose, onAddClass }) => {
  const [name, setName] = useState('');
  const [grade, setGrade] = useState('國中一年級');
  const [teacherName, setTeacherName] = useState('');
  const [schoolName, setSchoolName] = useState('市立大安國民中學');
  const [contactPhone, setContactPhone] = useState('02-2707-5215');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !teacherName.trim()) return;

    const newClass: Classroom = {
      id: `class-${Date.now()}`,
      name: name.trim(),
      grade,
      academicYear: '114學年度',
      semester: '第一學期',
      teacherName: teacherName.trim(),
      schoolName: schoolName.trim(),
      contactPhone: contactPhone.trim(),
      layoutRows: 5,
      layoutCols: 6,
    };

    onAddClass(newClass);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-2xs p-4 no-print">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="font-bold text-slate-900 text-base">新增管理班級</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-sm">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">班級名稱 (例如：七年忠班、102班)</label>
            <input
              type="text"
              required
              placeholder="例如：七年愛班"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">年級組別</label>
            <input
              type="text"
              placeholder="例如：國中一年級 或 高中二年級"
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">班導師姓名</label>
            <input
              type="text"
              required
              placeholder="例如：李宛倫 老師"
              value={teacherName}
              onChange={(e) => setTeacherName(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">學校全銜</label>
            <input
              type="text"
              placeholder="例如：市立信義國民中學"
              value={schoolName}
              onChange={(e) => setSchoolName(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">導師室分機聯絡電話</label>
            <input
              type="text"
              placeholder="例如：02-2345-6789 #301"
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
            >
              取消
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium shadow-xs"
            >
              建立班級
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
