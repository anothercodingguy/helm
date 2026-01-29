import React, { useState, useRef, useEffect } from 'react';
import { useChatStore } from '@/store/chatStore';
import { Terminal, Send, Activity, Clock, ChevronRight } from 'lucide-react';

export default function CommandCenter() {
    const { logs, sendMessage, isLoading } = useChatStore();
    const [input, setInput] = useState('');
    const endRef = useRef<HTMLDivElement>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        await sendMessage(input);
        setInput('');
    };

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [logs]);

    return (
        <div className="flex flex-col h-full bg-zinc-950 border-r border-zinc-800 w-full">
            {/* Header */}
            <div className="px-4 py-3 border-b border-zinc-900 flex items-center justify-between bg-zinc-950">
                <div className="flex items-center gap-2 text-zinc-100 font-semibold tracking-tight">
                    <div className="p-1 bg-emerald-500/10 rounded border border-emerald-500/20">
                        <Terminal size={14} className="text-emerald-500" />
                    </div>
                    <span className="text-sm">MISSION LOG</span>
                </div>
                {isLoading && (
                    <div className="flex items-center gap-1.5 text-[10px] font-medium text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full animate-pulse border border-emerald-500/20">
                        <Activity size={10} />
                        <span>RUNNING</span>
                    </div>
                )}
            </div>

            {/* Logs Stream */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 font-mono text-xs scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
                {logs.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-32 gap-3 opacity-30">
                        <Terminal size={24} />
                        <span>Ready for assignment...</span>
                    </div>
                )}
                {logs.map((log, i) => (
                    <div key={i} className="flex gap-3 group animate-in fade-in slide-in-from-left-2 duration-300">
                        <div className="mt-0.5 min-w-[2px] w-[2px] h-auto self-stretch bg-zinc-800 group-last:bg-emerald-500/50" />
                        <div className="flex-1 space-y-1 pb-2">
                            <div className="flex items-start justify-between gap-2">
                                <span className="text-zinc-300 leading-snug break-words">{log.content}</span>
                                <span className="text-[9px] text-zinc-600 flex-shrink-0 flex items-center gap-1 mt-0.5 font-sans">
                                    {new Date(log.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                </span>
                            </div>
                            {log.details && (
                                <details className="mt-1 group/details">
                                    <summary className="text-[9px] text-zinc-500 hover:text-zinc-300 cursor-pointer list-none flex items-center gap-1 select-none">
                                        <ChevronRight size={10} className="transition-transform group-open/details:rotate-90" />
                                        <span>View properties</span>
                                    </summary>
                                    <div className="mt-1 ml-2 text-[10px] text-zinc-400 bg-zinc-900 p-2 rounded border border-zinc-800 font-mono overflow-x-auto whitespace-pre-wrap">
                                        {log.details}
                                    </div>
                                </details>
                            )}
                        </div>
                    </div>
                ))}
                <div ref={endRef} />
            </div>

            {/* Task Input */}
            <div className="p-3 border-t border-zinc-900 bg-zinc-950 pb-5">
                <form onSubmit={handleSubmit} className="relative group">
                    <div className="absolute left-3 top-3 text-zinc-600">
                        <ChevronRight size={16} />
                    </div>
                    <input
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        placeholder="Assign task..."
                        disabled={isLoading}
                        className="w-full bg-black border border-zinc-800 text-zinc-100 py-2.5 pl-9 pr-12 rounded-lg text-sm focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all outline-none placeholder:text-zinc-700 disabled:opacity-50"
                    />
                    <button
                        type="submit"
                        disabled={isLoading || !input.trim()}
                        className="absolute right-2 top-1.5 bottom-1.5 aspect-square flex items-center justify-center bg-zinc-900 hover:bg-emerald-600 border border-zinc-800 hover:border-emerald-500 text-zinc-400 hover:text-white rounded transition-all disabled:opacity-0 disabled:scale-75"
                    >
                        {isLoading ? <Activity size={14} className="animate-spin" /> : <Send size={14} />}
                    </button>
                </form>
            </div>
        </div>
    )
}
