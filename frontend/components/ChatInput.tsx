import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useChatStore } from '@/store/chatStore';
import Link from 'next/link';

interface UsageStats {
    plan: 'free' | 'pro' | 'team';
    used: number;
    limit: number;
}

interface ChatInputProps {
    usage: UsageStats | null;
    onMessageSent: () => void;
}

const ChatInput: React.FC<ChatInputProps> = ({ usage, onMessageSent }) => {
    const [input, setInput] = useState('');
    const { sendMessage, isLoading } = useChatStore();
    const inputRef = useRef<HTMLInputElement>(null);

    const isLimitReached = usage ? usage.used >= usage.limit : false;

    const handleSubmit = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!input.trim() || isLoading || isLimitReached) return;

        const message = input;
        setInput('');
        await sendMessage(message);
        onMessageSent(); // Refresh usage counters

        setTimeout(() => {
            inputRef.current?.focus();
        }, 10);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    };

    if (isLimitReached) {
        return (
            <div className="p-4 border-t bg-background/95 backdrop-blur">
                <div className="max-w-3xl mx-auto flex items-center justify-between p-4 bg-muted/50 rounded-lg border border-red-200 dark:border-red-900/30">
                    <div className="flex items-center gap-3">
                        <Lock className="h-5 w-5 text-red-500" />
                        <div className="text-sm">
                            <span className="font-medium text-foreground">Daily limit reached.</span>
                            <span className="text-muted-foreground ml-1">Upgrade to Pro for more messages.</span>
                        </div>
                    </div>
                    <Link href="/pricing">
                        <Button size="sm" variant="default" className="bg-red-600 hover:bg-red-700 text-white">
                            Upgrade for ₹499
                        </Button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="max-w-3xl mx-auto relative flex items-center gap-2">
                <Input
                    ref={inputRef}
                    placeholder={isLimitReached ? "Limit reached" : "Type a message..."}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="flex-1 rounded-full h-12 px-5 bg-muted/50 border-transparent focus-visible:bg-background transition-all focus-visible:ring-offset-0 focus-visible:ring-1 focus-visible:ring-white/20"
                    disabled={isLoading || isLimitReached}
                />
                <Button
                    size="icon"
                    onClick={() => handleSubmit()}
                    disabled={!input.trim() || isLoading || isLimitReached}
                    className="rounded-full h-12 w-12 shrink-0 bg-blue-600 hover:bg-blue-700 text-white"
                >
                    {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                </Button>
            </div>
            <div className="text-center mt-2 text-xs text-muted-foreground">
                Moltbot can make mistakes. Consider checking important information.
            </div>
        </div>
    );
};

export default ChatInput;
