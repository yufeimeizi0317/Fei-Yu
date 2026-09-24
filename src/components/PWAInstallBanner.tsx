import React, { useState, useEffect } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Share, PlusSquare, X, Smartphone, CheckCircle } from 'lucide-react';

interface Props {
  forceOpenGuide?: boolean;
  onCloseGuide?: () => void;
}

export const PWAInstallBanner: React.FC<Props> = ({ forceOpenGuide = false, onCloseGuide }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSModal, setShowIOSModal] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    const dismissed = sessionStorage.getItem('pwa_banner_dismissed') === 'true';
    if (dismissed) setIsDismissed(true);
  }, []);

  useEffect(() => {
    if (forceOpenGuide) {
      if (isInstallable) {
        install();
        onCloseGuide?.();
      } else {
        setShowIOSModal(true);
      }
    }
  }, [forceOpenGuide, isInstallable, install, onCloseGuide]);

  if (isInstalled) return null;

  const handleDismiss = () => {
    setIsDismissed(true);
    sessionStorage.setItem('pwa_banner_dismissed', 'true');
  };

  const handleTriggerInstall = () => {
    if (isInstallable) {
      install();
    } else {
      setShowIOSModal(true);
    }
  };

  return (
    <>
      {/* Mobile Floating Bottom-Above-Nav Banner (Dismissible) */}
      {!isDismissed && (
        <div className="fixed bottom-18 left-3 right-3 md:hidden z-40 animate-in slide-in-from-bottom duration-300">
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-3.5 rounded-2xl shadow-xl border border-indigo-500/30 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <img
                src="/apple-touch-icon.png"
                alt="ClassDesk App"
                className="w-10 h-10 rounded-xl shadow-md border border-white/20 shrink-0"
              />
              <div className="min-w-0">
                <div className="font-bold text-xs flex items-center gap-1.5 text-white">
                  <span>安裝手機版 App</span>
                  <span className="text-[9px] bg-indigo-500/40 text-indigo-200 px-1.5 py-0.2 rounded font-semibold">
                    支援離線
                  </span>
                </div>
                <div className="text-[10px] text-slate-300 truncate">
                  免開瀏覽器，全螢幕一鍵點名與查課表
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={handleTriggerInstall}
                className="px-3 py-1.5 bg-indigo-500 hover:bg-indigo-600 active:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-1 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>安裝</span>
              </button>
              <button
                onClick={handleDismiss}
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 flex items-center justify-center transition-colors"
                title="稍後提醒"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* iOS / General Safari Install Guide Modal */}
      {showIOSModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/70 backdrop-blur-2xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-200 text-slate-900 space-y-4 animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">將 ClassDesk 加入手機主畫面</h3>
                  <p className="text-[11px] text-slate-400">iOS / Android 快速安裝引導</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowIOSModal(false);
                  onCloseGuide?.();
                }}
                className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-600">
              <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold shrink-0">
                  1
                </div>
                <div>
                  <div className="font-bold text-slate-800 flex items-center gap-1">
                    <span>點選瀏覽器底部的「分享」按鈕</span>
                    <Share className="w-3.5 h-3.5 text-indigo-600" />
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    在 Safari 或 Chrome 底部／右上角工具列點選分享或選單圖示。
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold shrink-0">
                  2
                </div>
                <div>
                  <div className="font-bold text-slate-800 flex items-center gap-1">
                    <span>選擇「加入主畫面」</span>
                    <PlusSquare className="w-3.5 h-3.5 text-indigo-600" />
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    向下滑動找到「加入主畫面（Add to Home Screen）」。
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-indigo-50/70 rounded-xl border border-indigo-100">
                <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold shrink-0">
                  3
                </div>
                <div>
                  <div className="font-bold text-slate-800 flex items-center gap-1">
                    <span>全螢幕獨立 App 立即啟用！</span>
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    主畫面上會出現 ClassDesk 圖示，支援離線點名與全螢幕操作。
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                setShowIOSModal(false);
                onCloseGuide?.();
              }}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors"
            >
              我知道了，開始體驗
            </button>
          </div>
        </div>
      )}
    </>
  );
};
