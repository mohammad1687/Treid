import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Helper: Get Gemini Client
function getGeminiClient(customApiKey?: string): GoogleGenAI {
  const key = customApiKey && customApiKey.trim() !== '' ? customApiKey : process.env.GEMINI_API_KEY;
  if (!key) {
    throw new Error('کلید API جمینی یافت نشد. لطفا در بخش تنظیمات یا متغیرهای محیطی وارد کنید.');
  }
  return new GoogleGenAI({ apiKey: key });
}

// API: Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API: Test and Verify AI Provider API Key
app.post('/api/test-model', async (req, res) => {
  const { provider, apiKey, baseUrl, modelId } = req.body;
  const startTime = Date.now();

  try {
    if (provider === 'gemini') {
      try {
        const ai = getGeminiClient(apiKey);
        const response = await ai.models.generateContent({
          model: modelId || 'gemini-2.5-flash',
          contents: 'Test connection. Reply with just "OK".',
        });
        const text = response.text || 'OK';
        return res.json({
          success: true,
          message: `اتصال با موفقیت تایید شد (Gemini API Verified). پاسخ: ${text.trim()}`,
          latencyMs: Date.now() - startTime
        });
      } catch (gemErr: any) {
        return res.status(200).json({
          success: false,
          message: `خطا در بررسی کلید Gemini: ${gemErr.message || 'کلید نامعتبر است'}`
        });
      }
    } else if (provider === 'openai') {
      if (!apiKey || !apiKey.trim()) {
        return res.status(200).json({ success: false, message: 'لطفاً کلید API (OpenAI Key) را وارد کنید.' });
      }
      const resp = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: modelId || 'gpt-4o-mini',
          messages: [{ role: 'user', content: 'Say OK' }],
          max_tokens: 5
        })
      });
      if (!resp.ok) {
        const errData = await resp.text();
        return res.status(200).json({ success: false, message: `خطا در اتصال به OpenAI (${resp.status}): ${resp.statusText || 'Unauthorized / Invalid Key'}` });
      }
      return res.json({
        success: true,
        message: 'اتصال به سرورهای OpenAI با موفقیت تایید و فعال شد.',
        latencyMs: Date.now() - startTime
      });
    } else if (provider === 'anthropic') {
      if (!apiKey || !apiKey.trim()) {
        return res.status(200).json({ success: false, message: 'لطفاً کلید API (Claude/Anthropic Key) را وارد کنید.' });
      }
      const resp = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: modelId || 'claude-3-5-sonnet-20241022',
          max_tokens: 10,
          messages: [{ role: 'user', content: 'Say OK' }]
        })
      });
      if (!resp.ok) {
        const errData = await resp.text();
        return res.status(200).json({ success: false, message: `خطا در اتصال به Claude (${resp.status}): ${resp.statusText}` });
      }
      return res.json({
        success: true,
        message: 'اتصال به سرورهای Anthropic Claude با موفقیت تایید شد.',
        latencyMs: Date.now() - startTime
      });
    } else if (provider === 'deepseek') {
      if (!apiKey || !apiKey.trim()) {
        return res.status(200).json({ success: false, message: 'لطفاً کلید API (DeepSeek Key) را وارد کنید.' });
      }
      const resp = await fetch('https://api.deepseek.com/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: modelId || 'deepseek-chat',
          messages: [{ role: 'user', content: 'Say OK' }],
          max_tokens: 5
        })
      });
      if (!resp.ok) {
        const errData = await resp.text();
        return res.status(200).json({ success: false, message: `خطا در اتصال به DeepSeek (${resp.status}): ${resp.statusText}` });
      }
      return res.json({
        success: true,
        message: 'اتصال به DeepSeek API با موفقیت تایید شد.',
        latencyMs: Date.now() - startTime
      });
    } else if (provider === 'ollama') {
      const url = baseUrl || 'http://localhost:11434';
      try {
        const resp = await fetch(`${url.replace(/\/$/, '')}/api/tags`, { method: 'GET' });
        if (!resp.ok) {
          return res.status(200).json({ success: false, message: `خطا در پاسخ‌دهی سرور Ollama در آدرس ${url} (کد وضعیت: ${resp.status})` });
        }
        const data = await resp.json() as { models?: { name: string }[] };
        const modelCount = data.models ? data.models.length : 0;
        return res.json({
          success: true,
          message: `اتصال به Ollama تایید شد. (${modelCount} مدل محلی یافت شد)`,
          latencyMs: Date.now() - startTime
        });
      } catch (ollamaErr: any) {
        const isLocal = url.includes('localhost') || url.includes('127.0.0.1') || url.includes('0.0.0.0');
        const msg = isLocal
          ? `⚠️ عدم دسترسی به Ollama در localhost: توجه داشته باشید که این برنامه روی سرور ابری (Cloud Run) اجرا می‌شود و به localhost کامپیوتر شخصی شما دسترسی مستقیم ندارد. برای اتصال به Ollama روی سیستم خود، از ابزاری مانند ngrok یا Cloudflare Tunnel استفاده کرده و آدرس عمومی آن (مثلاً https://xxx.ngrok-free.app) را در Base URL وارد کنید.`
          : `خطا در اتصال به Ollama در آدرس ${url}: ${ollamaErr.message || 'عدم پاسخگویی سرور'}`;
        return res.status(200).json({
          success: false,
          message: msg
        });
      }
    } else {
      return res.status(200).json({ success: false, message: 'ارائه‌دهنده (Provider) ناشناخته است.' });
    }
  } catch (error: any) {
    console.log(`[Notice] Model verification failed for provider ${provider}: ${error.message || 'Network error'}`);
    const isLocalError = error.message?.includes('fetch failed') || error.cause?.code === 'ECONNREFUSED';
    if (provider === 'ollama' && isLocalError) {
      return res.status(200).json({
        success: false,
        message: `⚠️ عدم دسترسی به Ollama در localhost: این برنامه روی سرور ابری (Cloud Run) اجرا می‌شود و به کامپیوتر شخصی شما دسترسی ندارد. برای اتصال به Ollama محلی، از ابزارهایی مانند ngrok یا Cloudflare Tunnel استفاده کرده و آدرس عمومی آن را وارد کنید.`
      });
    }
    return res.status(200).json({
      success: false,
      message: `عدم برقراری ارتباط با سرویس‌دهنده: ${error.message || 'خطای شبکه'}`
    });
  }
});

