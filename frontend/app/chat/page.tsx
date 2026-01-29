'use client';
import { useEffect, useState } from 'react';
import ChatSidebar from '@/components/ChatSidebar';
import CommandCenter from '@/components/CommandCenter';
import BrowserView from '@/components/BrowserView';
import ArtifactsPanel from '@/components/ArtifactsPanel';
import api from '@/lib/api';
import { Badge } from '@/components/ui/badge';

interface UsageStats {
    plan: 'free' | 'pro' | 'team';
    used: number;
    limit: number;
    daysLeft: number;
}

export default function ChatPage() {
    const [usage, setUsage] = useState<UsageStats | null>(null);

    const fetchUsage = async () => {
        try {
            const res = await api.get('/usage');
            setUsage(res.data);
        } catch (error) {
            console.error('Failed to fetch usage', error);
        }
    };

    useEffect(() => {
        fetchUsage();
    }, []);

    return (
        <div className="flex h-screen bg-black text-zinc-100 font-sans overflow-hidden">
            <ChatSidebar />

            <div className="flex-1 flex flex-col min-w-0 bg-black">
                {/* Header */}
                <header className="h-12 border-b border-zinc-800 flex items-center justify-between px-4 bg-zinc-950/80 backdrop-blur z-10 shrink-0">
                    <div className="flex items-center gap-3">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        <h1 className="font-bold text-sm tracking-widest text-zinc-100 uppercase">Moltbot <span className="text-zinc-500">Mission Control</span></h1>
                        {usage && (
                            <Badge variant="outline" className="text-[10px] border-zinc-800 text-zinc-500 hover:text-white transition-colors bg-zinc-900/50">
                                {usage.plan.toUpperCase()}
                            </Badge>
                        )}
                    </div>
                </header>

                {/* 3-Pane Dashboard Layout */}
                <div className="flex-1 grid grid-cols-12 gap-0 min-h-0">

                    {/* LEFT: Commander (Logs & Input) - 25% */}
                    <div className="col-span-3 h-full min-h-0 border-r border-zinc-800 bg-zinc-950 relative z-10">
                        <CommandCenter />
                    </div>

                    {/* CENTER: Vision (Browser) - 58% (Leaving 17% for right) */}
                    <div className="col-span-7 h-full min-h-0 bg-zinc-900/10 p-4 flex flex-col relative">
                        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-zinc-900/20 via-black to-black -z-10" />
                        <BrowserView />
                    </div>

                    {/* RIGHT: Workspace (Artifacts) - 2/12 = ~16% (Wait, 3+7+2 = 12. Adjust if needed) */}
                    <div className="col-span-2 h-full min-h-0 border-l border-zinc-800 bg-zinc-950 relative z-10">
                        <ArtifactsPanel />
                    </div>

                </div>
            </div>
        </div>
    );
}
