import React, { useRef } from 'react';
import { Download, Upload, RotateCcw, Database } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onExportBackup: () => void;
  onImportBackup: (data: any) => void;
  onResetToDemo: () => void;
}

export const BackupModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onExportBackup,
  onImportBackup,
  onResetToDemo,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        onImportBackup(json);
        onClose();
        alert('備份檔案還原成功！');
      } catch (err) {
        alert('無效的備份 JSON 格式，請確認檔案內容。');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-2xs p-4 no-print">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-md w-full p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">系統資料備份與還原</h3>
              <p className="text-xs text-slate-500">保護並匯出您的班級名冊、點名及作業資料</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-sm">
            ✕
          </button>
        </div>

        <div className="space-y-3 text-xs">
          {/* Backup Download */}
          <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 flex items-center justify-between">
            <div>
              <div className="font-semibold text-slate-900">下載完整資料備份 (JSON)</div>
              <div className="text-[11px] text-slate-400">包含所有班級、名冊、點名紀錄、作業及信件日誌</div>
            </div>
            <button
              onClick={onExportBackup}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow-2xs transition-colors shrink-0"
            >
              <Download className="w-3.5 h-3.5" />
              <span>匯出備份</span>
            </button>
          </div>

          {/* Backup Restore */}
          <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 flex items-center justify-between">
            <div>
              <div className="font-semibold text-slate-900">還原備份檔案</div>
              <div className="text-[11px] text-slate-400">上傳先前匯出的 ClassDesk JSON 檔案進行資料復原</div>
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-medium rounded-lg transition-colors shrink-0"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>選取檔案</span>
            </button>
            <input
              type="file"
              ref={fileInputRef}
              accept=".json"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          {/* Reset Demo Data */}
          <div className="p-3.5 rounded-xl border border-rose-200 bg-rose-50/40 flex items-center justify-between">
            <div>
              <div className="font-semibold text-rose-900">重設為初始示範資料</div>
              <div className="text-[11px] text-rose-600/80">重新載入八年仁班完整模擬名單、作業與出缺勤</div>
            </div>
            <button
              onClick={() => {
                if (confirm('確定要重設為初始預設示範資料嗎？當前未備份的變更將被覆蓋。')) {
                  onResetToDemo();
                  onClose();
                }
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-rose-100 text-rose-700 border border-rose-200 font-medium rounded-lg transition-colors shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>重設示範</span>
            </button>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
          >
            關閉
          </button>
        </div>
      </div>
    </div>
  );
};
