import { KnowledgeItem, AIModelConfig, UserSettings, Message } from '../types';

const STORAGE_KEYS = {
  KNOWLEDGE: 'trademind_knowledge_base_v1',
  MODELS: 'trademind_ai_models_v1',
  SETTINGS: 'trademind_user_settings_v1',
  CHATS: 'trademind_chat_history_v1'
};

// Initial AI Models (Ready for custom user API keys)
const DEFAULT_MODELS: AIModelConfig[] = [
  {
    id: 'gemini-2.5-flash',
    name: 'Google Gemini 2.5 Flash (پیش‌فرض سرور - فوق سریع)',
    provider: 'gemini',
    modelId: 'gemini-2.5-flash',
    isVerified: true,
    isActive: true,
    isDefault: true,
  },
  {
    id: 'gemini-2.5-pro',
    name: 'Google Gemini 2.5 Pro (تحلیل چارت و استدلال عمیق)',
    provider: 'gemini',
    modelId: 'gemini-2.5-pro',
    isVerified: true,
    isActive: true,
    isDefault: false,
  },
  {
    id: 'openai-gpt4o',
    name: 'OpenAI GPT-4o (ترید و پرایس اکشن حرفه‌ای)',
    provider: 'openai',
    modelId: 'gpt-4o',
    apiKey: '',
    isVerified: false,
    isActive: false,
    isDefault: false,
  },
  {
    id: 'deepseek-r1',
    name: 'DeepSeek R1 / V3 (تحلیل کوآنت و منطقی)',
    provider: 'deepseek',
    modelId: 'deepseek-chat',
    apiKey: '',
    isVerified: false,
    isActive: false,
    isDefault: false,
  },
  {
    id: 'claude-3-5-sonnet',
    name: 'Anthropic Claude 3.5 Sonnet (تحلیل تکنیکال و فاندامنتال)',
    provider: 'anthropic',
    modelId: 'claude-3-5-sonnet-20241022',
    apiKey: '',
    isVerified: false,
    isActive: false,
    isDefault: false,
  },
  {
    id: 'ollama-local',
    name: 'Ollama Local (بدون نیاز به اینترنت - Llama 3 / Mistral)',
    provider: 'ollama',
    modelId: 'llama3',
    baseUrl: 'http://localhost:11434',
    isVerified: false,
    isActive: false,
    isDefault: false,
  }
];

const DEFAULT_SETTINGS: UserSettings = {
  tradingStyle: 'Swing Trading',
  riskPerTrade: '1%',
  defaultTimeframe: '1H / 4H',
  systemPrompt: 'تحلیل دقیق همراه با بررسی ساختار بازار (Market Structure)، ارزیابی ریسک به ریوارد (R/R)، تعیین حد ضرر (Stop Loss) و اهداف سود (Take Profit). پرهیز از هیجانات معاملاتی.',
  autoAnalyzeCharts: true,
  
  theme: 'dark-blue',
  language: 'fa',
  contrast: 'normal',
  accentColor: 'blue',
  soundEffects: true,
  enableDictation: true,
  
  aiVoiceTone: 'institutional',
  aiReasoningDepth: 'detailed',
  chartAnalysisSensitivity: 'high',
  enableAutoSuggestions: true,
  responseFormat: 'executive-summary',
  tradingSessionFocus: 'all',
  enableRiskWarnings: true,
  higherIntelligenceAuto: true
};

export const StorageService = {
  // Knowledge Base
  getKnowledge(): KnowledgeItem[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.KNOWLEDGE);
      return data ? JSON.parse(data) : []; // Strictly EMPTY by default per user request
    } catch (e) {
      console.error('Error loading knowledge:', e);
      return [];
    }
  },
  saveKnowledge(items: KnowledgeItem[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.KNOWLEDGE, JSON.stringify(items));
    } catch (e) {
      console.error('Error saving knowledge:', e);
    }
  },

  // AI Models
  getModels(): AIModelConfig[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.MODELS);
      if (!data) return DEFAULT_MODELS;
      const parsed = JSON.parse(data);
      // Ensure default models exist if new ones were introduced
      return parsed.length > 0 ? parsed : DEFAULT_MODELS;
    } catch (e) {
      return DEFAULT_MODELS;
    }
  },
  saveModels(models: AIModelConfig[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.MODELS, JSON.stringify(models));
    } catch (e) {
      console.error('Error saving models:', e);
    }
  },

  // Settings
  getSettings(): UserSettings {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return data ? { ...DEFAULT_SETTINGS, ...JSON.parse(data) } : DEFAULT_SETTINGS;
    } catch (e) {
      return DEFAULT_SETTINGS;
    }
  },
  saveSettings(settings: UserSettings): void {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.error('Error saving settings:', e);
    }
  },

  // Chats
  getChats(): Record<string, Message[]> {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CHATS);
      return data ? JSON.parse(data) : {};
    } catch (e) {
      return {};
    }
  },
  saveChats(chats: Record<string, Message[]>): void {
    try {
      localStorage.setItem(STORAGE_KEYS.CHATS, JSON.stringify(chats));
    } catch (e) {
      console.error('Error saving chats:', e);
    }
  }
};