// API: Trading Analysis Chat
app.post('/api/chat', async (req, res) => {
  const { messages, modelConfig, activeKnowledge, settings } = req.body;

  try {
    const provider = modelConfig?.provider || 'gemini';
    const apiKey = modelConfig?.apiKey;
    const modelId = modelConfig?.modelId || 'gemini-2.5-flash';
    const baseUrl = modelConfig?.baseUrl;

    // Build the system instructions from active knowledge and user settings
    const voiceToneMap: Record<string, string> = {
      'institutional': '🏦 مؤسسات مالی و وال استریت (Institutional Wall Street Tone: سنگین، بسیار تخصصی، شبیه گزارش‌های تحلیلی گلدمن ساکس و بلومبرگ)',
      'professional': '👔 حرفه‌ای و رسمی (Professional Trading Desk: دقیق، ساختاریافته و بدون حاشیه)',
      'aggressive': '⚡ اسکالپر تهاجمی و صریح (Aggressive Scalper: بسیار قاطع، سریع، بدون تعارف و مستقیماً متمرکز بر سود و حد ضرر)',
      'socratic': '🎓 مربی سقراطی و آموزشی (Socratic Mentor: همراه با توضیح دلایل روانشناسی، ارزیابی ساختار بازار و آموزش ترفندهای پرایس اکشن)',
      'friendly': '🤝 دستیار صمیمی و روان (Friendly Assistant: قابل فهم، گرم و تشویق‌کننده)'
    };

    const reasoningMap: Record<string, string> = {
      'fast': '⚡ پاسخ سریع و مستقیم (Fast Execution - خلاصه و بدون اتلاف وقت و بلافاصله ارائه نقاط ورود و خروج)',
      'detailed': '🔍 تحلیل تفصیلی استاندارد (Detailed Market Breakdown - بررسی دقیق روند و سطوح حمایت و مقاومت)',
      'deep-quant': '🧠 تحلیل کوآنت و ریاضی عمیق (Deep Quant & Math Model - ارزیابی آماری، استدلال چندلایه و بررسی نقدینگی نهنگ‌ها)',
      'step-by-step': '📐 اثبات گام‌به‌گام پرایس اکشن (Step-by-Step Proof - توضیح مرحله به مرحله کندل‌ها و سناریوهای بازار)'
    };

    const formatMap: Record<string, string> = {
      'executive-summary': '📋 خلاصه مدیریتی همراه با جدول سیگنال (Executive Summary)',
      'bullet-points': '🔹 نکات کلیدی بولت‌شده و موجز (Bullet Points)',
      'markdown': '📑 مارک‌داون تمیز و ساختاریافته (Clean Markdown)',
      'full-report': '📚 گزارش جامع همراه با سناریوهای اصلی و جایگزین (Full Report)'
    };

    const sessionMap: Record<string, string> = {
      'all': '🌍 تمامی سشن‌های جهانی ۲۴ ساعته (All Global Sessions)',
      'london': '🇬🇧 تمرکز بر سشن لندن و شکست‌های نوسانی (London Breakout & Volatility)',
      'new-york': '🇺🇸 تمرکز بر سشن نیویورک و تاثیر اخبار اقتصادی (New York Volume & News)',
      'tokyo': '🇯🇵 تمرکز بر رنج سشن توکیو و آسیا (Tokyo Asian Range)'
    };

    let systemPrompt = `شما "ProTrade AI" (تحلیل‌گر هوشمند و حرفه‌ای بازارهای مالی، کریپتوکارنسی، فارکس و سهام) هستید.
وظیفه شما ارائه دقیق‌ترین، علمی‌ترین و بدون احساسات‌ترین تحلیل‌های معاملاتی بر اساس داده‌های فعال (Knowledge Base) کاربر و اصول مدیریت سرمایه است.

--- پارامترهای شخصی‌سازی هوش مصنوعی و ترجیحات کاربر ---
1. سبک معاملاتی اصلی (Trading Style): ${settings?.tradingStyle || 'Swing Trading'}
2. حداکثر ریسک مجاز در هر معامله (Risk per Trade): ${settings?.riskPerTrade || '1%'}
3. تایم‌فریم پیش‌فرض تحلیل چارت‌ها: ${settings?.defaultTimeframe || '1H / 4H'}
4. لحن و شخصیت هوش مصنوعی (AI Voice Tone): ${voiceToneMap[settings?.aiVoiceTone || 'institutional'] || voiceToneMap['institutional']}
5. عمق استدلال و تفکر منطقی (Reasoning Depth): ${reasoningMap[settings?.aiReasoningDepth || 'detailed'] || reasoningMap['detailed']}
6. حساسیت تشخیص الگو در چارت‌ها: ${settings?.chartAnalysisSensitivity === 'low' ? 'حساسیت پایین (فقط سطوح ماژور کلان)' : settings?.chartAnalysisSensitivity === 'medium' ? 'حساسیت متوسط' : 'حساسیت بالا (اسکن تمام سطوح ماژور و مینور)'}
7. فرمت ساختاری خروجی: ${formatMap[settings?.responseFormat || 'executive-summary'] || formatMap['executive-summary']}
8. تمرکز زمانی بر سشن معاملاتی: ${sessionMap[settings?.tradingSessionFocus || 'all'] || sessionMap['all']}
9. زبان پاسخ‌گویی: ${settings?.language === 'en' ? 'English (Professional Institutional Tone)' : 'فارسی (روان، حرفه‌ای، دقیق همراه با اصطلاحات انگلیسی تخصصی)'}
10. دستورات اختصاصی کاربر (Persona/Instructions): ${settings?.systemPrompt || 'تحلیل همراه با بررسی ساختار بازار (Market Structure)، ارزیابی ریسک به ریوارد (R/R)، تعیین حد ضرر (Stop Loss) و اهداف سود (Take Profit).'}

--- پایگاه داده فعال کاربر (Active Knowledge Base / استراتژی‌های اختصاصی کاربر) ---
`;

    if (!activeKnowledge || activeKnowledge.length === 0) {
      systemPrompt += `[هیچ داده یا استراتژی اختصاصی فعال توسط کاربر در بخش داده‌ها انتخاب نشده است. تحلیل بر اساس دانش پرایس اکشن، 스마트 مانی و تحلیل تکنیکال استاندارد انجام شود.]\n`;
    } else {
      systemPrompt += `توجه بسیار مهم: شما باید حتماً و دقیقاً بر اساس قوانین، نکات تحلیلی و استراتژی‌های فعال زیر که کاربر آپلود و فعال کرده است، تحلیل خود را انجام دهید:\n\n`;
      activeKnowledge.forEach((item: any, idx: number) => {
        systemPrompt += `--- [سند شماره ${idx + 1}: ${item.title} (دسته: ${item.category})] ---\n${item.content || '(محتوای متنی ندارد - فایل/تصویر پیوست شده در پایگاه داده)'}\n\n`;
      });
    }

    systemPrompt += `\n--- ساختار خروجی مورد انتظار (مطابق فرمت انتخاب شده کاربر) ---
1. خلاصه وضعیت چارت / جفت‌ارز (Trend & Market Structure)
2. تحلیل تکنیکال بر اساس داده‌های فعال کاربر (سندهای فعال پایگاه داده)
3. سطوح کلیدی: حمایت‌ها (Support)، مقاومت‌ها (Resistance) و نواحی نقدینگی (Liquidity Zones)
4. سناریوی معاملاتی پیشنهادی (ترید ست‌اپ همراه با Entry, Stop Loss, Take Profit و محاسبه R:R بر اساس ریسک ${settings?.riskPerTrade || '1%'})`;

    if (settings?.enableRiskWarnings !== false) {
      systemPrompt += `\n5. هشدار مدیریت ریسک: در صورت مشاهده اهرم‌های بالا یا نزدیکی قیمت به نواحی خطرناک، حتماً یک بلوک مشخص با عنوان «⚠️ هشدار ریسک و مدیریت سرمایه» درج شود.`;
    }

    if (settings?.enableAutoSuggestions !== false) {
      systemPrompt += `\n6. پیشنهادات هوشمند بعدی (مهم): در انتهای پاسخ خود، حتماً بخشی با عنوان دقیق «💡 پیشنهادات هوشمند بعدی:» ایجاد کرده و زیر آن دقیقاً ۳ سوال یا اقدام پیشنهادی (به صورت بولت پوینت ۱. ۲. ۳.) برای ادامه بررسی و تحلیل بازار پیشنهاد دهید تا کاربر بتواند با کلیک روی آنها تحلیل را عمیق‌تر کند.`;
    }

    // Get the latest user message
    const latestMsg = messages[messages.length - 1];
    const userText = latestMsg.content || 'لطفا این وضعیت یا چارت را تحلیل کنید.';
    const images: string[] = latestMsg.images || [];

    // Check provider execution
    if (provider === 'gemini' || !provider) {
      try {
        const ai = getGeminiClient(apiKey);
        const parts: any[] = [];
        
        // Add images if any (e.g. chart screenshot analysis)
        for (const imgBase64 of images) {
          const match = imgBase64.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
          if (match) {
            parts.push({
              inlineData: {
                mimeType: match[1],
                data: match[2]
              }
            });
          }
        }
        
        parts.push({ text: userText });

        const response = await ai.models.generateContent({
          model: modelId?.startsWith('gemini') ? modelId : 'gemini-2.5-flash',
          contents: parts,
          config: {
            systemInstruction: systemPrompt,
            temperature: 0.2,
          }
        });

        return res.json({
          success: true,
          reply: response.text || 'پاسخی از مدل دریافت نشد.',
          modelUsed: modelId || 'gemini-2.5-flash',
          provider: 'Google Gemini'
        });
      } catch (geminiErr: any) {
        console.log(`[Notice] Gemini execution with custom key failed, falling back to server default key: ${geminiErr?.message}`);
        if (apiKey && apiKey.trim() !== '') {
          try {
            const aiDefault = getGeminiClient();
            const responseDefault = await aiDefault.models.generateContent({
              model: 'gemini-2.5-flash',
              contents: `${systemPrompt}\n\nکاربر: ${userText}`,
            });
            return res.json({
              success: true,
              reply: `> 💡 *توجه: تحلیل از طریق کلید پیش‌فرض سرور ابری پردازش شد (کلید شخصی وارد شده تایید نشد یا با محدودیت مواجه شد).* \n\n` + (responseDefault.text || ''),
              modelUsed: 'gemini-2.5-flash (Default Key)',
              provider: 'Google Gemini'
            });
          } catch (defaultErr) {
            throw geminiErr;
          }
        }
        throw geminiErr;
      }
    } else if (provider === 'openai' || provider === 'anthropic' || provider === 'deepseek' || provider === 'ollama') {
      try {
        let replyText = '';
        if (provider === 'openai') {
          if (!apiKey || !apiKey.trim()) {
            throw new Error('کلید API (OpenAI Key) وارد نشده است.');
          }
          const formattedMessages = [
            { role: 'system', content: systemPrompt },
            ...messages.slice(-5).map((m: any) => ({
              role: m.role === 'user' ? 'user' : 'assistant',
              content: m.content
            }))
          ];
          const resp = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
              model: modelId || 'gpt-4o',
              messages: formattedMessages,
              temperature: 0.2
            })
          });
          if (!resp.ok) {
            const errText = await resp.text();
            throw new Error(`خطای سرور OpenAI (${resp.status}): ${resp.statusText}`);
          }
          const data = await resp.json() as any;
          replyText = data.choices?.[0]?.message?.content;
        } else if (provider === 'ollama') {
          const url = baseUrl || 'http://localhost:11434';
          const resp = await fetch(`${url.replace(/\/$/, '')}/api/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              model: modelId || 'llama3',
              messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userText }
              ],
              stream: false
            })
          });
          const data = await resp.json() as any;
          replyText = data.message?.content;
        } else if (provider === 'deepseek') {
          if (!apiKey || !apiKey.trim()) {
            throw new Error('کلید API وارد نشده است.');
          }
          const resp = await fetch('https://api.deepseek.com/chat/completions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
            body: JSON.stringify({
              model: modelId || 'deepseek-chat',
              messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userText }
              ]
            })
          });
          const data = await resp.json() as any;
          replyText = data.choices?.[0]?.message?.content;
        } else if (provider === 'anthropic') {
          if (!apiKey || !apiKey.trim()) {
            throw new Error('کلید API وارد نشده است.');
          }
          const resp = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey!, 'anthropic-version': '2023-06-01' },
            body: JSON.stringify({
              model: modelId || 'claude-3-5-sonnet-20241022',
              max_tokens: 2000,
              system: systemPrompt,
              messages: [{ role: 'user', content: userText }]
            })
          });
          const data = await resp.json() as any;
          replyText = data.content?.[0]?.text;
        }

        if (replyText) {
          return res.json({
            success: true,
            reply: replyText,
            modelUsed: modelId,
            provider: provider.toUpperCase()
          });
        }
      } catch (err: any) {
        console.log(`[Notice] Fallback to Gemini after error in provider ${provider}: ${err?.message || 'unreachable'}`);
      }

      // Automatic high-speed Gemini fallback with note
      const ai = getGeminiClient();
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `${systemPrompt}\n\nکاربر: ${userText}`,
      });
      return res.json({
        success: true,
        reply: `> 💡 *توجه: تحلیل توسط موتور پشتیبان پرسرعت (Google Gemini 2.5 Flash) انجام شد (به دلیل عدم پاسخ، محدودیت یا نیاز به تنظیم کلید API در سرور ${provider.toUpperCase()}).* \n\n` + (response.text || ''),
        modelUsed: 'gemini-2.5-flash (Fallback)',
        provider: 'Google Gemini'
      });
    } else {
      throw new Error('مدل انتخاب شده معتبر نیست.');
    }
  } catch (error: any) {
    console.log(`[Error Notice] Chat endpoint error: ${error?.message || 'Processing error'}`);
    return res.status(200).json({
      success: false,
      error: `⚠️ **ارتباط با سرویس‌دهنده هوش مصنوعی برقرار نشد:**\n\n\`${error.message || 'خطا در شبکه یا سرور'}\`\n\n💡 **راهنمای سریع:**\n۱. در بخش **«مدل‌های هوش مصنوعی»** می‌توانید مدل پیش‌فرض **Google Gemini 2.5 Flash / Pro** را به عنوان مدل فعال انتخاب کنید (بدون نیاز به کلید شخصی).\n۲. در صورت استفاده از مدل‌های OpenAI یا Claude، از صحت کلید API و دسترسی به سرور اطمینان حاصل کنید.`
    });
  }
});

// Vite middleware setup
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 ProTrade AI Server running on http://localhost:${PORT}`);
  });
}

startServer();
