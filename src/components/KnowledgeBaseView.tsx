import React, { useState } from 'react';
import { 
  Database, 
  Plus, 
  Trash2, 
  Edit3, 
  CheckCircle2, 
  XCircle, 
  Upload, 
  FileText, 
  Image as ImageIcon, 
  AlertCircle, 
  TrendingUp, 
  Sparkles, 
  Filter, 
  ToggleLeft, 
  ToggleRight,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { KnowledgeItem } from '../types';

interface KnowledgeBaseViewProps {
  items: KnowledgeItem[];
  onAddItem: (item: Omit<KnowledgeItem, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdateItem: (id: string, updated: Partial<KnowledgeItem>) => void;
  onDeleteItem: (id: string) => void;
  onToggleActive: (id: string) => void;
}

const CATEGORY_LABELS: Record<string, { label: string; color: string }> = {
  technical_analysis: { label: 'تحلیل تکنیکال (Technical Analysis)', color: 'bg-blue-500/10 text-blue-300 border-blue-500/30' },
  price_action: { label: 'پرایس اکشن (Price Action)', color: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30' },
  smart_money: { label: 'اسمارت مانی (Smart Money / ICT)', color: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30' },
  risk_management: { label: 'مدیریت سرمایه و ریسک (Risk)', color: 'bg-amber-500/10 text-amber-300 border-amber-500/30' },
  chart_pattern: { label: 'الگوهای چارت و کندل‌ها (Patterns)', color: 'bg-purple-500/10 text-purple-300 border-purple-500/30' },
  custom_strategy: { label: 'استراتژی اختصاصی ترید (Custom)', color: 'bg-rose-500/10 text-rose-300 border-rose-500/30' },
};

export const KnowledgeBaseView: React.FC<KnowledgeBaseViewProps> = ({
  items,
  onAddItem,
  onUpdateItem,
  onDeleteItem,
  onToggleActive,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<KnowledgeItem['category']>('technical_analysis');
  const [content, setContent] = useState('');
  const [fileName, setFileName] = useState('');
  const [fileData, setFileData] = useState('');
  const [isActive, setIsActive] = useState(true);
  
  const [filterCategory, setFilterCategory] = useState<string>('ALL');

  // Handle File/Image upload inside knowledge
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();

    if (file.type.startsWith('image/')) {
      reader.onload = (event) => {
        setFileData(event.target?.result as string);
        if (!title) setTitle(`چارت/تصویر استراتژی: ${file.name.replace(/\.[^/.]+$/, '')}`);
      };
      reader.readAsDataURL(file);
    } else {
      // Text or CSV or JSON
      reader.onload = (event) => {
        const text = event.target?.result as string;
        setContent((prev) => prev + (prev ? '\n\n' : '') + `--- فایل ضمیمه: ${file.name} ---\n` + text);
        if (!title) setTitle(`مستندات معاملاتی: ${file.name.replace(/\.[^/.]+$/, '')}`);
      };
      reader.readAsText(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() && !content.trim()) return;

    if (editingId) {
      onUpdateItem(editingId, { title, category, content, fileName, fileData, isActive });
    } else {
      onAddItem({ title, category, content, fileName, fileData, isActive });
    }

    resetForm();
    setIsModalOpen(false);
  };

  const handleEdit = (item: KnowledgeItem) => {
    setEditingId(item.id);
    setTitle(item.title);
    setCategory(item.category);
    setContent(item.content);
    setFileName(item.fileName || '');
    setFileData(item.fileData || '');
    setIsActive(item.isActive);
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setEditingId(null);
    setTitle('');
    setCategory('technical_analysis');
    setContent('');
    setFileName('');
    setFileData('');
    setIsActive(true);
  };

  const filteredItems = filterCategory === 'ALL' 
    ? items 
    : items.filter(item => item.category === filterCategory);

  const activeCount = items.filter(item => item.isActive).length;

  return (
    <div className="flex-1 overflow-y-auto bg-[#0a0f1d] text-slate-200 p-6 md:p-10">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#1e293b]">
          <div>
            <div className="flex items-center gap-2 text-blue-400 mb-1">
              <Database className="w-5 h-5" />
              <span className="font-mono text-xs uppercase tracking-wider font-semibold">KNOWLEDGE ENGINE & STRATEGY VAULT</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
              پایگاه داده و استراتژی‌های اختصاصی ترید
            </h1>
            <p className="text-sm text-slate-400 mt-2 max-w-3xl leading-relaxed">
              در این بخش شما می‌توانید تمامی قوانین، الگوهای تکنیکال، یادداشت‌ها، چارت‌های کلیدی و استراتژی‌های شخصی خود را وارد کنید. 
              طبق دستور شما، هیچ داده‌ای از قبل آماده نشده است و سیستم تنها بر اساس داده‌هایی که شما آپلود و <span className="text-blue-400 font-semibold underline decoration-blue-500/50">فعال (Active)</span> می‌کنید، تحلیل انجام می‌دهد.
            </p>
          </div>

          <button
            onClick={() => {
              resetForm();
              setIsModalOpen(true);
            }}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium px-5 py-3 rounded-xl shadow-lg shadow-blue-600/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0 border border-blue-400/30 flex-shrink-0 text-sm"
          >
            <Plus className="w-5 h-5" />
            <span>افزودن استراتژی یا داده جدید</span>
          </button>
        </div>

        {/* Status Bar & Filters */}
        <div className="bg-[#111827] border border-[#1e293b] rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/15 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-slate-400">وضعیت اعمال در موتور تحلیل هوش مصنوعی:</div>
              <div className="text-sm font-semibold text-white flex items-center gap-2 mt-0.5">
                <span>{activeCount} سند فعال از مجموع {items.length} سند آپلود شده</span>
                {activeCount > 0 ? (
                  <span className="bg-blue-500/20 text-blue-300 text-xs px-2.5 py-0.5 rounded-full font-mono border border-blue-500/30 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                    INJECTED IN PROMPT
                  </span>
                ) : (
                  <span className="bg-slate-700 text-slate-300 text-xs px-2.5 py-0.5 rounded-full font-mono">
                    NO ACTIVE DATA
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
            <Filter className="w-4 h-4 text-slate-400 mr-1 flex-shrink-0" />
            <button
              onClick={() => setFilterCategory('ALL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                filterCategory === 'ALL'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'bg-[#1a233a] text-slate-400 hover:text-white hover:bg-[#232f4e]'
              }`}
            >
              همه ({items.length})
            </button>
            {Object.entries(CATEGORY_LABELS).map(([key, value]) => {
              const count = items.filter(i => i.category === key).length;
              if (count === 0 && filterCategory !== key) return null;
              return (
                <button
                  key={key}
                  onClick={() => setFilterCategory(key)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                    filterCategory === key
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                      : 'bg-[#1a233a] text-slate-400 hover:text-white hover:bg-[#232f4e]'
                  }`}
                >
                  {value.label.split('(')[0].trim()} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {/* Empty State when no items uploaded yet */}
        {items.length === 0 ? (
          <div className="bg-[#111827] border-2 border-dashed border-[#1e293b] rounded-2xl p-12 text-center max-w-2xl mx-auto my-12 shadow-2xl">
            <div className="w-16 h-16 bg-blue-600/10 rounded-2xl flex items-center justify-center mx-auto mb-5 border border-blue-500/20 text-blue-400 shadow-inner">
              <Upload className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">هیچ داده یا تحلیلی از قبل در سیستم وجود ندارد</h3>
            <p className="text-sm text-slate-400 mb-6 leading-relaxed">
              طبق درخواست شما، سیستم کاملاً خالی و خام است تا دقیقاً استراتژی‌ها، فایل‌ها و تصاویر تحلیلی شما را دریافت کند.
              اولین تحلیل تکنیکال یا قانون معاملاتی خود را آپلود کنید و با زدن دکمه <span className="text-blue-400 font-bold">"فعال (Active)"</span> آن را به مغز هوش مصنوعی متصل کنید.
            </p>
            <button
              onClick={() => {
                resetForm();
                setIsModalOpen(true);
              }}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-medium px-6 py-3 rounded-xl shadow-lg shadow-blue-600/30 transition-all text-sm"
            >
              <Plus className="w-4 h-4" />
              <span>افزودن اولین داده یا استراتژی</span>
            </button>
          </div>
        ) : (
          /* Knowledge Items Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredItems.map((item) => {
              const catInfo = CATEGORY_LABELS[item.category] || CATEGORY_LABELS.technical_analysis;
              return (
                <div 
                  key={item.id}
                  className={`group bg-[#111827] border rounded-2xl p-5 transition-all flex flex-col justify-between ${
                    item.isActive 
                      ? 'border-blue-500/50 shadow-lg shadow-blue-500/5 bg-gradient-to-b from-[#111827] to-[#141d33]' 
                      : 'border-[#1e293b] opacity-75 hover:opacity-100'
                  }`}
                >
                  <div>
                    {/* Item Header with Category Badge and Active Status */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <span className={`text-[11px] px-2.5 py-1 rounded-lg font-medium border ${catInfo.color}`}>
                        {catInfo.label}
                      </span>
                      
                      <div className="flex items-center gap-2">
                        {/* THE ACTIVE TOGGLE REQUESTED BY USER */}
                        <button
                          onClick={() => onToggleActive(item.id)}
                          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer select-none border ${
                            item.isActive
                              ? 'bg-blue-600 text-white border-blue-400 shadow-md shadow-blue-600/30'
                              : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700 hover:text-slate-200'
                          }`}
                          title={item.isActive ? "فعال در موتور هوش مصنوعی (کلیک برای غیرفعال‌سازی)" : "غیرفعال (کلیک برای فعال‌سازی در تحلیل‌ها)"}
                        >
                          {item.isActive ? (
                            <>
                              <ToggleRight className="w-4 h-4 text-white" />
                              <span>فعال در تحلیل</span>
                            </>
                          ) : (
                            <>
                              <ToggleLeft className="w-4 h-4 text-slate-400" />
                              <span>غیرفعال</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="text-base font-bold text-white mb-2 group-hover:text-blue-300 transition-colors">
                      {item.title}
                    </h3>

                    {/* Image Preview if uploaded */}
                    {item.fileData && item.fileData.startsWith('data:image/') && (
                      <div className="mb-3 rounded-xl overflow-hidden border border-[#1e293b] max-h-48 bg-[#0a0f1d] flex items-center justify-center">
                        <img src={item.fileData} alt={item.title} className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500" />
                      </div>
                    )}

                    {/* Content Snippet */}
                    <div className="text-xs text-slate-300 bg-[#0a0f1d]/70 rounded-xl p-3.5 border border-[#1e293b] font-mono leading-relaxed whitespace-pre-wrap max-h-36 overflow-y-auto custom-scrollbar mb-4">
                      {item.content || (item.fileData ? 'تصویر چارت / فایل پیوست شده برای ارزیابی هوش مصنوعی' : 'بدون محتوای متنی')}
                    </div>

                    {item.fileName && (
                      <div className="flex items-center gap-2 text-xs text-blue-400 bg-blue-500/10 border border-blue-500/20 px-3 py-1.5 rounded-lg mb-4 w-fit font-mono">
                        <FileText className="w-3.5 h-3.5" />
                        <span className="truncate max-w-[200px]">{item.fileName}</span>
                      </div>
                    )}
                  </div>

                  {/* Actions Footer: Edit & Delete ("گزینه فعال کنار حذف و ویرایش") */}
                  <div className="flex items-center justify-between pt-3 border-t border-[#1e293b]/80 text-xs text-slate-400">
                    <span className="font-mono text-[11px] text-slate-500">
                      ثبت: {new Date(item.createdAt).toLocaleDateString('fa-IR')}
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(item)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#1a233a] hover:bg-blue-600/20 text-slate-300 hover:text-blue-300 border border-transparent hover:border-blue-500/30 transition-all"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>ویرایش</span>
                      </button>

                      <button
                        onClick={() => onDeleteItem(item.id)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#1a233a] hover:bg-red-500/20 text-slate-300 hover:text-red-400 border border-transparent hover:border-red-500/30 transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>حذف</span>
                      </button>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#111827] border border-[#1e293b] rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl animate-scale-up max-h-[90vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-[#1e293b] flex items-center justify-between bg-[#141d33]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                  {editingId ? <Edit3 className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">
                    {editingId ? 'ویرایش داده یا استراتژی معاملاتی' : 'افزودن داده و تحلیل جدید به حافظه'}
                  </h3>
                  <p className="text-xs text-blue-400/80">
                    این مطالب بلافاصله در پرامپت تحلیل تکنیکال هوش مصنوعی تزریق می‌شوند.
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-slate-400 hover:text-white hover:bg-[#1e293b] rounded-xl transition-all"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto flex-1 custom-scrollbar">
              
              {/* Title & Active Toggle */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2 space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">عنوان استراتژی یا تحلیل <span className="text-red-400">*</span></label>
                  <input
                    type="text"
                    required
                    placeholder="مثلاً: استراتژی تقاطع میانگین متحرک (EMA 20 & 50) یا تحلیل چارت طلا..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-[#0a0f1d] border border-[#1e293b] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-slate-600"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">وضعیت در هوش مصنوعی</label>
                  <button
                    type="button"
                    onClick={() => setIsActive(!isActive)}
                    className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold border transition-all ${
                      isActive
                        ? 'bg-blue-600 text-white border-blue-400 shadow-md shadow-blue-600/30'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}
                  >
                    {isActive ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-white" />
                        <span>فعال (اعمال در تحلیل)</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-4 h-4 text-slate-400" />
                        <span>غیرفعال</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Category */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">دسته‌بندی تخصصی ترید</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full bg-[#0a0f1d] border border-[#1e293b] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 transition-all"
                >
                  {Object.entries(CATEGORY_LABELS).map(([key, val]) => (
                    <option key={key} value={key} className="bg-[#0a0f1d] text-white">
                      {val.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* File / Image Upload Box */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                  <span>آپلود فایل تحلیل یا تصویر چارت (اختیاری)</span>
                  {fileName && (
                    <span className="text-blue-400 text-xs font-mono">فایل انتخاب شده: {fileName}</span>
                  )}
                </label>
                
                <div className="border-2 border-dashed border-[#1e293b] hover:border-blue-500/50 bg-[#0a0f1d]/50 rounded-2xl p-4 text-center transition-all cursor-pointer relative">
                  <input
                    type="file"
                    accept="image/*,.txt,.md,.csv,.json,.pdf"
                    onChange={handleFileUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  
                  {fileData && fileData.startsWith('data:image/') ? (
                    <div className="flex flex-col items-center">
                      <img src={fileData} alt="preview" className="h-32 object-contain rounded-lg mb-2 border border-[#1e293b]" />
                      <span className="text-xs text-blue-400 font-medium">تصویر آپلود شد - برای تغییر کلیک کنید یا فایل دیگری بکشید</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-2 text-slate-400">
                      <div className="w-10 h-10 rounded-full bg-blue-600/10 flex items-center justify-center mb-2 text-blue-400">
                        <Upload className="w-5 h-5" />
                      </div>
                      <p className="text-xs font-medium text-slate-300">برای آپلود تصویر چارت یا فایل متنی استراتژی، کلیک کنید یا فایل را اینجا بکشید</p>
                      <p className="text-[10px] text-slate-500 mt-1">پشتیبانی از PNG, JPG برای تحلیل چارت با هوش مصنوعی و TXT, CSV, MD</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Text Content */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                  <span>متن قوانین، یادداشت‌ها یا دستورالعمل معاملاتی <span className="text-red-400">*</span></span>
                  <span className="text-[11px] text-slate-500">این متن به عنوان دستورالعمل در تحلیل‌ها استفاده می‌شود</span>
                </label>
                <textarea
                  rows={6}
                  required
                  placeholder="قوانین استراتژی خود را بنویسید. مثلاً:&#10;1. فقط زمانی وارد پوزیشن BUY شو که کندل 4 ساعته بالای مقاومت بسته شود.&#10;2. حد ضرر (Stop Loss) را حتماً زیر آخرین کف نقدینگی (Swing Low) قرار بده.&#10;3. اگر شاخص RSI بالای 70 بود، هشدار اشباع خرید صادر کن..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full bg-[#0a0f1d] border border-[#1e293b] rounded-xl p-4 text-sm text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-mono leading-relaxed placeholder:text-slate-600 custom-scrollbar"
                />
              </div>

              {/* Modal Actions */}
              <div className="pt-4 border-t border-[#1e293b] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-[#1a233a] hover:bg-[#232f4e] text-slate-300 font-medium text-sm transition-all"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-medium text-sm transition-all shadow-lg shadow-blue-600/30"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>{editingId ? 'ذخیره تغییرات استراتژی' : 'ثبت و فعال‌سازی در موتور تحلیل'}</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
