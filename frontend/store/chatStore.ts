import { create } from 'zustand';

export interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
    isError?: boolean;
}

interface ChatState {
    messages: Message[];
    isLoading: boolean;
    activeConversationId: string | null;
    addMessage: (message: Message) => void;
    setMessages: (messages: Message[]) => void;
    setActiveConversationId: (id: string | null) => void;
    sendMessage: (content: string) => Promise<void>;
}

export const useChatStore = create<ChatState>((set, get) => ({
    messages: [],
    isLoading: false,
    activeConversationId: null,

    addMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),
    setMessages: (messages) => set({ messages }),
    setActiveConversationId: (id) => set({ activeConversationId: id }),

    sendMessage: async (content: string) => {
        const { addMessage, activeConversationId, setActiveConversationId } = get();

        // User message
        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content,
            timestamp: new Date(),
        };
        addMessage(userMessage);
        set({ isLoading: true });

        // Assistant Placeholder
        const assistantId = (Date.now() + 1).toString();
        const assistantMessage: Message = {
            id: assistantId,
            role: 'assistant',
            content: '', // Start empty
            timestamp: new Date(),
        };
        addMessage(assistantMessage);

        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5001/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ message: content, conversationId: activeConversationId })
            });

            if (!response.ok) throw new Error('Network response was not ok');
            if (!response.body) throw new Error('No response body');

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n\n');
                buffer = lines.pop() || '';

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const dataStr = line.slice(6);
                        if (dataStr === '[DONE]') continue;

                        try {
                            const data = JSON.parse(dataStr);

                            if (data.token) {
                                set((state) => {
                                    const newMessages = [...state.messages];
                                    const lastMsg = newMessages[newMessages.length - 1];
                                    if (lastMsg && lastMsg.role === 'assistant') {
                                        lastMsg.content += data.token;
                                    }
                                    return { messages: newMessages };
                                });
                            }

                            if (data.done && data.conversationId) {
                                if (activeConversationId !== data.conversationId) {
                                    setActiveConversationId(data.conversationId);
                                }
                            }

                            if (data.error) throw new Error(data.error);
                        } catch (e) {
                            console.error('Error parsing SSE data', e);
                        }
                    }
                }
            }

        } catch (error) {
            console.error('Failed to send message:', error);
            set((state) => {
                const newMessages = [...state.messages];
                const lastMsg = newMessages[newMessages.length - 1];
                if (lastMsg.role === 'assistant' && !lastMsg.content) {
                    lastMsg.content = 'Failed to get response. Please try again.';
                    lastMsg.isError = true;
                }
                return { messages: newMessages };
            });
        } finally {
            set({ isLoading: false });
        }
    },
}));
