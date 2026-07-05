export type Role = 'user' | 'assistant' | 'system';

export interface Attachment {
  id: string;
  name: string;
  type: string; // 'image' | 'file' | 'chart'
  data: string; // base64 or text content
  size?: number;
}

export interface Message {
  id: string;
  role: Role;
  content: string;
  images?: string[]; // base64 strings for chart analysis
  files?: { name: string; content: string }[];
  timestamp: number;
  modelUsed?: string;
  provider?: string;
  signal?: 'BUY' | 'SELL' | 'NEUTRAL' | 'WARNING';
}

export interface KnowledgeItem {
  id: string;
  title: string;
  category: 'technical_analysis' | 'price_action' | 'risk_management' | 'smart_money' | 'custom_strategy' | 'chart_pattern';
  content: string;
  fileName?: string;
  fileType?: string;
  fileData?: string; // base64 or raw text if uploaded from file/image
  isActive: boolean; // Must have active toggle as requested! ("یک گزینه فعال کنار حذف و ویرایش اضافه کن که بگم طبق این تحلیل کن")
  createdAt: number;
  updatedAt: number;
}

export interface AIModelConfig {
  id: string;
  name: string;
  provider: 'gemini' | 'openai' | 'anthropic' | 'deepseek' | 'ollama';
  apiKey?: string;
  baseUrl?: string; // e.g. for Ollama http://localhost:11434
  modelId: string;
  isVerified: boolean;
  isActive: boolean;
  isDefault: boolean;
  isCustom?: boolean; // Whether created/added by user
  customPrompt?: string; // Custom instructions for this specific model
  temperature?: number; // 0.0 to 1.0 (creativity vs precision)
  maxTokens?: number; // e.g. 4096 or 8192
  topP?: number;
  reasoningEffort?: 'low' | 'medium' | 'high' | 'auto'; // For models with reasoning
  avatarColor?: 'blue' | 'indigo' | 'purple' | 'emerald' | 'amber' | 'rose' | 'cyan';
}

export interface UserSettings {
  // Trading Core
  tradingStyle: 'Scalping' | 'Day Trading' | 'Swing Trading' | 'Position Trading' | 'Algorithmic Quant';
  riskPerTrade: '0.5%' | '1%' | '2%' | '3%' | '5% (Aggressive)';
  defaultTimeframe: '1m / 5m' | '15m / 30m' | '1H / 4H' | 'Daily / Weekly';
  systemPrompt: string;
  autoAnalyzeCharts: boolean;
  
  // UI Appearance & Theme (Sleek Blue & Modern)
  theme: 'dark-blue' | 'slate-blue' | 'cosmic-dark' | 'midnight-black' | 'cyber-indigo';
  language: 'fa' | 'en';
  contrast: 'normal' | 'high' | 'ultra';
  accentColor: 'blue' | 'indigo' | 'cyan' | 'purple' | 'slate';
  soundEffects: boolean;
  enableDictation: boolean;
  
  // Advanced AI Personalization (The ChatGPT Style Personalization tab!)
  aiVoiceTone: 'professional' | 'aggressive' | 'friendly' | 'institutional' | 'socratic';
  aiReasoningDepth: 'fast' | 'detailed' | 'deep-quant' | 'step-by-step';
  chartAnalysisSensitivity: 'high' | 'medium' | 'low';
  enableAutoSuggestions: boolean;
  responseFormat: 'markdown' | 'bullet-points' | 'executive-summary' | 'full-report';
  tradingSessionFocus: 'london' | 'new-york' | 'tokyo' | 'all';
  enableRiskWarnings: boolean;
  higherIntelligenceAuto: boolean; // ChatGPT auto-switch reasoning toggle
}

export type TabType = 'chat' | 'knowledge' | 'models' | 'settings';
