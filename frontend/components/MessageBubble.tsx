import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '@/lib/utils';
import { Message } from '@/store/chatStore';

interface MessageBubbleProps {
    message: Message;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
    const isUser = message.role === 'user';
    const isError = message.isError;

    return (
        <div
            className={cn(
                'flex w-full mb-4',
                isUser ? 'justify-end' : 'justify-start'
            )}
        >
            <div
                className={cn(
                    'max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed',
                    isUser
                        ? 'bg-blue-600 text-white rounded-br-none'
                        : 'bg-muted text-foreground rounded-bl-none',
                    isError && 'bg-destructive/10 text-destructive border border-destructive/20'
                )}
            >
                {!isUser ? (
                    <div className="prose prose-invert prose-sm max-w-none break-words">
                        <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                                pre: ({ node, ...props }) => <div className="overflow-auto w-full my-2 bg-black/50 p-2 rounded-lg" {...props as any} />,
                                code: ({ node, ...props }) => <code className="bg-black/30 rounded px-1" {...props as any} />
                            }}
                        >
                            {message.content}
                        </ReactMarkdown>
                    </div>
                ) : (
                    <div className="whitespace-pre-wrap">{message.content}</div>
                )}
                <div className={cn("text-[10px] mt-1 opacity-50", isUser ? "text-blue-100" : "text-muted-foreground")}>
                    {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
            </div>
        </div>
    );
};

export default MessageBubble;
