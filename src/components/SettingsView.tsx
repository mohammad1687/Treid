import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  ShieldCheck, 
  TrendingUp, 
  Sliders, 
  Clock, 
  Globe, 
  Palette, 
  FileText, 
  RefreshCw,
  Cpu,
  Database,
  Bot,
  Sparkles,
  Bell,
  User,
  Layout,
  Volume2,
  Lock,
  Trash2,
  Download,
  Upload,
  Wand2,
  Brain,
  Zap,
  Check,
  ChevronRight,
  Eye,
  Sun,
  Moon,
  Monitor,
  BarChart3,
  Layers
} from 'lucide-react';
import { UserSettings, AIModelConfig, KnowledgeItem } from '../types';
import { ModelsView } from './ModelsView';
import { KnowledgeBaseView } from './KnowledgeBaseView';

interface SettingsViewProps {
  settings: UserSettings;
  onUpdateSettings: (newSettings: UserSettings) => void;
  onReset: () => void;
  models?: AIModelConfig[];
  onUpdateModel?: (id: string, updated: Partial<AIModelConfig>) => void;
  onSetDefaultModel?: (id: string) => void;
  onAddModel?: (newModel: Omit<AIModelConfig, 'id'>) => void;
  onDeleteModel?: (id: string) => void;
  knowledge?: KnowledgeItem[];
  onAddKnowledge?: (item: Omit<KnowledgeItem, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdateKnowledge?: (id: string, updated: Partial<KnowledgeItem>) => void;
  onDeleteKnowledge?: (id: string) => void;
  onToggleKnowledgeActive?: (id: string) => void;
  initialSection?: string;
}

type SectionType = 'general' | 'personalization' | 'models' | 'trading' | 'data' | 'storage';

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onUpdateSettings,
  onReset,
  models,
  onUpdateModel,
  onSetDefaultModel,
  onAddModel,
  onDeleteModel,
  knowledge,
  onAddKnowledge,
  onUpdateKnowledge,
  onDeleteKnowledge,
  onToggleKnowledgeActive,
  initialSection = 'general'
}) => {
  const [activeSection, setActiveSection] = useState<SectionType>(() => {
    if (initialSection === 'models' || initialSection === 'data' || initialSection === 'general') {
      return initialSection as SectionType;
    }
    return 'personalization'; // Default to personalization to showcase the focus!
  });

  useEffect(() => {
    if (initialSection === 'models') setActiveSection('models');
    else if (initialSection === 'data') setActiveSection('data');
    else if (initialSection === 'general') setActiveSection('general');
  }, [initialSection]);

  const handleChange = (key: keyof UserSettings, value: any) => {
    onUpdateSettings({ ...settings, [key]: value });
  };

  // Helper Toggle Component matching ChatGPT screenshot
  const ToggleSwitch = ({ checked, onChange, label, description }: { checked: boolean; onChange: () => void; label: string; description?: string }) => (
    <div onClick={onChange} className="flex items-center justify-between py-4 border-b border-[#1e293b]/60 cursor-pointer group select-none">
      <div className="pr-4">
        <div className="text-sm font-semibold text-white group-hover:text-blue-300 transition-colors">{label}</div>
        {description && <div className="text-xs text-slate-400 mt-0.5 leading-relaxed">{description}</div>}
      </div>
      <div className={`w-11 h-6 rounded-full p-1 transition-colors duration-200 ease-in-out flex-shrink-0 ${checked ? 'bg-blue-600' : 'bg-slate-700'}`}>
        <div className={`w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ease-in-out ${checked ? '-translate-x-5' : 'translate-x-0'}`} />
      </div>
    </div>
  );

  // Helper Select Row matching ChatGPT screenshot
  const SelectRow = ({ label, description, value, onChange, options }: { label: string; description?: string; value: string; onChange: (val: any) => void; options: { value: string; label: string }[] }) => (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between py-4 border-b border-[#1e293b]/60 gap-3 select-none">
      <div className="pr-4">
        <div className="text-sm font-semibold text-white">{label}</div>
        {description && <div className="text-xs text-slate-400 mt-0.5 leading-relaxed">{description}</div>}
      </div>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-[#151f38] hover:bg-[#1c294a] border border-[#27354d] rounded-xl px-4 py-2.5 text-xs text-white font-medium focus:outline-none focus:border-blue-500 transition-all cursor-pointer min-w-[160px]"
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );

  return (
    <div className="flex-1 overflow-y-auto bg-[#0a0f1d] text-slate-200 p-3 sm:p-6 md:p-8 custom-scrollbar">
      <div className="max-w-6xl mx-auto">
        
        {/* Top Floating ChatGPT Style Modal Container */}
        <div className="bg-[#0f1626] border border-[#1e293b] rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[750px]">
          
          {/* LEFT SIDEBAR NAVIGATION (ChatGPT Settings Layout) */}
          <div className="w-full md:w-64 bg-[#0a0f1d]/80 border-b md:border-b-0 md:border-l border-[#1e293b] p-4 flex flex-col gap-1.5 shrink-0">
            <div className="pb-3 mb-2 border-b border-[#1e293b]/60 px-2">
              <div className="flex items-center gap-2 text-blue-400 font-mono text-xs uppercase tracking-wider font-bold">
                <Sparkles className="w-4 h-4 animate-pulse" />
                <span>SETTINGS & WORKSPACE</span>
              </div>
              <h2 className="text-lg font-bold text-white mt-0.5">تنظیمات شناور</h2>
            </div>

            <button
              onClick={() => setActiveSection('personalization')}
              className={`flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-bold transition-all ${
                activeSection === 'personalization'
                  ? 'bg-blue-600/20 text-blue-300 border border-blue-500/40 shadow-md'
                  : 'text-slate-300 hover:bg-[#162036] hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <Brain className={`w-4 h-4 ${activeSection === 'personalization' ? 'text-blue-400' : 'text-slate-400'}`} />
                <span>شخصی‌سازی هوش مصنوعی</span>
              </div>
              <span className="bg-blue-500 text-white text-[9px] px-1.5 py-0.5 rounded-full font-mono font-bold">FOCUS</span>
            </button>

            <button
              onClick={() => setActiveSection('models')}
              className={`flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-bold transition-all ${
                activeSection === 'models'
                  ? 'bg-blue-600/20 text-blue-300 border border-blue-500/40 shadow-md'
                  : 'text-slate-300 hover:bg-[#162036] hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <Cpu className={`w-4 h-4 ${activeSection === 'models' ? 'text-blue-400' : 'text-slate-400'}`} />
                <span>مدل‌ها و کلیدهای API</span>
              </div>
              {models && (
                <span className="bg-slate-800 text-slate-300 text-[10px] px-2 py-0.5 rounded-full font-mono">
                  {models.filter(m => m.isActive).length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveSection('general')}
              className={`flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-bold transition-all ${
                activeSection === 'general'
                  ? 'bg-blue-600/20 text-blue-300 border border-blue-500/40 shadow-md'
                  : 'text-slate-300 hover:bg-[#162036] hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <Settings className={`w-4 h-4 ${activeSection === 'general' ? 'text-blue-400' : 'text-slate-400'}`} />
                <span>عمومی و ظاهری (General)</span>
              </div>
            </button>

            <button
              onClick={() => setActiveSection('trading')}
              className={`flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-bold transition-all ${
                activeSection === 'trading'
                  ? 'bg-blue-600/20 text-blue-300 border border-blue-500/40 shadow-md'
                  : 'text-slate-300 hover:bg-[#162036] hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <TrendingUp className={`w-4 h-4 ${activeSection === 'trading' ? 'text-blue-400' : 'text-slate-400'}`} />
                <span>استراتژی و مدیریت ریسک</span>
              </div>
            </button>

            <button
              onClick={() => setActiveSection('data')}
              className={`flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-bold transition-all ${
                activeSection === 'data'
                  ? 'bg-blue-600/20 text-blue-300 border border-blue-500/40 shadow-md'
                  : 'text-slate-300 hover:bg-[#162036] hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <Database className={`w-4 h-4 ${activeSection === 'data' ? 'text-blue-400' : 'text-slate-400'}`} />
                <span>داده‌ها و پایگاه دانش</span>
              </div>
              {knowledge && (
                <span className="bg-slate-800 text-slate-300 text-[10px] px-2 py-0.5 rounded-full font-mono">
                  {knowledge.filter(k => k.isActive).length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveSection('storage')}
              className={`flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-bold transition-all ${
                activeSection === 'storage'
                  ? 'bg-blue-600/20 text-blue-300 border border-blue-500/40 shadow-md'
                  : 'text-slate-300 hover:bg-[#162036] hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <ShieldCheck className={`w-4 h-4 ${activeSection === 'storage' ? 'text-blue-400' : 'text-slate-400'}`} />
                <span>ذخیره‌سازی و امنیت</span>
              </div>
            </button>
            
            <div className="mt-auto pt-4 border-t border-[#1e293b]/60 px-2 text-[11px] text-slate-500 leading-relaxed font-mono">
              ⚡ TradeMind OS v3.5
              <br />
              Сلیدهای API به‌صورت محلی (End-to-End Encrypted) ذخیره می‌شوند.
            </div>
          </div>

          {/* RIGHT MAIN CONTENT AREA */}
          <div className="flex-1 p-6 md:p-10 overflow-y-auto bg-[#0f1626]">
            
            {/* SECTION 1: AI PERSONALIZATION (ULTRA MODERN & HEAVY FOCUS) */}
            {activeSection === 'personalization' && (
              <div className="space-y-6 animate-fade-in">
                <div className="pb-4 border-b border-[#1e293b]">
                  <div className="flex items-center gap-2 text-blue-400 text-xs font-mono font-bold uppercase tracking-wider">
                    <Wand2 className="w-4 h-4 animate-spin-slow" />
                    <span>AI PERSONALIZATION & COGNITIVE CONTROLS</span>
                  </div>
                  <h3 className="text-xl md:text-2xl font-bold text-white mt-1">شخصی‌سازی هوش مصنوعی و رفتار تحلیلی</h3>
                  <p className="text-xs text-slate-400 mt-1">
                    بنا به دستور شما، این بخش به صورت فوق مدرن برای کنترل دقیق مغز تحلیلی هوش مصنوعی، لحن، عمق استدلال و پارامترهای معاملاتی طراحی شده است.
                  </p>
                </div>

                {/* ChatGPT Style Toggles */}
                <div className="bg-[#111827] border border-[#1e293b] rounded-2xl px-6 py-2 shadow-lg">
                  <ToggleSwitch
                    label="هوای هوشمندتر خودکار (Higher intelligence auto-switch)"
                    description="هنگام طرح سوالات پیچیده تحلیلی و پرایس اکشن، هوش مصنوعی به‌صورت خودکار به حالت استدلال عمیق (Reasoning Pro) تغییر وضعیت دهد."
                    checked={settings.higherIntelligenceAuto ?? true}
                    onChange={() => handleChange('higherIntelligenceAuto', !settings.higherIntelligenceAuto)}
                  />
                  <ToggleSwitch
                    label="پیشنهادات هوشمند بعدی (Auto-Suggestions)"
                    description="پس از ارائه هر تحلیل، ۳ سوال یا اقدام پیشنهادی معاملاتی جهت ادامه بررسی بازار نمایش داده شود."
                    checked={settings.enableAutoSuggestions ?? true}
                    onChange={() => handleChange('enableAutoSuggestions', !settings.enableAutoSuggestions)}
                  />
                  <ToggleSwitch
                    label="هشدارهای مدیریت ریسک خودکار (Risk Warnings)"
                    description="در صورت مشاهده اهرم‌های نامتعارف یا نزدیکی قیمت به نواحی خطرناک لیکوئیدیتی، هشدار قرمز صادر شود."
                    checked={settings.enableRiskWarnings ?? true}
                    onChange={() => handleChange('enableRiskWarnings', !settings.enableRiskWarnings)}
                  />
                </div>

                {/* Detailed Select Controls */}
                <div className="bg-[#111827] border border-[#1e293b] rounded-2xl px-6 py-2 shadow-lg">
                  <SelectRow
                    label="لحن و شخصیت هوش مصنوعی (AI Voice & Tone)"
                    description="مشخص کنید هوش مصنوعی با چه لحن و دیدگاهی با شما تعامل کند."
                    value={settings.aiVoiceTone || 'institutional'}
                    onChange={(val) => handleChange('aiVoiceTone', val)}
                    options={[
                      { value: 'institutional', label: '🏦 مؤسسات مالی و وال استریت (Institutional Wall Street)' },
                      { value: 'professional', label: '👔 حرفه‌ای و رسمی (Professional Trading Desk)' },
                      { value: 'aggressive', label: '⚡ اسکالپر تهاجمی و صریح (Aggressive Scalper)' },
                      { value: 'socratic', label: '🎓 مربی سقراطی و آموزشی (Socratic Mentor)' },
                      { value: 'friendly', label: '🤝 دستیار صمیمی و روان (Friendly Assistant)' }
                    ]}
                  />

                  <SelectRow
                    label="عمق استدلال و تفکر منطقی (Reasoning Depth)"
                    description="میزان پردازش و تحلیل لایه‌های پنهان بازار قبل از صدور پاسخ نهائی."
                    value={settings.aiReasoningDepth || 'detailed'}
                    onChange={(val) => handleChange('aiReasoningDepth', val)}
                    options={[
                      { value: 'fast', label: '⚡ پاسخ سریع و مستقیم (Fast Execution - بدون اتلاف وقت)' },
                      { value: 'detailed', label: '🔍 تحلیل تفصیلی استاندارد (Detailed Market Breakdown)' },
                      { value: 'deep-quant', label: '🧠 تحلیل کوآنت و ریاضی عمیق (Deep Quant & Math Model)' },
                      { value: 'step-by-step', label: '📐 اثبات گام‌به‌گام پرایس اکشن (Step-by-Step Proof)' }
                    ]}
                  />

                  <SelectRow
                    label="حساسیت تشخیص الگو در چارت‌ها (Chart Sensitivity)"
                    description="دقت بینایی کامپیوتری در اسکن کندل استیک‌ها و سطوح حمایت/مقاومت."
                    value={settings.chartAnalysisSensitivity || 'high'}
                    onChange={(val) => handleChange('chartAnalysisSensitivity', val)}
                    options={[
                      { value: 'high', label: '🎯 حساسیت بالا (شناسایی تمام سطوح ماژور و مینور)' },
                      { value: 'medium', label: '⚖️ حساسیت متوسط (تمرکز بر سطوح کلیدی روزانه)' },
                      { value: 'low', label: '🏔️ حساسیت پایین (فقط نواحی عرضه و تقاضای کلان هفتگی)' }
                    ]}
                  />

                  <SelectRow
                    label="فرمت ساختاری پاسخ‌ها (Response Format)"
                    description="نحوه قالب‌بندی متون، جداول و سیگنال‌های ارائه شده."
                    value={settings.responseFormat || 'executive-summary'}
                    onChange={(val) => handleChange('responseFormat', val)}
                    options={[
                      { value: 'executive-summary', label: '📋 خلاصه مدیریتی با جدول سیگنال (Executive Summary)' },
                      { value: 'bullet-points', label: '🔹 نکات کلیدی بولت‌شده (Bullet Points)' },
                      { value: 'markdown', label: '📑 مارک‌داون تمیز و ساختاریافته (Clean Markdown)' },
                      { value: 'full-report', label: '📚 گزارش جامع همراه با سناریوهای جایگزین (Full Report)' }
                    ]}
                  />

                  <SelectRow
                    label="تمرکز زمانی بر سشن‌های معاملاتی (Trading Session Focus)"
                    description="اولویت‌دهی تحلیل‌ها بر اساس نوسانات سشن فعال بازار."
                    value={settings.tradingSessionFocus || 'all'}
                    onChange={(val) => handleChange('tradingSessionFocus', val)}
                    options={[
                      { value: 'all', label: '🌍 تمامی سشن‌ها ۲۴ ساعته (All Global Sessions)' },
                      { value: 'london', label: '🇬🇧 سشن لندن (London Volatility & Breakouts)' },
                      { value: 'new-york', label: '🇺🇸 سشن نیویورک (New York Volume & News)' },
                      { value: 'tokyo', label: '🇯🇵 سشن توکیو و آسیا (Tokyo Asian Range)' }
                    ]}
                  />
                </div>

                {/* Master System Prompt Box */}
                <div className="bg-[#111827] border border-[#1e293b] rounded-2xl p-6 shadow-lg space-y-3">
                  <div className="flex items-center justify-between pb-3 border-b border-[#1e293b]/60">
                    <label className="text-sm font-bold text-white flex items-center gap-2">
                      <FileText className="w-4 h-4 text-blue-400" />
                      <span>دستورالعمل مادر هوش مصنوعی (Master System Instructions & Persona)</span>
                    </label>
                    <span className="text-[10px] bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded font-mono">GLOBAL OVERRIDE</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    این متن به عنوان هسته تفکر تمامی مدل‌های متصل اعمال می‌شود. هر قاعده‌ای که اینجا بنویسید برای هوش مصنوعی به منزله قانون اول خواهد بود.
                  </p>
                  <textarea
                    rows={6}
                    value={settings.systemPrompt}
                    onChange={(e) => handleChange('systemPrompt', e.target.value)}
                    placeholder="شما یک معامله‌گر ارشد صندوق تأمین سرمایه (Hedge Fund) هستید. در هر تحلیل ابتدا جهت روند کلان را مشخص کرده و حد ضرر را دقیق تعیین کنید..."
                    className="w-full bg-[#0a0f1d] border border-[#1e293b] rounded-xl p-4 text-xs text-white focus:outline-none focus:border-blue-500 transition-all font-mono leading-relaxed placeholder:text-slate-600 custom-scrollbar"
                  />
                </div>
              </div>
            )}

            {/* SECTION 2: GENERAL (MATCHING CHATGPT SCREENSHOT EXACTLY) */}
            {activeSection === 'general' && (
              <div className="space-y-6 animate-fade-in">
                <div className="pb-4 border-b border-[#1e293b]">
                  <h3 className="text-xl md:text-2xl font-bold text-white">تنظیمات عمومی و ظاهری (General)</h3>
                  <p className="text-xs text-slate-400 mt-1">
                    مدیریت ظاهر برنامه، تم رنگی، کنتراست و زبان تعامل بر اساس تصویر ارسالی شما.
                  </p>
                </div>

                <div className="bg-[#111827] border border-[#1e293b] rounded-2xl px-6 py-2 shadow-lg">
                  <SelectRow
                    label="ظاهر و تم رنگی (Appearance)"
                    description="پوسته بصری محیط برنامه و چت‌باکس."
                    value={settings.theme || 'dark-blue'}
                    onChange={(val) => handleChange('theme', val)}
                    options={[
                      { value: 'dark-blue', label: '🌙 سرمه‌ای شب (Midnight Blue - تم اصلی مدرن)' },
                      { value: 'slate-blue', label: '🎨 آبی خاکستری (Modern Slate Blue)' },
                      { value: 'cosmic-dark', label: '🌌 آبی کیهانی (Cosmic Deep Blue)' },
                      { value: 'midnight-black', label: '🌑 مشکی مطلق (OLED Midnight Black)' }
                    ]}
                  />

                  <SelectRow
                    label="کنتراست و شفافیت (Contrast)"
                    description="تنظیم وضوح مرزها و سایه‌ها در مانیتورهای مختلف."
                    value={settings.contrast || 'normal'}
                    onChange={(val) => handleChange('contrast', val)}
                    options={[
                      { value: 'normal', label: '⚙️ استاندارد سیستم (System Standard)' },
                      { value: 'high', label: '🔆 کنتراست بالا (High Contrast - تفکیک بیشتر)' },
                      { value: 'ultra', label: '💎 وضوح حداکثری (Ultra Crisp)' }
                    ]}
                  />

                  <SelectRow
                    label="رنگ تمایز و اکسنت (Accent color)"
                    description="رنگ دکمه‌ها و المان‌های فعال در رابط کاربری."
                    value={settings.accentColor || 'blue'}
                    onChange={(val) => handleChange('accentColor', val)}
                    options={[
                      { value: 'blue', label: '🔵 آبی رویال (Default Blue - پیش‌فرض)' },
                      { value: 'indigo', label: '🟣 نیلی مدرن (Modern Indigo)' },
                      { value: 'cyan', label: '🩵 سایان کریستالی (Crystal Cyan)' },
                      { value: 'purple', label: '💜 بنفش کوآنتومی (Quantum Purple)' }
                    ]}
                  />

                  <SelectRow
                    label="زبان تعامل (Language)"
                    description="زبان پیش‌فرض برای نمایش منوها و خروجی‌ها."
                    value={settings.language || 'fa'}
                    onChange={(val) => handleChange('language', val)}
                    options={[
                      { value: 'fa', label: '🇮🇷 فارسی (روان همراه با اصطلاحات تخصصی انگلیسی)' },
                      { value: 'en', label: '🇬🇧 English (Wall Street Professional Tone)' }
                    ]}
                  />

                  <ToggleSwitch
                    label="فعال‌سازی دیکته صوتی (Enable Dictation)"
                    description="قابلیت تبدیل صوت به متن در کادر ارسال پیام اتاق ترید."
                    checked={settings.enableDictation ?? true}
                    onChange={() => handleChange('enableDictation', !settings.enableDictation)}
                  />

                  <ToggleSwitch
                    label="افکت‌های صوتی و بازخورد (Sound effects)"
                    description="پخش صدای کوتاه هنگام ارسال پیام و دریافت سیگنال‌های جدید."
                    checked={settings.soundEffects ?? true}
                    onChange={() => handleChange('soundEffects', !settings.soundEffects)}
                  />
                </div>
              </div>
            )}

            {/* SECTION 3: AI MODELS & API KEYS */}
            {activeSection === 'models' && (
              <div className="animate-fade-in">
                {models && onUpdateModel && onSetDefaultModel ? (
                  <ModelsView
                    models={models}
                    onUpdateModel={onUpdateModel}
                    onSetDefault={onSetDefaultModel}
                    onAddModel={onAddModel}
                    onDeleteModel={onDeleteModel}
                  />
                ) : (
                  <div className="text-center py-12 text-slate-400 text-sm">در حال بارگذاری موتورهای هوش مصنوعی...</div>
                )}
              </div>
            )}

            {/* SECTION 4: TRADING & RISK ENGINE */}
            {activeSection === 'trading' && (
              <div className="space-y-6 animate-fade-in">
                <div className="pb-4 border-b border-[#1e293b]">
                  <h3 className="text-xl md:text-2xl font-bold text-white">استراتژی معاملاتی و مدیریت ریسک (Trading Engine)</h3>
                  <p className="text-xs text-slate-400 mt-1">
                    تنظیمات تخصصی تایم‌فریم، حداکثر ریسک مجاز در هر معامله و سبک تحلیل چارت.
                  </p>
                </div>

                <div className="bg-[#111827] border border-[#1e293b] rounded-2xl px-6 py-2 shadow-lg">
                  <SelectRow
                    label="سبک معاملاتی اصلی (Trading Style)"
                    description="هوش مصنوعی اهداف سود و حد ضرر را متناسب با این سبک تعیین می‌کند."
                    value={settings.tradingStyle || 'Swing Trading'}
                    onChange={(val) => handleChange('tradingStyle', val)}
                    options={[
                      { value: 'Scalping', label: '⚡ اسکالپینگ (Scalping - سریع در تایم‌فریم پایین)' },
                      { value: 'Day Trading', label: '☀️ معاملات روزانه (Day Trading - باز و بسته در یک روز)' },
                      { value: 'Swing Trading', label: '🌊 سویینگ تریدینگ (Swing Trading - شکار روندهای چند روزه)' },
                      { value: 'Position Trading', label: '💎 پوزیشن تریدینگ (Position Trading - بلندمدت)' },
                      { value: 'Algorithmic Quant', label: '📐 الگوریتمیک و کوآنت (Algorithmic Quant)' }
                    ]}
                  />

                  <SelectRow
                    label="حداکثر ریسک مجاز در هر معامله (Risk per Trade)"
                    description="محاسبه نسبت ریسک به ریوارد (R/R) بر اساس مدیریت سرمایه شما."
                    value={settings.riskPerTrade || '1%'}
                    onChange={(val) => handleChange('riskPerTrade', val)}
                    options={[
                      { value: '0.5%', label: '🛡️ 0.5% (بسیار محافظه‌کارانه و ایمن)' },
                      { value: '1%', label: '💼 1% (استاندارد معامله‌گران حرفه‌ای صندوق‌ها)' },
                      { value: '2%', label: '⚖️ 2% (ریسک متوسط و متعادل)' },
                      { value: '3%', label: '🔥 3% (ریسک بالا برای حساب‌های کوچک)' },
                      { value: '5% (Aggressive)', label: '🚀 5% (Aggressive - ریسک بسیار بالا)' }
                    ]}
                  />

                  <SelectRow
                    label="تایم‌فریم پیش‌فرض تحلیل چارت‌ها (Default Timeframe)"
                    description="تایم‌فریمی که هوش مصنوعی در اولین نگاه به چارت مورد بررسی قرار می‌دهد."
                    value={settings.defaultTimeframe || '1H / 4H'}
                    onChange={(val) => handleChange('defaultTimeframe', val)}
                    options={[
                      { value: '1m / 5m', label: '⏱️ 1m / 5m (تایم‌فریم‌های ۱ و ۵ دقیقه - اسکالپ)' },
                      { value: '15m / 30m', label: '⌛ 15m / 30m (تایم‌فریم‌های ۱۵ و ۳۰ دقیقه)' },
                      { value: '1H / 4H', label: '🕒 1H / 4H (تایم‌فریم‌های ۱ و ۴ ساعته - پیشنهاد اصلی)' },
                      { value: 'Daily / Weekly', label: '📅 Daily / Weekly (روزانه و هفتگی - ساختار کلان)' }
                    ]}
                  />

                  <ToggleSwitch
                    label="تحلیل اتوماتیک تصاویر چارت‌های آپلودی"
                    description="هوش مصنوعی به‌محض آپلود تصویر، خطوط حمایت/مقاومت و الگوها را شناسایی کند."
                    checked={settings.autoAnalyzeCharts ?? true}
                    onChange={() => handleChange('autoAnalyzeCharts', !settings.autoAnalyzeCharts)}
                  />
                </div>
              </div>
            )}

            {/* SECTION 5: KNOWLEDGE BASE & DATA */}
            {activeSection === 'data' && (
              <div className="animate-fade-in">
                {knowledge && onAddKnowledge && onUpdateKnowledge && onDeleteKnowledge && onToggleKnowledgeActive ? (
                  <KnowledgeBaseView
                    items={knowledge}
                    onAddItem={onAddKnowledge}
                    onUpdateItem={onUpdateKnowledge}
                    onDeleteItem={onDeleteKnowledge}
                    onToggleActive={onToggleKnowledgeActive}
                  />
                ) : (
                  <div className="text-center py-12 text-slate-400 text-sm">در حال بارگذاری پایگاه دانش و داده‌ها...</div>
                )}
              </div>
            )}

            {/* SECTION 6: STORAGE & SAFETY */}
            {activeSection === 'storage' && (
              <div className="space-y-6 animate-fade-in">
                <div className="pb-4 border-b border-[#1e293b]">
                  <h3 className="text-xl md:text-2xl font-bold text-white">ذخیره‌سازی محلی و امنیت (Storage & Security)</h3>
                  <p className="text-xs text-slate-400 mt-1">
                    مدیریت داده‌های ذخیره‌شده در مرورگر، پاک‌سازی حافظه پنهان و بازگشت به تنظیمات اولیه.
                  </p>
                </div>

                <div className="bg-[#111827] border border-[#1e293b] rounded-2xl p-6 shadow-lg space-y-6">
                  <div className="flex items-center justify-between pb-4 border-b border-[#1e293b]/60">
                    <div>
                      <div className="text-sm font-bold text-white">وضعیت رمزنگاری کلیدهای API</div>
                      <div className="text-xs text-emerald-400 mt-0.5 flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5" />
                        <span>تمام کلیدها فقط در LocalStorage دستگاه شما با رمزنگاری ذخیره می‌شوند و به هیچ سرور ثانویه‌ای ارسال نمی‌گردند.</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
                    <div>
                      <div className="text-sm font-bold text-white">بازگشت به تنظیمات پیش‌فرض کارخانه</div>
                      <div className="text-xs text-slate-400 mt-0.5">در صورت تمایل می‌توانید تمام تغییرات این صفحه را به حالت اولیه بازگردانید.</div>
                    </div>
                    <button
                      onClick={onReset}
                      className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-all text-xs font-bold border border-red-500/20 shrink-0"
                    >
                      <RefreshCw className="w-4 h-4" />
                      <span>بازنشانی کل تنظیمات (Reset)</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
};


