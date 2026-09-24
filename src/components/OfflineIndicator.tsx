import React from 'react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { WifiOff } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-20 md:bottom-4 left-4 right-4 md:right-auto md:max-w-md z-50 flex items-center gap-2.5 rounded-2xl bg-amber-600 px-4 py-2.5 text-xs font-medium text-white shadow-xl animate-in slide-in-from-bottom duration-200">
      <span className="flex h-2.5 w-2.5 rounded-full bg-amber-200 animate-ping" />
      <WifiOff className="w-4 h-4 shrink-0" />
      <div className="flex-1">
        <span className="font-bold">離線模式運作中</span>：所有點名與紀錄皆保存在手機本機，連線後自動生效。
      </div>
    </div>
  );
};
