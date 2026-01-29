import React, { useEffect, useState } from 'react';
import { useChatStore } from '@/store/chatStore';
import api from '@/lib/api';
import { cn } from '@/lib/utils';
import { MessageSquare, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Conversation {
    id: string;
    title: string;
    createdAt: string;
}

const ChatSidebar = () => {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const { activeConversationId, setActiveConversationId, setMessages } = useChatStore();

    const fetchConversations = async () => {
        try {
            const res = await api.get('/conversations');
            setConversations(res.data);
        } catch (error) {
            console.error('Failed to fetch conversations', error);
        }
    };

    const loadConversation = async (id: string) => {
        try {
            setActiveConversationId(id);
            const res = await api.get(`/conversations/${id}`);
            const messages = res.data.messages.map((m: any) => ({
                id: m.id,
                role: m.role,
                content: m.content,
                timestamp: new Date(m.createdAt)
            }));
            setMessages(messages);
        } catch (error) {
            console.error('Failed to load conversation', error);
        }
    };

    const handleNewChat = () => {
        setActiveConversationId(null);
        setMessages([]); // Clear chat
    };

    useEffect(() => {
        // Fetch on mount and when active ID changes (to catch new convo title)
        fetchConversations();
    }, [activeConversationId]);

    return (
        <div className="w-64 border-r h-full flex flex-col bg-muted/10 hidden md:flex">
            <div className="p-4">
                <Button onClick={handleNewChat} variant="outline" className="w-full justify-start gap-2">
                    <Plus className="h-4 w-4" />
                    New Chat
                </Button>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
                {conversations.map((conv) => (
                    <button
                        key={conv.id}
                        onClick={() => loadConversation(conv.id)}
                        className={cn(
                            "w-full text-left px-3 py-2 rounded-lg text-sm truncate flex items-center gap-2 transition-colors",
                            activeConversationId === conv.id
                                ? "bg-accent text-accent-foreground font-medium"
                                : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                        )}
                    >
                        <MessageSquare className="h-4 w-4 shrink-0 opacity-50" />
                        <span className="truncate">{conv.title || 'New Chat'}</span>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default ChatSidebar;
