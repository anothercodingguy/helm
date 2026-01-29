import React, { useEffect, useRef } from 'react';
import { useChatStore } from '@/store/chatStore';
import MessageBubble from './MessageBubble';

const ChatWindow: React.FC = () => {
    const { messages, isLoading } = useChatStore();
    const bottomRef = useRef<HTMLDivElement>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll only if already near bottom or it's a new message start
    useEffect(() => {
        // Simple auto-scroll for now: always scroll to bottom on new content for streaming effect satisfaction
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isLoading]);

    return (
        <div className="flex-1 w-full overflow-y-auto p-4 md:p-6 scroll-smooth" ref={scrollRef}>
            <div className="max-w-3xl mx-auto min-h-full flex flex-col justify-end">
                {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center flex-1 h-[50vh] text-center space-y-4 opacity-50">
                        <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center">
                            <span className="text-3xl">🤖</span>
                        </div>
                        <h2 className="text-xl font-medium">How can I help you today?</h2>
                    </div>
                ) : (
                    messages.map((msg, index) => (
                        <div key={msg.id} className="relative">
                            <MessageBubble message={msg} />
                            {/* Blinking Cursor for streaming message */}
                            {isLoading && index === messages.length - 1 && msg.role === 'assistant' && (
                                <span className="inline-block w-2 h-4 bg-blue-500 ml-1 animate-pulse align-middle" style={{ marginTop: '-4px' }}></span>
                            )}
                        </div>
                    ))
                )}

                <div ref={bottomRef} />
            </div>
        </div>
    );
};

export default ChatWindow;
