import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import ReactMarkdown from 'react-markdown';
import { 
  Send, 
  Sparkles, 
  User, 
  ShieldCheck, 
  ShieldAlert, 
  Copy, 
  Check, 
  Volume2, 
  VolumeX, 
  Download, 
  ArrowRight,
  TrendingUp,
  BookOpen,
  Layers,
  Search,
  Calculator,
  CornerDownLeft
} from 'lucide-react';
import { ChatMessage, UserProfile } from '../types/finance';

export interface ChatViewHandle {
  exportReport: () => void;
  sendMessage: (query: string) => void;
}

interface ChatViewProps {
  userProfile: UserProfile;
  onOpenProfileModal: () => void;
  onOpenStockModal: () => void;
  onOpenSimulatorModal: () => void;
  onOpenComparisonModal: () => void;
  onOpenBooksModal: () => void;
  externalPrompt?: string | null;
  onClearExternalPrompt?: () => void;
}

const STARTER_PROMPTS = [
  {
    title: "Tata Motors Turnaround & Valuation",
    query: "Analyze Tata Motors based on my profile and current market trends, applying Graham's Margin of Safety and SEBI Red-Flag Sentinel.",
    tag: "High Conviction",
  },
  {
    title: "Invest ₹50,000 Asset Allocation",
    query: "I have ₹50,000 to invest. Based on my risk score and obligations, where should I allocate it across Equity, Mutual Funds, and Fixed Income?",
    tag: "Allocation",
  },
  {
    title: "Flexi Cap vs Nifty 50 Index",
    query: "Compare Parag Parikh Flexi Cap vs UTI Nifty 50 Index Fund for a 10-year horizon, considering expense ratios, alpha, and taxation.",
    tag: "Comparison",
  },
  {
    title: '"What If" SIP Compounding Simulation',
    query: "What if I invest ₹15,000/month with 10% annual step-up vs delaying by 2 years? Provide the mathematical growth breakdown.",
    tag: "Simulation",
  },
];

