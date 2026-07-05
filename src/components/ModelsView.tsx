import React, { useState } from 'react';
import { 
  Cpu, 
  Key, 
  CheckCircle2, 
  XCircle, 
  RefreshCw, 
  ShieldCheck, 
  AlertTriangle, 
  Bot, 
  Zap, 
  Terminal, 
  Lock,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Sliders,
  Check,
  PlusCircle,
  Trash2,
  Edit3,
  Plus,
  HelpCircle,
  Wand2
} from 'lucide-react';
import { AIModelConfig } from '../types';

interface ModelsViewProps {
  models: AIModelConfig[];
  onUpdateModel: (id: string, updated: Partial<AIModelConfig>) => void;
  onSetDefault: (id: string) => void;
  onAddModel?: (newModel: Omit<AIModelConfig, 'id'>) => void;
  onDeleteModel?: (id: string) => void;
}

export const ModelsView: React.FC<ModelsViewProps> = ({
  models,
  onUpdateModel,
  onSetDefault,
  onAddModel,
  onDeleteModel
}) => {
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [selectedOverride, setSelectedOverride] = useState<string>('auto');
  const [detecting, setDetecting] = useState(false);
  const [detectedMessage, setDetectedMessage] = useState<{ success: boolean; text: string; provider?: string } | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [testingId, setTestingId] = useState<string | null>(null);
  
  // New Manual Model Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newModelName, setNewModelName] = useState('');
  const [newModelProvider, setNewModelProvider] = useState<AIModelConfig['provider']>('gemini');
  const [newModelIdStr, setNewModelIdStr] = useState('gemini-2.5-pro');
  const [newModelKey, setNewModelKey] = useState('');

  // Auto-Detect & Connect API Key
  const handleAutoDetectAndAdd = async () => {
    const cleanInput = apiKeyInput.trim();
    if (!cleanInput) {
      setDetectedMessage({ success: false, text: 'لطفاً کلید API یا آدرس سرور (Base URL) را وارد کنید.' });
      return;
    }

    setDetecting(true);
    setDetectedMessage(null);

    try {
      let detectedProvider: AIModelConfig['provider'] = 'gemini';
      let detectedName = 'Google Gemini 2.5 Pro (اختصاصی کاربر)';
      let defaultModelId = 'gemini-2.5-pro';
      let isBaseUrl = false;

      // Smart Detection Algorithm
      if (selectedOverride !== 'auto') {
        detectedProvider = selectedOverride as any;
        if (detectedProvider === 'gemini') { detectedName = 'Custom Gemini Pro'; defaultModelId = 'gemini-2.5-pro'; }
        if (detectedProvider === 'openai') { detectedName = 'Custom GPT-4o'; defaultModelId = 'gpt-4o'; }
        if (detectedProvider === 'anthropic') { detectedName = 'Custom Claude 3.5'; defaultModelId = 'claude-3-5-sonnet-20241022'; }
        if (detectedProvider === 'deepseek') { detectedName = 'Custom DeepSeek R1'; defaultModelId = 'deepseek-chat'; }
        if (detectedProvider === 'ollama') { detectedName = 'Ollama Local LLM'; defaultModelId = 'llama3'; isBaseUrl = true; }
      } else {
        if (cleanInput.startsWith('AIza') || cleanInput.toLowerCase().includes('gemini') || cleanInput.toLowerCase().includes('google')) {
          detectedProvider = 'gemini';
          detectedName = 'Gemini 2.5 Pro (Custom API)';
          defaultModelId = 'gemini-2.5-pro';
        } else if (cleanInput.startsWith('sk-ant-') || cleanInput.toLowerCase().includes('claude') || cleanInput.toLowerCase().includes('anthropic')) {
          detectedProvider = 'anthropic';
          detectedName = 'Claude 3.5 Sonnet (Custom API)';
          defaultModelId = 'claude-3-5-sonnet-20241022';
        } else if (cleanInput.toLowerCase().includes('deepseek') || cleanInput.startsWith('sk-ds')) {
          detectedProvider = 'deepseek';
          detectedName = 'DeepSeek R1 (Custom API)';
          defaultModelId = 'deepseek-chat';
        } else if (cleanInput.startsWith('http://') || cleanInput.startsWith('https://') || cleanInput.includes('localhost') || cleanInput.includes('11434')) {
          detectedProvider = 'ollama';
          detectedName = 'Ollama Local Node';
          defaultModelId = 'llama3';
          isBaseUrl = true;
        } else if (cleanInput.startsWith('sk-') || cleanInput.startsWith('proj-') || cleanInput.toLowerCase().includes('openai')) {
          detectedProvider = 'openai';
          detectedName = 'OpenAI GPT-4o (Custom API)';
          defaultModelId = 'gpt-4o';
        }
      }

      // Check if user wants to directly add as a NEW model or update existing
      // As requested: "زمانی که API رو تشخیص میده به صورت مستقیم اضافه بشه به لیست هوش مصنوعی ها و بتونم براش اسم و شخصی سازی کنم"
      if (onAddModel) {
        onAddModel({
          name: `${detectedName} - ${new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })}`,
          provider: detectedProvider,
          modelId: defaultModelId,
          apiKey: isBaseUrl ? undefined : cleanInput,
          baseUrl: isBaseUrl ? cleanInput : undefined,
          isVerified: true,
          isActive: true,
          isDefault: false,
          isCustom: true,
          temperature: 0.7,
          customPrompt: ''
        });
        setDetectedMessage({
          success: true,
          text: `✨ کلید API با موفقیت تشخیص داده شد و یک مدل اختصاصی جدید به لیست اضافه شد! اکنون می‌توانید نام و پارامترهای آن را شخصی‌سازی کنید.`,
          provider: detectedProvider
        });
        setApiKeyInput('');
      } else {
        // Fallback to update existing
        const targetModel = models.find(m => m.provider === detectedProvider) || models[0];
        onUpdateModel(targetModel.id, {
          apiKey: isBaseUrl ? targetModel.apiKey : cleanInput,
          baseUrl: isBaseUrl ? cleanInput : targetModel.baseUrl,
          isVerified: true,
          isActive: true
        });
        setDetectedMessage({
          success: true,
          text: `✨ کلید برای مدل ${targetModel.name} ثبت و فعال شد.`,
          provider: detectedProvider
        });
        setApiKeyInput('');
      }
    } catch (err: any) {
      setDetectedMessage({
        success: false,
        text: `خطا در تشخیص یا افزودن کلید: ${err.message || 'عدم دسترسی'}`
      });
    } finally {
      setDetecting(false);
    }
  };

  // Verify specific existing model
  const handleVerifyExisting = async (model: AIModelConfig) => {
    setTestingId(model.id);
    try {
      const res = await fetch('/api/test-model', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: model.provider,
          apiKey: model.apiKey,
          baseUrl: model.baseUrl,
          modelId: model.modelId
        })
      });
      const data = await res.json() as { success: boolean; message: string };
      if (data.success) {
        onUpdateModel(model.id, { isVerified: true, isActive: true });
      } else {
        onUpdateModel(model.id, { isVerified: false });
      }
    } catch (e) {
      onUpdateModel(model.id, { isVerified: false });
    } finally {
      setTestingId(null);
    }
  };

  const handleCreateManualModel = () => {
    if (!newModelName.trim()) return;
    if (onAddModel) {
      onAddModel({
        name: newModelName.trim(),
        provider: newModelProvider,
        modelId: newModelIdStr.trim() || 'gemini-2.5-pro',
        apiKey: newModelProvider === 'ollama' ? undefined : newModelKey.trim(),
        baseUrl: newModelProvider === 'ollama' ? (newModelKey.trim() || 'http://localhost:11434') : undefined,
        isVerified: !!newModelKey.trim() || newModelProvider === 'gemini',
        isActive: true,
        isDefault: false,
        isCustom: true,
        temperature: 0.7
      });
      setShowAddModal(false);
      setNewModelName('');
      setNewModelKey('');
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Top Banner & Explanation */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#1e293b]">
        <div>
          <div className="flex items-center gap-2 text-blue-400 mb-1">
            <Sparkles className="w-5 h-5 animate-pulse" />
            <span className="font-mono text-xs uppercase tracking-wider font-semibold">SMART AUTO-DETECT & AI CUSTOMIZATION</span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">
            مدیریت موتورهای هوش مصنوعی، تشخیص خودکار API و شخصی‌سازی شناور
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>افزودن مدل سفارشی جدید</span>
          </button>
        </div>
      </div>

      {/* SMART AUTO-DETECT INPUT BOX (ChatGPT Style) */}
      <div className="bg-gradient-to-r from-[#111827] via-[#151f38] to-[#111827] border-2 border-blue-500/40 rounded-3xl p-6 md:p-8 shadow-2xl shadow-blue-500/10 relative overflow-hidden transition-all hover:border-blue-500/60">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -z-0 pointer-events-none" />
        
        <div className="relative z-10 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <label className="text-sm font-bold text-white flex items-center gap-2">
              <Key className="w-4 h-4 text-blue-400" />
              <span>تشخیص خودکار API و افزودن مستقیم به لیست هوش مصنوعی‌ها</span>
            </label>
            
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-400">حالت ارائه‌دهنده:</span>
              <select
                value={selectedOverride}
                onChange={(e) => setSelectedOverride(e.target.value)}
                className="bg-[#0a0f1d] border border-[#1e293b] rounded-lg px-2.5 py-1 text-xs text-blue-300 focus:outline-none focus:border-blue-500"
              >
                <option value="auto">✨ تشخیص هوشمند خودکار (Auto-Detect)</option>
                <option value="gemini">Google Gemini</option>
                <option value="openai">OpenAI (ChatGPT)</option>
                <option value="anthropic">Anthropic Claude</option>
                <option value="deepseek">DeepSeek AI</option>
                <option value="ollama">Ollama Local</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <input
                type="password"
                placeholder="کلید API خود (AIza..., sk-proj..., sk-ant...) یا آدرس http://localhost را اینجا پیست کنید..."
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAutoDetectAndAdd()}
                className="w-full bg-[#0a0f1d]/90 border border-blue-500/30 focus:border-blue-400 rounded-2xl pl-4 pr-11 py-3.5 text-sm text-white font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all placeholder:text-slate-500 shadow-inner"
              />
              <Lock className="w-5 h-5 text-blue-400/60 absolute right-4 top-3.5" />
            </div>

            <button
              onClick={handleAutoDetectAndAdd}
              disabled={detecting || !apiKeyInput.trim()}
              className={`flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl text-sm font-bold transition-all shadow-lg flex-shrink-0 ${
                detecting || !apiKeyInput.trim()
                  ? 'bg-blue-600/30 text-blue-300/50 cursor-not-allowed border border-blue-500/20'
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-blue-500/30 active:scale-[0.98]'
              }`}
            >
              {detecting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>در حال تشخیص و ایجاد...</span>
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4 text-blue-300" />
                  <span>تشخیص و افزودن مستقیم به لیست</span>
                </>
              )}
            </button>
          </div>

          {/* Detection Alert Result */}
          {detectedMessage && (
            <div className={`p-3.5 rounded-xl text-xs flex items-center gap-2.5 border animate-fade-in ${
              detectedMessage.success
                ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40'
                : 'bg-red-500/15 text-red-300 border-red-500/40'
            }`}>
              {detectedMessage.success ? <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" /> : <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />}
              <span className="font-medium">{detectedMessage.text}</span>
            </div>
          )}

          <p className="text-[11px] text-slate-400 leading-relaxed pt-1 flex items-center gap-1.5">
            <span className="text-blue-400 font-bold">⚡ ویژگی جدید:</span> با پیست کردن هر کلید API، سیستم به‌صورت خودکار یک مدل شناور جدید در لیست زیر ایجاد می‌کند و به شما امکان ویرایش نام و شخصی‌سازی پارامترهای آن را می‌دهد.
          </p>
        </div>
      </div>

      {/* FLOATING & SECTIONED MODELS LIST (ChatGPT Style Accordion) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <Bot className="w-4 h-4 text-blue-400" />
            <span>مدل‌های متصل و شناور در اتاق ترید ({models.filter(m => m.isActive).length} فعال)</span>
          </h3>
          <span className="text-xs text-slate-500">برای ویرایش نام، کلید و شخصی‌سازی روی هر مدل کلیک کنید</span>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {models.map((model) => {
            const isExpanded = expandedId === model.id;
            const isTestingThis = testingId === model.id;

            return (
              <div
                key={model.id}
                className={`border rounded-2xl transition-all duration-300 overflow-hidden ${
                  model.isActive
                    ? 'bg-[#111827]/90 border-blue-500/30 shadow-md hover:border-blue-500/50'
                    : 'bg-[#0f1626]/60 border-[#1e293b]/80 opacity-75 hover:opacity-100'
                }`}
              >
                {/* Header Row - Floating & Sleek */}
                <div
                  onClick={() => setExpandedId(isExpanded ? null : model.id)}
                  className="flex items-center justify-between p-4.5 md:p-5 cursor-pointer select-none gap-4"
                >
                  <div className="flex items-center gap-3.5 min-w-0 flex-1">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border ${
                      model.provider === 'gemini' ? 'bg-blue-600/20 border-blue-500/30 text-blue-400' :
                      model.provider === 'openai' ? 'bg-emerald-600/20 border-emerald-500/30 text-emerald-400' :
                      model.provider === 'anthropic' ? 'bg-purple-600/20 border-purple-500/30 text-purple-400' :
                      model.provider === 'deepseek' ? 'bg-indigo-600/20 border-indigo-500/30 text-indigo-400' :
                      'bg-amber-600/20 border-amber-500/30 text-amber-400'
                    }`}>
                      <Bot className="w-5 h-5" />
                    </div>

                    <div className="truncate flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-bold text-white tracking-tight">{model.name}</span>
                        {model.isDefault && (
                          <span className="bg-blue-600 text-white text-[10px] px-2 py-0.5 rounded-full font-semibold">
                            موتور اصلی
                          </span>
                        )}
                        {model.isCustom && (
                          <span className="bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] px-2 py-0.5 rounded-full font-mono">
                            اختصاصی شما
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono mt-0.5 truncate flex items-center gap-2">
                        <span>ID: <strong className="text-slate-300">{model.modelId}</strong></span>
                        <span>•</span>
                        <span className="uppercase text-blue-400 font-semibold">{model.provider}</span>
                        {model.temperature !== undefined && (
                          <>
                            <span>•</span>
                            <span className="text-amber-400">Temp: {model.temperature}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                    {/* Status Badge */}
                    <div className="hidden sm:flex items-center">
                      {model.isVerified || model.apiKey || model.provider === 'gemini' ? (
                        <span className="bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-[10px] px-2.5 py-1 rounded-full font-mono flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          آماده به کار
                        </span>
                      ) : (
                        <span className="bg-slate-800 text-slate-400 border border-slate-700 text-[10px] px-2.5 py-1 rounded-full font-mono flex items-center gap-1">
                          <XCircle className="w-3 h-3 text-slate-500" />
                          نیازمند کلید
                        </span>
                      )}
                    </div>

                    {/* Quick Toggle Active */}
                    <button
                      onClick={() => onUpdateModel(model.id, { isActive: !model.isActive })}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                        model.isActive
                          ? 'bg-blue-600/20 text-blue-300 border-blue-500/40 hover:bg-blue-600/30'
                          : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
                      }`}
                    >
                      {model.isActive ? 'فعال' : 'غیرفعال'}
                    </button>

                    <button
                      onClick={() => setExpandedId(isExpanded ? null : model.id)}
                      className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-all"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Floating Expanded Detail & Customization Section */}
                {isExpanded && (
                  <div className="px-5 pb-5 pt-3 border-t border-[#1e293b]/80 bg-[#0a0f1d]/70 space-y-5 animate-fade-in">
                    
                    {/* Row 1: Name & Model ID override */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs text-slate-300 font-semibold flex items-center gap-1.5">
                          <Edit3 className="w-3.5 h-3.5 text-blue-400" />
                          <span>نام نمایشی هوش مصنوعی (Custom Name)</span>
                        </label>
                        <input
                          type="text"
                          value={model.name}
                          onChange={(e) => onUpdateModel(model.id, { name: e.target.value })}
                          placeholder="نام دلخواه خود را وارد کنید..."
                          className="w-full bg-[#111827] border border-[#1e293b] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-blue-500 transition-all"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs text-slate-300 font-semibold flex items-center gap-1.5">
                          <Terminal className="w-3.5 h-3.5 text-indigo-400" />
                          <span>شناسه دقیق مدل در سرور (Model ID)</span>
                        </label>
                        <input
                          type="text"
                          value={model.modelId}
                          onChange={(e) => onUpdateModel(model.id, { modelId: e.target.value })}
                          placeholder="مثلاً: gemini-2.5-pro یا gpt-4o"
                          className="w-full bg-[#111827] border border-[#1e293b] rounded-xl px-3.5 py-2 text-xs text-white font-mono focus:outline-none focus:border-blue-500 transition-all"
                        />
                      </div>
                    </div>

                    {/* Row 2: API Key or Base URL & Temperature Slider */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                      <div className="space-y-1.5">
                        <label className="text-xs text-slate-300 font-semibold flex items-center justify-between">
                          <span>{model.provider === 'ollama' ? 'آدرس سرور محلی (Base URL)' : `کلید API اختصاصی (${model.provider.toUpperCase()})`}</span>
                          {model.apiKey && (
                            <span className="text-[10px] text-emerald-400 font-mono">ذخیره شده</span>
                          )}
                        </label>
                        <input
                          type={model.provider === 'ollama' ? 'text' : 'password'}
                          value={model.provider === 'ollama' ? (model.baseUrl || 'http://localhost:11434') : (model.apiKey || '')}
                          onChange={(e) => onUpdateModel(model.id, model.provider === 'ollama' ? { baseUrl: e.target.value } : { apiKey: e.target.value, isVerified: false })}
                          placeholder={model.provider === 'gemini' ? 'کلید جمینی (در صورت عدم ثبت از سرور استفاده می‌شود)' : 'کلید API خود را وارد کنید...'}
                          className="w-full bg-[#111827] border border-[#1e293b] rounded-xl px-3.5 py-2 text-xs text-white font-mono focus:outline-none focus:border-blue-500 transition-all"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs text-slate-300 font-semibold">
                          <span className="flex items-center gap-1.5">
                            <Sliders className="w-3.5 h-3.5 text-amber-400" />
                            <span>دمای خلاقیت و نوسان (Temperature)</span>
                          </span>
                          <span className="font-mono text-amber-400">{model.temperature ?? 0.7}</span>
                        </div>
                        <div className="flex items-center gap-3 bg-[#111827] px-3 py-2 rounded-xl border border-[#1e293b]">
                          <span className="text-[10px] text-slate-400">دقیق (۰)</span>
                          <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.05"
                            value={model.temperature ?? 0.7}
                            onChange={(e) => onUpdateModel(model.id, { temperature: parseFloat(e.target.value) })}
                            className="flex-1 accent-blue-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                          />
                          <span className="text-[10px] text-slate-400">خلاق (۱)</span>
                        </div>
                      </div>
                    </div>

                    {/* Row 3: Custom System Prompt Override for this model */}
                    <div className="space-y-1.5">
                      <label className="text-xs text-slate-300 font-semibold flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <Wand2 className="w-3.5 h-3.5 text-purple-400" />
                          <span>دستورالعمل اختصاصی برای این مدل (Model-Specific System Prompt)</span>
                        </span>
                        <span className="text-[10px] text-slate-500 font-normal">اختیاری (در صورت خالی بودن از دستورالعمل اصلی پیروی می‌کند)</span>
                      </label>
                      <input
                        type="text"
                        value={model.customPrompt || ''}
                        onChange={(e) => onUpdateModel(model.id, { customPrompt: e.target.value })}
                        placeholder="مثلاً: تو یک معامله‌گر اسکالپر طلا هستید که فقط سیگنال سریع می‌دهی..."
                        className="w-full bg-[#111827] border border-[#1e293b] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-blue-500 transition-all font-mono"
                      />
                    </div>

                    {/* Action Buttons: Test, Set Default, and DELETE MODEL */}
                    <div className="flex items-center justify-between gap-3 pt-2 border-t border-[#1e293b]/50">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleVerifyExisting(model)}
                          disabled={isTestingThis}
                          className="flex items-center gap-1.5 py-2 px-4 bg-[#1e293b] hover:bg-blue-600/20 hover:text-blue-300 text-slate-300 rounded-xl text-xs font-semibold transition-all border border-transparent hover:border-blue-500/30"
                        >
                          {isTestingThis ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
                          <span>تست صحت اتصال</span>
                        </button>

                        {!model.isDefault && (
                          <button
                            onClick={() => onSetDefault(model.id)}
                            className="py-2 px-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold transition-all shadow-md shadow-blue-600/20"
                          >
                            انتخاب به عنوان موتور اصلی
                          </button>
                        )}
                      </div>

                      {onDeleteModel && (
                        <button
                          onClick={() => {
                            if (window.confirm(`آیا از حذف مدل «${model.name}» اطمینان دارید؟`)) {
                              onDeleteModel(model.id);
                            }
                          }}
                          className="flex items-center gap-1.5 py-2 px-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 rounded-xl text-xs font-semibold transition-all border border-red-500/20"
                          title="حذف این مدل از لیست"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>حذف مدل</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}

              </div>
            );
          })}
        </div>
      </div>

      {/* Manual Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#111827] border border-[#27272a] rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#1e293b]">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-blue-400" />
                <span>افزودن مدل هوش مصنوعی دلخواه (Manual Model)</span>
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">نام نمایشی در اتاق ترید</label>
                <input
                  type="text"
                  placeholder="مثلاً: Gemini VIP Pro یا Claude Quantitative"
                  value={newModelName}
                  onChange={(e) => setNewModelName(e.target.value)}
                  className="w-full bg-[#0a0f1d] border border-[#1e293b] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">ارائه‌دهنده (Provider)</label>
                  <select
                    value={newModelProvider}
                    onChange={(e) => {
                      const val = e.target.value as any;
                      setNewModelProvider(val);
                      if (val === 'gemini') setNewModelIdStr('gemini-2.5-pro');
                      if (val === 'openai') setNewModelIdStr('gpt-4o');
                      if (val === 'anthropic') setNewModelIdStr('claude-3-5-sonnet-20241022');
                      if (val === 'deepseek') setNewModelIdStr('deepseek-chat');
                      if (val === 'ollama') setNewModelIdStr('llama3');
                    }}
                    className="w-full bg-[#0a0f1d] border border-[#1e293b] rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="gemini">Google Gemini</option>
                    <option value="openai">OpenAI (ChatGPT)</option>
                    <option value="anthropic">Anthropic Claude</option>
                    <option value="deepseek">DeepSeek AI</option>
                    <option value="ollama">Ollama Local</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">شناسه مدل (Model ID)</label>
                  <input
                    type="text"
                    value={newModelIdStr}
                    onChange={(e) => setNewModelIdStr(e.target.value)}
                    placeholder="gemini-2.5-pro / gpt-4o"
                    className="w-full bg-[#0a0f1d] border border-[#1e293b] rounded-xl px-3 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  {newModelProvider === 'ollama' ? 'آدرس سرور Ollama (Base URL)' : 'کلید API (API Key)'}
                </label>
                <input
                  type={newModelProvider === 'ollama' ? 'text' : 'password'}
                  placeholder={newModelProvider === 'ollama' ? 'http://localhost:11434' : 'AIza... / sk-... / ...'}
                  value={newModelKey}
                  onChange={(e) => setNewModelKey(e.target.value)}
                  className="w-full bg-[#0a0f1d] border border-[#1e293b] rounded-xl px-4 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#1e293b]">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 rounded-xl bg-[#1e293b] text-slate-300 hover:bg-[#27354d] text-xs font-semibold"
              >
                انصراف
              </button>
              <button
                onClick={handleCreateManualModel}
                disabled={!newModelName.trim()}
                className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${
                  newModelName.trim()
                    ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/20'
                    : 'bg-blue-600/30 text-blue-300/40 cursor-not-allowed'
                }`}
              >
                افزودن به لیست مدل‌ها
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};


