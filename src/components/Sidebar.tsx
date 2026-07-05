import React from 'react';
import { 
  MessageSquare, 
  Database, 
  Cpu, 
  Settings, 
  Plus, 
  Trash2, 
  TrendingUp, 
  ChevronRight, 
  CheckCircle2, 
  ExternalLink,
  Bot
} from 'lucide-react';
import { TabType, AIModelConfig } from '../types';

interface SidebarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  chatIds: string[];
  currentChatId: string;
  onSelectChat: (id: string) => void;
  onNewChat: () => void;
  onDeleteChat: (id: string, e: React.MouseEvent) => void;
  activeKnowledgeCount: number;
  activeModel: AIModelConfig | undefined;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  chatIds,
  currentChatId,
  onSelectChat,
  onNewChat,
  onDeleteChat,
  activeKnowledgeCount,
  activeModel,
}) => {
  return (
    <aside className="w-72 bg-[#0d1322] border-l border-[#1e293b] flex flex-col h-full text-slate-200 select-none flex-shrink-0 transition-all duration-300">
      {/* Brand Header */}
      <div className="p-4 border-b border-[#1e293b]/80 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20 ring-1 ring-blue-400/30">
            <TrendingUp className="w-5 h-5 text-white animate-pulse" />
          </div>
          <div>
            <h1 className="font-bold text-base tracking-tight bg-gradient-to-r from-white via-blue-100 to-blue-300 bg-clip-text text-transparent">
              TradeMind AI
            </h1>
            <p className="text-[10px] text-blue-400/80 font-mono">PRO TRADING ANALYST</p>
          </div>
        </div>
        <div className="flex items-center gap-1 bg-blue-500/10 border border-blue-500/20 px-2 py-1 rounded-md text-[10px] text-blue-300 font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-ping mr-1" />
          LIVE
        </div>
      </div>

      {/* New Chat Button (ChatGPT Style) */}
      <div className="p-3">
        <button
          onClick={() => {
            onNewChat();
            setActiveTab('chat');
          }}
          className="w-full flex items-center justify-center gap-2.5 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-xl transition-all shadow-md shadow-blue-600/20 border border-blue-400/30 text-sm group"
        >
          <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
          <span>گفتگوی معاملاتی جدید</span>
        </button>
      </div>

      {/* Main Navigation Tabs */}
      <div className="px-3 py-2 space-y-1 border-b border-[#1e293b]/80">
        <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-2 mb-1">
          بخش‌های سیستم
        </div>
        
        <button
          onClick={() => setActiveTab('chat')}
          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
            activeTab === 'chat'
              ? 'bg-blue-600/15 text-blue-300 border border-blue-500/30 shadow-sm'
              : 'text-slate-300 hover:bg-[#161f37] hover:text-white'
          }`}
        >
          <div className="flex items-center gap-3">
            <MessageSquare className={`w-4 h-4 ${activeTab === 'chat' ? 'text-blue-400' : 'text-slate-400'}`} />
            <span>اتاق تحلیل و ترید</span>
          </div>
          {activeTab === 'chat' && <ChevronRight className="w-4 h-4 text-blue-400" />}
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
            activeTab === 'settings' || activeTab === 'models' || activeTab === 'knowledge'
              ? 'bg-blue-600/15 text-blue-300 border border-blue-500/30 shadow-sm'
              : 'text-slate-300 hover:bg-[#161f37] hover:text-white'
          }`}
        >
          <div className="flex items-center gap-3">
            <Settings className={`w-4 h-4 ${activeTab === 'settings' || activeTab === 'models' || activeTab === 'knowledge' ? 'text-blue-400' : 'text-slate-400'}`} />
            <span>تنظیمات، هوش مصنوعی و داده‌ها</span>
          </div>
        </button>
      </div>

      {/* Previous Chat History List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1 custom-scrollbar">
        <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-2 mb-2">
          تاریخچه تحلیل‌های اخیر
        </div>
        
        {chatIds.length === 0 ? (
          <div className="text-center py-8 px-4 text-slate-500 text-xs bg-[#12192c]/50 rounded-xl border border-dashed border-[#1e293b]">
            <p>هنوز گفتگویی ایجاد نشده است.</p>
            <p className="mt-1 text-[11px] text-blue-400/70">چارت یا سوال خود را برای تحلیل ارسال کنید.</p>
          </div>
        ) : (
          chatIds.map((id, idx) => {
            const isSelected = id === currentChatId && activeTab === 'chat';
            return (
              <div
                key={id}
                onClick={() => {
                  onSelectChat(id);
                  setActiveTab('chat');
                }}
                className={`group flex items-center justify-between px-3 py-2 rounded-xl text-xs cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-[#1a2542] text-white border border-blue-500/30 font-medium'
                    : 'text-slate-400 hover:bg-[#161f37] hover:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <MessageSquare className="w-3.5 h-3.5 flex-shrink-0 opacity-70" />
                  <span className="truncate">تحلیل معاملاتی شماره #{chatIds.length - idx}</span>
                </div>
                {chatIds.length > 1 && (
                  <button
                    onClick={(e) => onDeleteChat(id, e)}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/20 hover:text-red-400 rounded-lg transition-all"
                    title="حذف گفتگو"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Active Model Status Footer */}
      <div className="p-3 bg-[#0a0f1d] border-t border-[#1e293b]">
        <div 
          onClick={() => setActiveTab('models')}
          className="flex items-center justify-between p-2.5 rounded-xl bg-[#12192e] border border-blue-500/20 hover:border-blue-500/40 cursor-pointer transition-all group"
        >
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-7 h-7 rounded-lg bg-blue-600/20 flex items-center justify-center border border-blue-500/30 flex-shrink-0">
              <Bot className="w-4 h-4 text-blue-400" />
            </div>
            <div className="truncate">
              <div className="text-[10px] text-slate-400 flex items-center gap-1">
                <span>موتور فعال:</span>
                <span className="text-blue-300 font-mono font-semibold">API CONNECTED</span>
              </div>
              <div className="text-xs font-medium text-white truncate">
                {activeModel ? activeModel.name.split('(')[0] : 'انتخاب مدل'}
              </div>
            </div>
          </div>
          <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse flex-shrink-0" />
        </div>
      </div>
    </aside>
  );
};