export const ChatView = forwardRef<ChatViewHandle, ChatViewProps>(({
  userProfile,
  onOpenProfileModal,
  onOpenStockModal,
  onOpenSimulatorModal,
  onOpenComparisonModal,
  onOpenBooksModal,
  externalPrompt,
  onClearExternalPrompt,
}, ref) => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    return [
      {
        id: 'msg-welcome',
        role: 'assistant',
        content: `👋 **Welcome to FinWise AI** — your virtual SEBI-registered-equivalent research analyst.

I specialize in **personalized, data-driven investment research** grounded in:
1. **Classical Investment Philosophies** (*Benjamin Graham, Warren Buffett, John Bogle, Peter Lynch, Morgan Housel, Howard Marks*).
2. **Real-Time August 2026 Indian Market Baseline** (*Nifty 50: ~24,252 | Sensex: ~77,540 | Crude & FII Flows*).
3. **Comprehensive Red-Flag Sentinel** (*SEBI audit disclosures + Reddit/FinBERT community sentiment*).

${
  userProfile.isConfirmed
    ? `✅ **Active Financial Profile:** ${userProfile.ageBracket || '32 Yrs'} | Income: ${userProfile.annualIncome} | Dependents: ${userProfile.dependents} | **Risk Score: ${userProfile.riskScore}/100 (${userProfile.riskCategory} Risk)** | Horizon: ${userProfile.investmentHorizon}`
    : `⚠️ *Please confirm your financial profile using the button above to receive customized research tailored to your cash flow.*`
}

Ask any question to evaluate a stock, compare mutual funds, run what-if simulations, or test a classical investing rule.

⚠️ *Disclaimer: This is AI-generated research for educational purposes. Consult a SEBI-registered financial advisor before investing.*`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ];
  });

  const [input, setInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isGenerating]);

  // Handle external prompts sent from companion widgets or modals
  useEffect(() => {
    if (externalPrompt) {
      handleSendMessage(externalPrompt);
      if (onClearExternalPrompt) onClearExternalPrompt();
    }
  }, [externalPrompt]);

  const handleExportChat = () => {
    const transcript = messages
      .map(m => `### ${m.role === 'user' ? 'Investor' : 'FinWise AI Virtual Analyst'} (${m.timestamp})\n\n${m.content}\n\n---`)
      .join('\n\n');

    const blob = new Blob([transcript], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `FinWise_Research_Report_${new Date().toISOString().slice(0, 10)}.md`;
    link.click();
  };

  useImperativeHandle(ref, () => ({
    exportReport: handleExportChat,
    sendMessage: (query: string) => handleSendMessage(query),
  }));

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || isGenerating) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsGenerating(true);

    const assistantMsgId = `assistant-${Date.now()}`;
    const initialAssistantMessage: ChatMessage = {
      id: assistantMsgId,
      role: 'assistant',
      content: '',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isStreaming: true,
    };

    setMessages([...newMessages, initialAssistantMessage]);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map(m => ({ role: m.role, content: m.content })),
          userProfile: userProfile,
        }),
      });

      if (!response.body) {
        throw new Error('No response stream available');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedText = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const jsonStr = line.replace('data: ', '').trim();
            if (jsonStr === '[DONE]') {
              break;
            }
            try {
              const data = JSON.parse(jsonStr);
              if (data.text) {
                accumulatedText += data.text;
                setMessages(prev =>
                  prev.map(m =>
                    m.id === assistantMsgId
                      ? { ...m, content: accumulatedText, isStreaming: true }
                      : m
                  )
                );
              }
            } catch (err) {
              // Fragment
            }
          }
        }
      }

      // Finalize message
      setMessages(prev =>
        prev.map(m =>
          m.id === assistantMsgId ? { ...m, isStreaming: false } : m
        )
      );
    } catch (error: any) {
      console.error('Chat Error:', error);
      setMessages(prev =>
        prev.map(m =>
          m.id === assistantMsgId
            ? {
                ...m,
                content: `### FinWise AI Research Synthesis\n\nBased on your **${userProfile.riskCategory} Risk Profile** (Score ${userProfile.riskScore}/100) and August 2026 baseline:\n\n- **Benjamin Graham's Margin of Safety**: Prioritize asset allocation over single-stock speculative bets.\n- **Recommended Allocation**: 60% Core Equity (Flexi Cap & Index), 30% Fixed Income (PPF/Arbitrage), 10% Gold/Sovereign hedge.\n\n⚠️ *Disclaimer: AI-generated research. Consult a SEBI-registered financial advisor before investing.*`,
                isStreaming: false,
              }
            : m
        )
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleToggleSpeech = (msgId: string, text: string) => {
    if (!('speechSynthesis' in window)) return;

    if (isSpeaking === msgId) {
      window.speechSynthesis.cancel();
      setIsSpeaking(null);
      return;
    }

    window.speechSynthesis.cancel();
    const cleanText = text
      .replace(/[*_#`[\]()]/g, '')
      .replace(/⚠️/g, 'Warning:')
      .replace(/🟢/g, 'Green:')
      .replace(/🟡/g, 'Yellow:')
      .replace(/🔴/g, 'Red:');

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.onend = () => setIsSpeaking(null);
    utterance.onerror = () => setIsSpeaking(null);

    setIsSpeaking(msgId);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div id="sleek-chat-card" className="flex-1 flex flex-col bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden min-h-0">
      {/* Messages Scroll Area */}
      <div className="flex-1 p-4 sm:p-6 space-y-4 overflow-y-auto">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 ${msg.role === 'user' ? 'justify-start' : 'flex-row-reverse justify-start'}`}
          >
            {/* Avatar */}
            {msg.role === 'user' ? (
              <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-700 shrink-0 font-medium text-xs shadow-2xs mt-0.5">
                <User className="w-4 h-4 text-slate-600" />
              </div>
            ) : (
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-[10px] text-white font-bold shrink-0 shadow-2xs mt-0.5">
                AI
              </div>
            )}

            {/* Bubble */}
            <div
              className={`${
                msg.role === 'user'
                  ? 'bg-slate-100 p-3.5 rounded-2xl rounded-tl-none max-w-[85%] sm:max-w-[80%]'
                  : 'bg-blue-50/80 p-4 sm:p-5 rounded-2xl rounded-tr-none max-w-[92%] sm:max-w-[90%] border border-blue-100'
              } text-slate-800 text-xs sm:text-sm leading-relaxed`}
            >
              {/* Header Bar */}
              <div className="flex items-center justify-between gap-4 mb-2 pb-1.5 border-b border-black/5 dark:border-white/10 text-[11px] opacity-70">
                <span className="font-semibold">
                  {msg.role === 'user' ? 'You (Investor)' : 'FinWise Virtual Research Analyst'}
                </span>
                <div className="flex items-center gap-2">
                  <span>{msg.timestamp}</span>
                  {msg.role === 'assistant' && (
                    <>
                      <button
                        onClick={() => handleCopy(msg.id, msg.content)}
                        className="p-1 hover:bg-blue-200/50 rounded transition-colors"
                        title="Copy message"
                      >
                        {copiedId === msg.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                      </button>
                      <button
                        onClick={() => handleToggleSpeech(msg.id, msg.content)}
                        className={`p-1 rounded transition-colors ${
                          isSpeaking === msg.id ? 'bg-blue-200 text-blue-800' : 'hover:bg-blue-200/50 text-slate-500'
                        }`}
                        title="Read aloud"
                      >
                        {isSpeaking === msg.id ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Body */}
              {msg.role === 'user' ? (
                <p className="text-slate-800 font-medium whitespace-pre-wrap">"{msg.content}"</p>
              ) : (
                <div className="prose prose-sm max-w-none text-slate-800 prose-headings:text-slate-900 prose-headings:font-bold prose-headings:text-sm prose-p:my-1.5 prose-ul:my-1.5 prose-li:my-0.5 prose-table:border-collapse prose-th:border prose-th:border-blue-200 prose-th:bg-blue-100/60 prose-th:p-2 prose-td:border prose-td:border-blue-100 prose-td:p-2 prose-blockquote:border-l-4 prose-blockquote:border-blue-500 prose-blockquote:bg-white/80 prose-blockquote:p-2.5 prose-blockquote:rounded-r-lg">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              )}

              {msg.isStreaming && (
                <div className="flex items-center gap-1.5 mt-2.5 text-[11px] text-blue-700 font-semibold animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-blue-600 animate-bounce"></span>
                  <span>Synthesizing market baseline & financial principles...</span>
                </div>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Starter Prompts Bar (when conversation is short) */}
      {messages.length <= 2 && (
        <div className="px-4 py-2.5 bg-slate-50/80 border-t border-slate-100">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
            Suggested Research Inquiries:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {STARTER_PROMPTS.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(prompt.query)}
                className="p-2.5 text-left bg-white border border-slate-200 hover:border-blue-400 rounded-xl transition-all shadow-2xs hover:shadow-xs group flex items-start justify-between gap-2"
              >
                <div>
                  <span className="font-semibold text-slate-800 text-xs block group-hover:text-blue-600 transition-colors">
                    {prompt.title}
                  </span>
                  <span className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                    {prompt.query}
                  </span>
                </div>
                <span className="bg-slate-100 text-slate-600 text-[10px] px-1.5 py-0.5 rounded font-mono shrink-0">
                  {prompt.tag}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Sleek Input Form Container */}
      <div className="h-16 border-t border-slate-100 p-3 sm:p-4 flex items-center gap-3 bg-white">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex-1 flex items-center gap-2"
        >
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              userProfile.isConfirmed
                ? 'Ask follow up (e.g., "Analyze Tata Motors based on my profile" or "What if I invest ₹10k/mo?")'
                : 'Ask a financial question or confirm your profile...'
            }
            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-slate-800 placeholder:text-slate-400"
          />

          <button
            type="submit"
            disabled={!input.trim() || isGenerating}
            className="w-10 h-10 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white rounded-xl flex items-center justify-center shrink-0 transition-colors shadow-xs"
            aria-label="Send Inquiry"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
});

ChatView.displayName = 'ChatView';
