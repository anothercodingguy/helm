import React from 'react';
import { useChatStore } from '@/store/chatStore';
import { Monitor, RefreshCw, ArrowLeft, ArrowRight, Lock } from 'lucide-react';

export default function BrowserView() {
    const { latestScreenshot, inputRequest } = useChatStore();

    return (
        <div className="flex flex-col h-full bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden shadow-2xl">
            {/* Mock Browser Header */}
            <div className="bg-zinc-900 px-4 py-3 flex items-center gap-4 border-b border-zinc-800/50">
                <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50" />
                    <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50" />
                </div>

                <div className="flex items-center gap-4 text-zinc-600">
                    <ArrowLeft size={14} />
                    <ArrowRight size={14} />
                    <RefreshCw size={14} />
                </div>

                <div className="flex-1 bg-zinc-950/50 border border-zinc-800 rounded-md px-4 py-1.5 text-xs text-zinc-400 font-mono flex items-center justify-center gap-2 shadow-inner">
                    <Lock size={10} className="text-emerald-500/50" />
                    <span className="opacity-50 tracking-wide">secure://agent-browser-session-isolate.local</span>
                </div>
            </div>

            {/* Viewport */}
            <div className="flex-1 relative bg-black flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-stone-900/10 pattern-grid-lg opacity-20 pointer-events-none" />

                {latestScreenshot ? (
                    <img
                        src={`data:image/png;base64,${latestScreenshot}`}
                        alt="Live View"
                        className="max-w-full max-h-full object-contain shadow-2xl"
                    />
                ) : (
                    <div className="flex flex-col items-center gap-4 text-zinc-700 animate-pulse">
                        <Monitor size={64} strokeWidth={1} />
                        <div className="text-sm font-mono tracking-widest uppercase">Video Feed Offline</div>
                    </div>
                )}

                {/* Input Request Overlay */}
                {inputRequest && (
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-8 z-20">
                        <div className="bg-zinc-900 border border-zinc-700 p-6 rounded-xl max-w-md w-full shadow-2xl animate-in fade-in zoom-in duration-300 ring-1 ring-white/10">
                            <h3 className="text-white font-medium mb-2 flex items-center gap-2">
                                <span className="relative flex h-3 w-3">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
                                </span>
                                Input Required
                            </h3>
                            <p className="text-zinc-400 text-sm mb-4 leading-relaxed">{inputRequest}</p>
                            <input
                                type="text"
                                autoFocus
                                className="w-full bg-black border border-zinc-800 rounded-lg p-3 text-white text-sm focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20 outline-none transition-all placeholder:text-zinc-700"
                                placeholder="Type response and press Enter..."
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        // Handle input - In a real scenario, this sends back to API
                                        // For demo, we just clear it locally or assume handled
                                        console.log('User input:', e.currentTarget.value);
                                        useChatStore.setState({ inputRequest: null });
                                    }
                                }}
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
