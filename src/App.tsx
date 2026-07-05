import React, { useState, useEffect } from 'react';
import { StorageService } from './lib/storage';
import { TabType, KnowledgeItem, AIModelConfig, UserSettings, Message } from './types';
import { Sidebar } from './components/Sidebar';
import { ChatView } from './components/ChatView';
import { KnowledgeBaseView } from './components/KnowledgeBaseView';
import { ModelsView } from './components/ModelsView';
import { SettingsView } from './components/SettingsView';

export default function App() {
  // Navigation & UI State
  const [activeTab, setActiveTab] = useState<TabType>('chat');
  
  // Storage State
  const [knowledge, setKnowledge] = useState<KnowledgeItem[]>([]);
  const [models, setModels] = useState<AIModelConfig[]>([]);
  const [settings, setSettings] = useState<UserSettings>(StorageService.getSettings());
  const [chats, setChats] = useState<Record<string, Message[]>>({});
  const [currentChatId, setCurrentChatId] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Initialize data on mount
  useEffect(() => {
    const loadedKnowledge = StorageService.getKnowledge();
    const loadedModels = StorageService.getModels();
    const loadedSettings = StorageService.getSettings();
    const loadedChats = StorageService.getChats();

    setKnowledge(loadedKnowledge);
    setModels(loadedModels);
    setSettings(loadedSettings);
    setChats(loadedChats);

    // Ensure at least one active chat thread exists
    const chatIds = Object.keys(loadedChats);
    if (chatIds.length === 0) {
      const newId = 'chat_' + Date.now();
      const initialChats = { [newId]: [] };
      setChats(initialChats);
      setCurrentChatId(newId);
      StorageService.saveChats(initialChats);
    } else {
      setCurrentChatId(chatIds[chatIds.length - 1]);
    }
  }, []);

  // Sync Theme & Personalization to document body for global CSS overrides
  useEffect(() => {
    const theme = settings.theme || 'dark-blue';
    const contrast = settings.contrast || 'normal';
    const accent = settings.accentColor || 'blue';
    
    document.body.setAttribute('data-theme', theme);
    document.body.setAttribute('data-contrast', contrast);
    document.body.setAttribute('data-accent', accent);
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.setAttribute('data-contrast', contrast);
    document.documentElement.setAttribute('data-accent', accent);
  }, [settings.theme, settings.contrast, settings.accentColor]);

  // Sync Knowledge to storage
  const handleSaveKnowledge = (newItems: KnowledgeItem[]) => {
    setKnowledge(newItems);
    StorageService.saveKnowledge(newItems);
  };

  // Knowledge Handlers
  const handleAddKnowledge = (itemData: Omit<KnowledgeItem, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newItem: KnowledgeItem = {
      ...itemData,
      id: 'kb_' + Date.now() + Math.random().toString(36).substring(2, 6),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    handleSaveKnowledge([newItem, ...knowledge]);
  };

  const handleUpdateKnowledge = (id: string, updated: Partial<KnowledgeItem>) => {
    const newItems = knowledge.map((item) => 
      item.id === id ? { ...item, ...updated, updatedAt: Date.now() } : item
    );
    handleSaveKnowledge(newItems);
  };

  const handleDeleteKnowledge = (id: string) => {
    const newItems = knowledge.filter((item) => item.id !== id);
    handleSaveKnowledge(newItems);
  };

  const handleToggleKnowledgeActive = (id: string) => {
    const newItems = knowledge.map((item) =>
      item.id === id ? { ...item, isActive: !item.isActive, updatedAt: Date.now() } : item
    );
    handleSaveKnowledge(newItems);
  };

  // Models Handlers
  const handleUpdateModel = (id: string, updated: Partial<AIModelConfig>) => {
    const newModels = models.map((m) => (m.id === id ? { ...m, ...updated } : m));
    setModels(newModels);
    StorageService.saveModels(newModels);
  };

  const handleAddModel = (newModel: Omit<AIModelConfig, 'id'>) => {
    const created: AIModelConfig = {
      ...newModel,
      id: 'custom_' + Date.now()
    };
    const newModels = [created, ...models];
    setModels(newModels);
    StorageService.saveModels(newModels);
  };

  const handleDeleteModel = (id: string) => {
    if (models.length <= 1) {
      alert('حداقل یک مدل هوش مصنوعی باید در لیست باقی بماند.');
      return;
    }
    const newModels = models.filter((m) => m.id !== id);
    // If we deleted the default model, make the first available verified or first active model default
    if (models.find((m) => m.id === id)?.isDefault && newModels.length > 0) {
      newModels[0].isDefault = true;
      newModels[0].isActive = true;
    }
    setModels(newModels);
    StorageService.saveModels(newModels);
  };

  const handleSetDefaultModel = (id: string) => {
    const newModels = models.map((m) => ({
      ...m,
      isDefault: m.id === id,
      isActive: m.id === id ? true : m.isActive,
    }));
    setModels(newModels);
    StorageService.saveModels(newModels);
  };

  // Settings Handlers
  const handleUpdateSettings = (newSettings: UserSettings) => {
    setSettings(newSettings);
    StorageService.saveSettings(newSettings);
  };

  const handleResetSettings = () => {
    localStorage.removeItem('trademind_user_settings_v1');
    const defaultSettings = StorageService.getSettings();
    setSettings(defaultSettings);
  };

  // Chat Handlers
  const handleNewChat = () => {
    const newId = 'chat_' + Date.now();
    const updatedChats = { ...chats, [newId]: [] };
    setChats(updatedChats);
    setCurrentChatId(newId);
    StorageService.saveChats(updatedChats);
  };

  const handleDeleteChat = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updatedChats = { ...chats };
    delete updatedChats[id];
    
    const remainingIds = Object.keys(updatedChats);
    if (remainingIds.length === 0) {
      const newId = 'chat_' + Date.now();
      updatedChats[newId] = [];
      setCurrentChatId(newId);
    } else if (currentChatId === id) {
      setCurrentChatId(remainingIds[remainingIds.length - 1]);
    }

    setChats(updatedChats);
    StorageService.saveChats(updatedChats);
  };

  const handleClearCurrentChat = () => {
    if (!currentChatId) return;
    const updatedChats = { ...chats, [currentChatId]: [] };
    setChats(updatedChats);
    StorageService.saveChats(updatedChats);
  };

  // Active items
  const activeKnowledgeItems = knowledge.filter((item) => item.isActive);
  const activeModel = models.find((m) => m.isDefault && m.isActive) || models.find((m) => m.isActive) || models[0];

  // Send Message to backend
  const handleSendMessage = async (text: string, images?: string[], files?: { name: string; content: string }[]) => {
    if (!currentChatId) return;

    const userMessage: Message = {
      id: 'msg_' + Date.now(),
      role: 'user',
      content: text,
      images: images,
      files: files,
      timestamp: Date.now(),
    };

    const currentMessages = chats[currentChatId] || [];
    const newMessages = [...currentMessages, userMessage];

    // Update state immediately
    const updatedChatsWithUser = { ...chats, [currentChatId]: newMessages };
    setChats(updatedChatsWithUser);
    StorageService.saveChats(updatedChatsWithUser);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages,
          modelConfig: activeModel,
          activeKnowledge: activeKnowledgeItems,
          settings: settings
        })
      });

      const data = await response.json();
      
      const assistantMessage: Message = {
        id: 'msg_' + (Date.now() + 1),
        role: 'assistant',
        content: data.reply || data.error || 'پاسخی از موتور هوش مصنوعی دریافت نشد.',
        timestamp: Date.now(),
        modelUsed: data.modelUsed || activeModel?.name.split('(')[0] || 'AI Engine',
        provider: data.provider || activeModel?.provider || 'gemini',
      };

      const finalMessages = [...newMessages, assistantMessage];
      const updatedChatsWithAI = { ...chats, [currentChatId]: finalMessages };
      setChats(updatedChatsWithAI);
      StorageService.saveChats(updatedChatsWithAI);

    } catch (error: any) {
      console.error('Error sending message:', error);
      
      const errorMessage: Message = {
        id: 'msg_err_' + Date.now(),
        role: 'assistant',
        content: `⚠️ **خطا در برقراری ارتباط با موتور تحلیلی:**\n\n\`${error.message || 'خطای شبکه یا عدم پاسخ از سرور'}\`\n\nلطفا در بخش «مدل‌های هوش مصنوعی» صحت اتصال و کلید API خود را بررسی کنید.`,
        timestamp: Date.now(),
        modelUsed: 'System Error',
        provider: 'System'
      };

      const finalMessages = [...newMessages, errorMessage];
      const updatedChatsWithErr = { ...chats, [currentChatId]: finalMessages };
      setChats(updatedChatsWithErr);
      StorageService.saveChats(updatedChatsWithErr);
    } finally {
      setIsLoading(false);
    }
  };

  const currentMessages = chats[currentChatId] || [];
  const chatIds = Object.keys(chats).reverse();

  return (
    <div 
      dir="rtl" 
      data-theme={settings.theme || 'dark-blue'} 
      data-contrast={settings.contrast || 'normal'} 
      data-accent={settings.accentColor || 'blue'} 
      className="flex h-screen w-screen bg-[#0a0f1d] text-slate-200 overflow-hidden font-sans transition-colors duration-300"
    >
      
      {/* ChatGPT Style Dark Blue Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        chatIds={chatIds}
        currentChatId={currentChatId}
        onSelectChat={(id) => {
          setCurrentChatId(id);
        }}
        onNewChat={handleNewChat}
        onDeleteChat={handleDeleteChat}
        activeKnowledgeCount={activeKnowledgeItems.length}
        activeModel={activeModel}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full min-w-0 bg-[#0a0f1d] relative overflow-hidden transition-colors duration-300">
        {activeTab === 'chat' && (
          <ChatView
            messages={currentMessages}
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
            activeModel={activeModel}
            models={models}
            onSelectModel={handleSetDefaultModel}
            activeKnowledge={activeKnowledgeItems}
            onClearChat={handleClearCurrentChat}
            onNavigateToKnowledge={() => setActiveTab('knowledge')}
            onNavigateToModels={() => setActiveTab('models')}
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
          />
        )}

        {(activeTab === 'settings' || activeTab === 'models' || activeTab === 'knowledge') && (
          <SettingsView
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
            onReset={handleResetSettings}
            models={models}
            onUpdateModel={handleUpdateModel}
            onSetDefaultModel={handleSetDefaultModel}
            onAddModel={handleAddModel}
            onDeleteModel={handleDeleteModel}
            knowledge={knowledge}
            onAddKnowledge={handleAddKnowledge}
            onUpdateKnowledge={handleUpdateKnowledge}
            onDeleteKnowledge={handleDeleteKnowledge}
            onToggleKnowledgeActive={handleToggleKnowledgeActive}
            initialSection={activeTab === 'models' ? 'models' : activeTab === 'knowledge' ? 'data' : 'general'}
          />
        )}
      </main>

    </div>
  );
}
