'use client';
import { useEffect, useState } from 'react';
import ChatWindow from '@/components/ChatWindow';
import ChatInput from '@/components/ChatInput';
import ChatSidebar from '@/components/ChatSidebar';
import api from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

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
        // Poll usage every minute or on focus could be nice, but simple on mount/send is ok.
        // We can expose a refresh function if needed.
    }, []);

    // Refresh usage when a message is sent (passed to Input? or Context?)
    // For MVP, just loading on mount is a start, but updating after send is better.
    // We'll pass fetchUsage to ChatInput via a prop or context? 
    // Easier: ChatInput triggers a refresh via an event or we just use store. 
    // Let's keep it simple: Page shows static usage from load. Input handles the locking itself if API errors.
    // Actually input locking needs this data. 

    // Better pattern: Put usage in chatStore or a new usageStore.
    // But prompted for "Frontend UX... Header... Input...".

    return (
        <div className="flex h-screen bg-background">
            <ChatSidebar />
            <div className="flex-1 flex flex-col min-w-0">
                <header className="h-14 border-b flex items-center justify-between px-6 sticky top-0 bg-background/80 backdrop-blur z-10">
                    <div className="flex items-center gap-3">
                        <h1 className="font-semibold text-lg tracking-tight">Moltbot</h1>
                        {usage && (
                            <Badge variant={usage.plan === 'free' ? 'secondary' : 'default'} className="uppercase text-xs tracking-wider">
                                {usage.plan}
                            </Badge>
                        )}
                    </div>
                    {usage && (
                        <div className="text-xs text-muted-foreground flex items-center gap-4">
                            <span>Usage: {usage.used}/{usage.limit}</span>
                            {usage.plan === 'free' ? (
                                <Link href="/pricing" className="text-blue-500 hover:underline">Upgrade</Link>
                            ) : (
                                <span>{usage.daysLeft} days left</span>
                            )}
                        </div>
                    )}
                </header>
                <ChatWindow />
                <ChatInput usage={usage} onMessageSent={fetchUsage} />
            </div>
        </div>
    );
}
