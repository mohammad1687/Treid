import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Image as ImageIcon, 
  Paperclip, 
  Trash2, 
  Bot, 
  User, 
  Sparkles, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  ShieldCheck, 
  ChevronDown, 
  X, 
  FileText, 
  CheckCircle2, 
  Copy, 
  Check, 
  Maximize2,
  Cpu,
  Layers,
  ArrowRight,
  Mic,
  MicOff,
  Volume2
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Message, AIModelConfig, KnowledgeItem, UserSettings } from '../types';

interface ChatViewProps {
  messages: Message[];
  onSendMessage: (text: string, images?: string[], files?: { name: string; content: string }[]) => void;
  isLoading: boolean;
  activeModel: AIModelConfig | undefined;
  models: AIModelConfig[];
  onSelectModel: (modelId: string) => void;
  activeKnowledge: KnowledgeItem[];
  onClearChat: () => void;
  onNavigateToKnowledge: () => void;
  onNavigateToModels: () => void;
  settings?: UserSettings;
  onUpdateSettings?: (settings: UserSettings) => void;
}

export const ChatView: React.FC<ChatViewProps> = ({
  messages,
  onSendMessage,
  isLoading,
  activeModel,
  models,
  onSelectModel,
  activeKnowledge,
  onClearChat,
  onNavigateToKnowledge,
  onNavigateToModels,
  settings,
  onUpdateSettings,
}) => {
  const [inputText, setInputText] = useState('');
  const [attachedImages, setAttachedImages] = useState<string[]>([]);
  const [attachedFiles, setAttachedFiles] = useState<{ name: string; content: string }[]>([]);
  
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const prevMsgCountRef = useRef(messages.length);

  // Web Audio Synthesizer for sound effects
  const playAudioEffect = (type: 'send' | 'receive' | 'alert') => {
    if (settings?.soundEffects === false) return;
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'send') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.08);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.08);
      } else if (type === 'receive') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(523.25, ctx.currentTime);
        osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.07);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.15);
      } else if (type === 'alert') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(300, ctx.currentTime);
        osc.frequency.setValueAtTime(250, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.2);
      }
    } catch (e) {
      // Audio playback might be restricted before user interaction
    }
  };

  // Trigger audio on new AI messages
  useEffect(() => {
    if (messages.length > prevMsgCountRef.current) {
      const lastMsg = messages[messages.length - 1];
      if (lastMsg && lastMsg.role === 'assistant') {
        playAudioEffect('receive');
        if (settings?.enableRiskWarnings !== false && (lastMsg.content.includes('هشدار') || lastMsg.content.includes('ریسک') || lastMsg.content.includes('اهرم') || lastMsg.content.includes('ضرر'))) {
          setTimeout(() => playAudioEffect('alert'), 200);
        }
      }
    }
    prevMsgCountRef.current = messages.length;
  }, [messages.length, settings?.soundEffects, settings?.enableRiskWarnings]);

  // Auto scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Active verified models for dropdown
  const activeModels = models.filter((m) => m.isActive);

  // Voice Dictation handler
  const toggleDictation = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('مرورگر شما از قابلیت تشخیص گفتار صوتی پشتیبانی نمی‌کند (لطفاً از مرورگر Chrome استفاده کنید).');
      return;
    }
    if (isListening) {
      setIsListening(false);
      return;
    }
    try {
      const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRec();
      recognition.lang = settings?.language === 'en' ? 'en-US' : 'fa-IR';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
        playAudioEffect('send');
      };

      recognition.onresult = (event: any) => {
        const speechToText = event.results[0][0].transcript;
        setInputText((prev) => prev ? `${prev} ${speechToText}` : speechToText);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (e) {
      setIsListening(false);
      alert('خطا در دسترسی به میکروفون. لطفاً دسترسی مرورگر را بررسی کنید.');
    }
  };

  // Helper to get smart suggestions from AI text or defaults
  const getSmartSuggestions = (msgContent: string) => {
    const markerIndex = msgContent.indexOf('💡 پیشنهادات هوشمند بعدی:');
    if (markerIndex !== -1) {
      const sectionText = msgContent.substring(markerIndex);
      const lines = sectionText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
      const found: string[] = [];
      for (const l of lines) {
        if (l.match(/^[1-3][\.\)-]\s+/)) {
          found.push(l.replace(/^[1-3][\.\)-]\s+/, '').trim());
        } else if (l.startsWith('- ') && l !== '- ') {
          found.push(l.substring(2).trim());
        }
      }
      if (found.length >= 2) return found.slice(0, 3);
    }
    return [
      'نسبت ریسک به ریوارد (R/R) و تعیین دقیق حد ضرر (Stop Loss) این ست‌اپ چگونه است؟',
      'بررسی اوردربلاک‌ها و نواحی نقدینگی نهنگ‌ها در تایم‌فریم بالاتر (4H/Daily)',
      'سناریوی جایگزین (Alternative Scenario) در صورت شکست ناحیه حمایتی چیست؟'
    ];
  };

  // Handle image attachment
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      if (!file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        const base64 = ev.target?.result as string;
        if (base64 && !attachedImages.includes(base64)) {
          setAttachedImages((prev) => [...prev, base64].slice(0, 4)); // max 4 images
        }
      };
      reader.readAsDataURL(file);
    });
    if (imageInputRef.current) imageInputRef.current.value = '';
  };

  // Handle file attachment
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const text = ev.target?.result as string;
        if (text) {
          setAttachedFiles((prev) => [...prev, { name: file.name, content: text }].slice(0, 3));
        }
      };
      reader.readAsText(file);
    });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSend = () => {
    if ((!inputText.trim() && attachedImages.length === 0 && attachedFiles.length === 0) || isLoading) {
      return;
    }

    playAudioEffect('send');
    onSendMessage(inputText, attachedImages.length > 0 ? attachedImages : undefined, attachedFiles.length > 0 ? attachedFiles : undefined);
    setInputText('');
    setAttachedImages([]);
    setAttachedFiles([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Helper to detect trade signal in AI response
  const detectSignal = (text: string) => {
    const upper = text.toUpperCase();
    if (upper.includes('BUY') || upper.includes('LONG') || upper.includes('خرید') || upper.includes('صعودی')) {
      if (upper.includes('SELL') || upper.includes('SHORT')) return null; // mixed
      return { type: 'BUY', label: 'سیگنال احتمالی: خرید / LONG (صعودی)', color: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40' };
    }
    if (upper.includes('SELL') || upper.includes('SHORT') || upper.includes('فروش') || upper.includes('نزولی')) {
      return { type: 'SELL', label: 'سیگنال احتمالی: فروش / SHORT (نزولی)', color: 'bg-red-500/15 text-red-300 border-red-500/40' };
    }
    return null;
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0a0f1d] text-slate-200 relative overflow-hidden">
      
      {/* Top ChatGPT Style Header */}
      <header className="h-14 border-b border-[#1e293b] bg-[#0d1322]/90 backdrop-blur-md px-4 flex items-center justify-between z-20 flex-shrink-0">
        
        {/* Left: Active Model Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowModelDropdown(!showModelDropdown)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#141d33] hover:bg-[#1a2642] border border-blue-500/30 text-xs font-semibold text-blue-200 transition-all shadow-sm"
          >
            <Cpu className="w-3.5 h-3.5 text-blue-400" />
            <span>{activeModel ? activeModel.name.split('(')[0].trim() : 'انتخاب موتور هوش مصنوعی'}</span>
            <ChevronDown className={`w-3.5 h-3.5 text-blue-400 transition-transform ${showModelDropdown ? 'rotate-180' : ''}`} />
          </button>

          {/* Dropdown Menu */}
          {showModelDropdown && (
            <div className="absolute right-0 mt-2 w-72 bg-[#111827] border border-[#1e293b] rounded-2xl shadow-2xl p-2 z-50 animate-scale-up">
              <div className="text-[10px] font-semibold text-slate-400 px-2.5 py-1.5 uppercase border-b border-[#1e293b]/60 mb-1">
                موتورهای فعال و تایید شده (Verified API)
              </div>
              
              {activeModels.length === 0 ? (
                <div className="p-3 text-center text-xs text-slate-400">
                  هیچ مدلی فعال نیست.
                  <button 
                    onClick={() => { setShowModelDropdown(false); onNavigateToModels(); }}
                    className="block w-full mt-2 text-blue-400 hover:underline font-semibold"
                  >
                    تنظیم کلیدهای API
                  </button>
                </div>
              ) : (
                activeModels.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => {
                      onSelectModel(m.id);
                      setShowModelDropdown(false);
                    }}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs text-right transition-all ${
                      activeModel?.id === m.id
                        ? 'bg-blue-600/20 text-blue-300 font-bold border border-blue-500/30'
                        : 'text-slate-300 hover:bg-[#1a233a]'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className="w-2 h-2 rounded-full bg-blue-400 flex-shrink-0" />
                      <span className="truncate">{m.name}</span>
                    </div>
                    {activeModel?.id === m.id && <CheckCircle2 className="w-4 h-4 text-blue-400 flex-shrink-0" />}
                  </button>
                ))
              )}

              <div className="mt-2 pt-2 border-t border-[#1e293b] px-1">
                <button
                  onClick={() => {
                    setShowModelDropdown(false);
                    onNavigateToModels();
                  }}
                  className="w-full text-center text-[11px] text-blue-400 hover:text-blue-300 font-medium py-1 rounded-lg hover:bg-blue-600/10 transition-all flex items-center justify-center gap-1"
                >
                  <span>مدیریت کلیدهای API و تست صحت اتصال</span>
                  <ArrowRight className="w-3 h-3 rotate-180" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Center: Active Knowledge Notice */}
        <div 
          onClick={onNavigateToKnowledge}
          className="hidden md:flex items-center gap-2 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 px-3 py-1 rounded-full text-xs text-blue-300 font-mono cursor-pointer transition-all group"
          title="این سندها در پرامپت هوش مصنوعی تزریق شده و تحلیل بر اساس آن‌ها صورت می‌گیرد"
        >
          <Layers className="w-3.5 h-3.5 text-blue-400 group-hover:rotate-12 transition-transform" />
          <span>⚡ {activeKnowledge.length} سند تحلیلی فعال در حافظه (Knowledge Base)</span>
        </div>

        {/* Right: Clear Chat */}
        <div className="flex items-center gap-2">
          {messages.length > 0 && (
            <button
              onClick={onClearChat}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#141d33] hover:bg-red-500/20 text-slate-300 hover:text-red-400 border border-[#1e293b] hover:border-red-500/30 text-xs transition-all"
              title="پاک کردن تاریخچه این گفتگو"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">پاک کردن صفحه</span>
            </button>
          )}
        </div>

      </header>

      {/* Main Chat Feed */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 custom-scrollbar">
        
        {/* Welcome Empty State */}
        {messages.length === 0 ? (
          <div className="max-w-3xl mx-auto my-auto py-12 text-center animate-fade-in flex flex-col items-center justify-center min-h-[65vh]">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-2xl shadow-blue-500/30 ring-1 ring-blue-400/40 mb-6">
              <TrendingUp className="w-8 h-8 text-white animate-bounce" />
            </div>

            <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight mb-3">
              اتاق تحلیل معاملاتی ProTrade AI
            </h2>
            <p className="text-sm text-slate-400 max-w-xl mb-8 leading-relaxed">
              چارت، اسکرین‌شات یا سوال تخصصی ترید خود را ارسال کنید. هوش مصنوعی بر اساس <span className="text-blue-400 font-bold">داده‌های فعال شما در بخش «داده‌ها»</span> و مدیریت سرمایه پاسخ خواهد داد.
            </p>

            {/* Quick Prompts Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-2xl text-right">
              {[
                { title: "📊 تحلیل تکنیکال چارت بیتکوین (BTC/USDT)", desc: "بررسی سطوح کلیدی حمایت، مقاومت و سناریوی صعودی/نزولی" },
                { title: "⚡ بررسی ساختار بازار و ریسک به ریوارد طلا", desc: "محاسبه دقیق حد ضرر (Stop Loss) و اهداف سود (Take Profit)" },
                { title: "🎯 ارزیابی الگوهای پرایس اکشن و کندل‌استیک", desc: "تشخیص نقدینگی (Liquidity) و اوردر بلاک‌های اسمارت مانی" },
                { title: "🛡️ محاسبه حجم پوزیشن بر اساس ۱٪ ریسک", desc: "مدیریت سرمایه حرفه‌ای برای جلوگیری از کال مارجین" }
              ].map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => onSendMessage(prompt.title)}
                  className="bg-[#111827]/80 hover:bg-[#162038] border border-[#1e293b] hover:border-blue-500/40 p-4 rounded-2xl text-right transition-all group flex flex-col justify-between shadow-md"
                >
                  <div className="font-semibold text-xs text-white group-hover:text-blue-300 transition-colors mb-1">
                    {prompt.title}
                  </div>
                  <div className="text-[11px] text-slate-400 leading-normal">
                    {prompt.desc}
                  </div>
                </button>
              ))}
            </div>

            {activeKnowledge.length === 0 && (
              <div 
                onClick={onNavigateToKnowledge}
                className="mt-8 bg-blue-600/10 border border-blue-500/30 hover:border-blue-500/60 px-5 py-3 rounded-2xl text-xs text-blue-300 cursor-pointer transition-all flex items-center gap-2 max-w-lg"
              >
                <Sparkles className="w-4 h-4 text-blue-400 flex-shrink-0 animate-pulse" />
                <span>نکته: شما هنوز هیچ استراتژی در بخش «داده‌ها» فعال نکرده‌اید. برای تحلیل اختصاصی، داده‌های خود را آپلود و فعال کنید.</span>
              </div>
            )}
          </div>
        ) : (
          /* Render Message List */
          <div className="max-w-4xl mx-auto space-y-6 pb-4">
            {messages.map((msg, idx) => {
              const isUser = msg.role === 'user';
              const signal = !isUser ? detectSignal(msg.content) : null;

              return (
                <div
                  key={msg.id}
                  className={`flex items-start gap-4 animate-fade-in ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  {/* Avatar */}
                  <div className={`w-9 h-9 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-md ${
                    isUser
                      ? 'bg-blue-600 text-white border border-blue-400/40'
                      : 'bg-[#111827] border border-blue-500/40 text-blue-400 ring-1 ring-blue-500/20'
                  }`}>
                    {isUser ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
                  </div>

                  {/* Bubble / Card */}
                  <div className={`flex-1 min-w-0 max-w-[88%] ${isUser ? 'text-right' : 'text-right'}`}>
                    
                    {/* Header meta */}
                    <div className={`flex items-center gap-2 text-[11px] text-slate-400 mb-1.5 ${isUser ? 'justify-start' : 'justify-start'}`}>
                      <span className="font-bold text-slate-300">{isUser ? 'شما (معامله‌گر)' : 'ProTrade AI'}</span>
                      {msg.modelUsed && (
                        <span className="bg-blue-500/15 text-blue-300 px-2 py-0.5 rounded-md font-mono text-[10px] border border-blue-500/20">
                          {msg.modelUsed}
                        </span>
                      )}
                      <span className="font-mono text-slate-500 text-[10px]">
                        {new Date(msg.timestamp).toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    {/* Trade Signal Badge if detected in AI response */}
                    {signal && (
                      <div className={`mb-3 p-2.5 rounded-xl border flex items-center justify-between text-xs font-bold font-mono shadow-md ${signal.color}`}>
                        <div className="flex items-center gap-2">
                          <TrendingUp className="w-4 h-4" />
                          <span>{signal.label}</span>
                        </div>
                        <span className="text-[10px] uppercase px-2 py-0.5 rounded bg-black/20">AI TRADE SIGNAL</span>
                      </div>
                    )}

                    {/* Message Body */}
                    <div className={`p-5 rounded-2xl shadow-xl transition-all ${
                      isUser
                        ? 'bg-blue-600 text-white rounded-tr-none border border-blue-400/30 font-medium text-sm leading-relaxed'
                        : 'bg-[#111827] text-slate-200 rounded-tl-none border border-[#1e293b] leading-relaxed'
                    }`}>
                      
                      {/* Attached Images preview inside chat bubble */}
                      {msg.images && msg.images.length > 0 && (
                        <div className="grid grid-cols-2 gap-2 mb-3">
                          {msg.images.map((img, idx) => (
                            <div 
                              key={idx} 
                              onClick={() => setPreviewImage(img)}
                              className="relative rounded-xl overflow-hidden border border-white/20 cursor-pointer group max-h-48 bg-black/40 flex items-center justify-center"
                            >
                              <img src={img} alt="attached chart" className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300" />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                                <Maximize2 className="w-6 h-6" />
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Attached Files preview inside chat bubble */}
                      {msg.files && msg.files.length > 0 && (
                        <div className="space-y-1.5 mb-3">
                          {msg.files.map((f, idx) => (
                            <div key={idx} className="flex items-center gap-2 p-2 rounded-lg bg-black/20 border border-white/10 text-xs font-mono">
                              <FileText className="w-4 h-4 flex-shrink-0" />
                              <span className="truncate">{f.name}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Render text content (Markdown for AI, raw for User) */}
                      {isUser ? (
                        <div className="whitespace-pre-wrap">{msg.content}</div>
                      ) : (
                        <div className="markdown-body text-sm prose prose-invert max-w-none">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {msg.content}
                          </ReactMarkdown>
                        </div>
                      )}

                    </div>

                    {/* Footer tools for AI responses (Copy button, Risk Alert, Auto Suggestions) */}
                    {!isUser && (
                      <div className="mt-2 space-y-2">
                        <div className="flex items-center gap-2 text-xs text-slate-400">
                          <button
                            onClick={() => copyToClipboard(msg.content, msg.id)}
                            className="flex items-center gap-1 px-2.5 py-1 rounded-lg hover:bg-[#1a233a] hover:text-white transition-all text-[11px]"
                            title="کپی متن تحلیل"
                          >
                            {copiedId === msg.id ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-blue-400" />
                                <span className="text-blue-400">کپی شد</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" />
                                <span>کپی تحلیل</span>
                              </>
                            )}
                          </button>
                        </div>

                        {/* Active Risk Alert Banner */}
                        {settings?.enableRiskWarnings !== false && (msg.content.includes('هشدار') || msg.content.includes('ریسک') || msg.content.includes('اهرم') || msg.content.includes('leverage') || msg.content.includes('ضرر')) && (
                          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 flex items-start gap-2.5 text-xs animate-fade-in">
                            <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5 animate-pulse" />
                            <span>هشدار مدیریت سرمایه: همیشه حد ضرر (Stop Loss) را رعایت کرده و از اهرم منطقی (حداکثر ۱ تا ۳ درصد ریسک) استفاده کنید.</span>
                          </div>
                        )}

                        {/* Interactive Follow-up Suggestions */}
                        {settings?.enableAutoSuggestions !== false && idx === messages.length - 1 && !isLoading && (
                          <div className="pt-3 border-t border-white/10 space-y-2.5 animate-fade-in">
                            <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-300">
                              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                              <span>💡 پیشنهادات هوشمند بعدی برای تحلیل عمیق‌تر:</span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {getSmartSuggestions(msg.content).map((sug, sIdx) => (
                                <button
                                  key={sIdx}
                                  onClick={() => {
                                    onSendMessage(sug);
                                  }}
                                  className="text-xs bg-[#151f38] hover:bg-blue-600/20 text-slate-300 hover:text-blue-300 border border-[#27354d] hover:border-blue-500/40 rounded-xl px-3 py-2 transition-all text-right flex items-center gap-2 group cursor-pointer shadow-sm"
                                >
                                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400 group-hover:scale-125 transition-transform" />
                                  <span>{sug}</span>
                                  <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-blue-400 rotate-180" />
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                  </div>
                </div>
              );
            })}

            {/* Loading / Generating State */}
            {isLoading && (
              <div className="flex items-start gap-4 animate-fade-in">
                <div className="w-9 h-9 rounded-2xl bg-[#111827] border border-blue-500/40 text-blue-400 flex items-center justify-center flex-shrink-0 shadow-md">
                  <Bot className="w-5 h-5 animate-spin" />
                </div>
                <div className="bg-[#111827] border border-[#1e293b] p-4 rounded-2xl rounded-tl-none shadow-lg text-xs text-slate-300 flex items-center gap-3">
                  <div className="flex space-x-1 space-x-reverse">
                    <span className="w-2 h-2 rounded-full bg-blue-400 animate-bounce [animation-delay:-0.3s]" />
                    <span className="w-2 h-2 rounded-full bg-blue-400 animate-bounce [animation-delay:-0.15s]" />
                    <span className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" />
                  </div>
                  <span className="font-mono text-blue-300">در حال ارزیابی چارت و قوانین فعال شما در پایگاه داده...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}

      </div>

      {/* ChatGPT Style Sleek Input Bar at Bottom */}
      <div className="p-4 bg-[#0d1322]/95 border-t border-[#1e293b] backdrop-blur-md z-20 flex-shrink-0">
        <div className="max-w-4xl mx-auto">
          
          {/* Attachment Previews Area above textarea */}
          {(attachedImages.length > 0 || attachedFiles.length > 0) && (
            <div className="flex items-center gap-3 flex-wrap pb-3 mb-2 border-b border-[#1e293b]/60">
              
              {/* Images preview */}
              {attachedImages.map((img, idx) => (
                <div key={idx} className="relative group rounded-xl overflow-hidden border border-blue-500/40 bg-[#0a0f1d] w-16 h-16 shadow-md flex items-center justify-center">
                  <img src={img} alt="chart preview" className="w-full h-full object-cover" />
                  <button
                    onClick={() => setAttachedImages((prev) => prev.filter((_, i) => i !== idx))}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 opacity-80 hover:opacity-100 transition-opacity"
                    title="حذف تصویر"
                  >
                    <X className="w-3 h-3" />
                  </button>
                  <span className="absolute bottom-0 inset-x-0 bg-blue-600/80 text-[9px] text-center text-white font-mono py-0.5">CHART</span>
                </div>
              ))}

              {/* Files preview */}
              {attachedFiles.map((f, idx) => (
                <div key={idx} className="relative group rounded-xl border border-blue-500/40 bg-[#111827] px-3 py-2 shadow-md flex items-center gap-2 text-xs font-mono text-blue-300">
                  <FileText className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate max-w-[120px]">{f.name}</span>
                  <button
                    onClick={() => setAttachedFiles((prev) => prev.filter((_, i) => i !== idx))}
                    className="text-slate-400 hover:text-red-400 transition-colors ml-1"
                    title="حذف فایل"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}

            </div>
          )}

          {/* Main Input Box */}
          <div className="relative bg-[#111827] border border-[#1e293b] focus-within:border-blue-500/60 rounded-2xl shadow-2xl transition-all p-2 flex items-end gap-2">
            
            {/* Attachment buttons */}
            <div className="flex items-center gap-1 pb-1 pr-1">
              
              {/* Image Attach Button */}
              <button
                type="button"
                onClick={() => imageInputRef.current?.click()}
                className="p-2.5 rounded-xl text-slate-400 hover:text-blue-400 hover:bg-[#1a233a] transition-all"
                title="آپلود اسکرین‌شات چارت (PNG, JPG) برای تحلیل تصویری"
              >
                <ImageIcon className="w-5 h-5" />
              </button>
              <input
                type="file"
                ref={imageInputRef}
                accept="image/*"
                multiple
                onChange={handleImageSelect}
                className="hidden"
              />

              {/* File Attach Button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-2.5 rounded-xl text-slate-400 hover:text-blue-400 hover:bg-[#1a233a] transition-all"
                title="آپلود فایل متنی، استراتژی یا تاریخچه ترید (TXT, CSV, MD)"
              >
                <Paperclip className="w-5 h-5" />
              </button>
              <input
                type="file"
                ref={fileInputRef}
                accept=".txt,.md,.csv,.json,.pdf"
                multiple
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>

            {/* Textarea */}
            <textarea
              rows={1}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="دستور، سوال یا جفت‌ارز مورد نظر خود را تایپ کنید (مثلاً: تحلیل چارت طلا در تایم ۱ ساعته)..."
              className="flex-1 bg-transparent text-sm text-white placeholder:text-slate-500 py-3 px-2 focus:outline-none resize-none max-h-36 overflow-y-auto leading-relaxed custom-scrollbar"
              style={{ minHeight: '44px' }}
            />

            {/* Voice Dictation Button */}
            {settings?.enableDictation !== false && (
              <button
                type="button"
                onClick={toggleDictation}
                className={`p-3 rounded-xl transition-all flex-shrink-0 border ${
                  isListening 
                    ? 'bg-red-500/20 text-red-400 border-red-500/50 animate-pulse shadow-lg shadow-red-500/20' 
                    : 'bg-[#1a233a] text-slate-400 hover:text-blue-400 border-white/10 hover:border-blue-500/30'
                }`}
                title={isListening ? "در حال ضبط صدا... (برای اتمام کلیک کنید)" : "تایپ صوتی (گفتار به متن)"}
              >
                {isListening ? <MicOff className="w-5 h-5 animate-bounce text-red-400" /> : <Mic className="w-5 h-5" />}
              </button>
            )}

            {/* Send Button */}
            <button
              onClick={handleSend}
              disabled={(!inputText.trim() && attachedImages.length === 0 && attachedFiles.length === 0) || isLoading}
              className={`p-3 rounded-xl transition-all flex-shrink-0 shadow-lg ${
                (!inputText.trim() && attachedImages.length === 0 && attachedFiles.length === 0) || isLoading
                  ? 'bg-slate-800 text-slate-600 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-blue-600/30 active:scale-95'
              }`}
            >
              <Send className="w-5 h-5" />
            </button>

          </div>
          
          <div className="text-center mt-2">
            <span className="text-[10px] text-slate-500">
              ⚡ تحلیل‌ها بر اساس استراتژی‌های فعال شما در بخش «داده‌ها» و مدیریت سرمایه انجام می‌شود. برای ارسال Enter بزنید (Shift+Enter برای خط جدید).
            </span>
          </div>

        </div>
      </div>

      {/* Fullscreen Image Preview Modal */}
      {previewImage && (
        <div 
          onClick={() => setPreviewImage(null)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in cursor-zoom-out"
        >
          <div className="relative max-w-5xl max-h-[90vh] flex items-center justify-center">
            <img src={previewImage} alt="fullscreen preview" className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl border border-white/20" />
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-black/80 text-white hover:bg-red-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
