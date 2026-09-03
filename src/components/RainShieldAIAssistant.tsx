import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Send,
  Bot,
  User,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Database,
  Cpu,
  Layers,
  HelpCircle,
  Clock,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';
import { useRainShield } from '../context/RainShieldContext';

export const RainShieldAIAssistant: React.FC = () => {
  const {
    aiMessages,
    isAITyping,
    sendAIMessage,
    selectedLocation,
    currentTimeStep,
    dataMode,
  } = useRainShield();

  const [inputQuery, setInputQuery] = useState('');
  const [expandedTraceId, setExpandedTraceId] = useState<string | null>(null);
  const [expandedEvidenceId, setExpandedEvidenceId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const suggestedPrompts = [
    'Which areas are most at risk?',
    'Why is Bellandur zone high risk?',
    'When will rainfall peak?',
    'Which roads may be affected?',
    'Which critical facilities should be monitored?',
    'Summarize the current situation.',
  ];

  const handleSend = async (textToSend?: string) => {
    const q = textToSend || inputQuery;
    if (!q.trim() || isAITyping) return;
    setInputQuery('');
    await sendAIMessage(q);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [aiMessages, isAITyping]);

  return (
    <div className="flex flex-col h-full bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
      {/* Header */}
      <div className="px-4 py-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between shrink-0 text-white">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-emerald-500 flex items-center justify-center font-bold shadow-sm">
            <Bot className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="font-bold text-xs text-white font-sans flex items-center gap-2">
              <span>RainShield AI Assistant</span>
              <span className="text-[10px] bg-slate-800 text-emerald-400 px-1.5 py-0.2 rounded border border-slate-700 font-mono font-bold">
                GEO-LLM v1.8
              </span>
            </div>
            <div className="text-[10px] text-slate-400">
              Grounded Decision Support • Live Telemetry
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-[10px] font-mono text-emerald-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
          <ShieldCheck className="w-3 h-3 text-emerald-400" />
          <span>{dataMode} DATA</span>
        </div>
      </div>

      {/* Suggested Quick Prompt Chips */}
      <div className="p-2.5 bg-slate-50 border-b border-slate-200 overflow-x-auto no-scrollbar flex items-center gap-1.5 shrink-0">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider shrink-0 pl-1 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-emerald-600" /> Suggested:
        </span>
        {suggestedPrompts.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(prompt)}
            disabled={isAITyping}
            className="text-xs px-3 py-1 rounded-full bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 border border-slate-200 hover:border-emerald-300 whitespace-nowrap transition-colors disabled:opacity-50 shrink-0 font-medium shadow-xs"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
        {aiMessages.map(msg => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div className="flex items-center gap-1.5 mb-1 px-1 text-[10px] text-slate-400 font-medium">
              {msg.sender === 'user' ? (
                <>
                  <span>Incident Commander</span>
                  <User className="w-3 h-3 text-slate-400" />
                </>
              ) : (
                <>
                  <Bot className="w-3 h-3 text-emerald-600" />
                  <span className="font-semibold text-slate-700">RainShield Agent</span>
                  <span>•</span>
                  <span>{msg.timestamp}</span>
                </>
              )}
            </div>

            <div
              className={`p-3.5 rounded-xl max-w-[92%] leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-slate-900 text-white rounded-tr-none shadow-sm'
                  : 'bg-slate-50 border border-slate-200 text-slate-800 rounded-tl-none shadow-xs'
              }`}
            >
              <div className="whitespace-pre-wrap font-sans text-xs space-y-2">
                {msg.text.split('\n\n').map((para, i) => (
                  <p key={i} className="leading-normal">
                    {para}
                  </p>
                ))}
              </div>

              {/* Collapsible Agent Execution Trace */}
              {msg.executionTrace && msg.executionTrace.length > 0 && (
                <div className="mt-3 pt-2.5 border-t border-slate-200">
                  <button
                    onClick={() => setExpandedTraceId(expandedTraceId === msg.id ? null : msg.id)}
                    className="w-full flex items-center justify-between text-[11px] font-semibold text-slate-700 hover:text-slate-900 bg-white px-2.5 py-1.5 rounded border border-slate-200 transition-colors shadow-xs"
                  >
                    <div className="flex items-center gap-1.5">
                      <Cpu className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Analysis Workflow Trace ({msg.executionTrace.length} Steps)</span>
                    </div>
                    {expandedTraceId === msg.id ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
                  </button>

                  {expandedTraceId === msg.id && (
                    <div className="mt-2 p-2.5 bg-white rounded-lg border border-slate-200 space-y-2 text-[10px] font-mono">
                      {msg.executionTrace.map(step => (
                        <div key={step.stepId} className="flex items-start gap-2 text-slate-700">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                          <div className="flex-1">
                            <div className="flex items-center justify-between gap-1">
                              <span className="font-bold text-slate-900">{step.name}</span>
                              <span className="text-emerald-600 text-[9px] font-semibold">{step.durationMs}ms</span>
                            </div>
                            <div className="text-slate-500 text-[10px]">
                              Tool: <span className="text-slate-700 font-semibold">{step.tool}</span> • Source: {step.dataSource}
                            </div>
                            {step.resultSummary && (
                              <div className="text-slate-500 mt-0.5 italic">{step.resultSummary}</div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Evidence Lineage Panel */}
              {msg.evidence && (
                <div className="mt-2 pt-2 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-500">
                  <div className="flex items-center gap-1 font-medium">
                    <Database className="w-3 h-3 text-emerald-600" />
                    <span>Mode: <strong className="text-slate-800">{msg.evidence.mode}</strong></span>
                  </div>
                  <button
                    onClick={() => setExpandedEvidenceId(expandedEvidenceId === msg.id ? null : msg.id)}
                    className="text-emerald-700 font-semibold hover:underline flex items-center gap-0.5"
                  >
                    <span>{expandedEvidenceId === msg.id ? 'Hide Evidence' : 'Inspect Evidence'}</span>
                  </button>
                </div>
              )}

              {expandedEvidenceId === msg.id && msg.evidence && (
                <div className="mt-2 p-2 bg-white rounded border border-slate-200 text-[10px] space-y-1">
                  <div className="font-bold text-slate-900">Data Lineage & Grounding:</div>
                  <div className="text-slate-600">• Model: {msg.evidence.model}</div>
                  <div className="text-slate-600">• Sources: {msg.evidence.sources.join(', ')}</div>
                  {msg.evidence.keyMetrics && (
                    <div className="pt-1 border-t border-slate-100 text-slate-700">
                      {Object.entries(msg.evidence.keyMetrics).map(([k, v]) => (
                        <div key={k} className="flex justify-between">
                          <span className="text-slate-500">{k}:</span>
                          <span className="font-bold text-slate-800">{v}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}

        {isAITyping && (
          <div className="flex items-start gap-2 text-slate-600 text-xs p-3 bg-slate-50 rounded-xl border border-slate-200 max-w-[85%]">
            <Bot className="w-4 h-4 text-emerald-600 animate-spin shrink-0 mt-0.5" />
            <div className="flex items-center gap-1.5">
              <span>Agent invoking tools & querying GIS state...</span>
              <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Box */}
      <div className="p-3 bg-slate-50 border-t border-slate-200 shrink-0">
        <form
          onSubmit={e => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputQuery}
            onChange={e => setInputQuery(e.target.value)}
            placeholder={`Ask RainShield about ${selectedLocation.name} (${currentTimeStep})...`}
            disabled={isAITyping}
            className="flex-1 px-3.5 py-2 rounded-lg bg-white border border-slate-200 focus:border-emerald-500 focus:outline-none text-xs text-slate-900 placeholder:text-slate-400 font-sans shadow-xs"
          />
          <button
            type="submit"
            disabled={!inputQuery.trim() || isAITyping}
            className="p-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-colors disabled:opacity-40 shadow-sm"
            title="Submit Query to Agent"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
        <div className="mt-1.5 flex items-center justify-between text-[10px] text-slate-400">
          <span>Target: {selectedLocation.name}</span>
          <span>Answers grounded in active simulation</span>
        </div>
      </div>
    </div>
  );
};
