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

    // Mission Control State
    logs: { content: string; details?: string; timestamp: Date }[];
    latestScreenshot: string | null;
    fileList: { filename: string; url: string }[];
    inputRequest: string | null;

    addMessage: (message: Message) => void;
    setMessages: (messages: Message[]) => void;
    setActiveConversationId: (id: string | null) => void;
    sendMessage: (content: string) => Promise<void>;
}

export const useChatStore = create<ChatState>((set, get) => ({
    messages: [],
    isLoading: false,
    activeConversationId: null,

    logs: [],
    latestScreenshot: null,
    fileList: [],
    inputRequest: null,

    addMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),
    setMessages: (messages) => set({ messages }),
    setActiveConversationId: (id) => set({ activeConversationId: id }),

    sendMessage: async (content: string) => {
        const { addMessage, activeConversationId } = get();

        // User message
        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content,
            timestamp: new Date(),
        };
        addMessage(userMessage);

        // Reset Mission Control State for new task
        set({
            isLoading: true,
            logs: [],
            latestScreenshot: null,
            fileList: [],
            inputRequest: null
        });

        try {
            // Note: In real app, we might use env var, but hardcoding based on previous file
            const response = await fetch('http://localhost:7000/v1/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: content, stream: true })
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
                        if (dataStr.trim() === '[DONE]') continue;

                        try {
                            const data = JSON.parse(dataStr);

                            switch (data.type) {
                                case 'log':
                                    set(state => ({
                                        logs: [...state.logs, {
                                            content: data.content,
                                            details: data.details,
                                            timestamp: new Date()
                                        }]
                                    }));
                                    break;
                                case 'screenshot':
                                    set({ latestScreenshot: data.base64 });
                                    break;
                                case 'file':
                                    set(state => ({
                                        fileList: [...state.fileList, {
                                            filename: data.filename,
                                            url: data.url
                                        }]
                                    }));
                                    break;
                                case 'input_needed':
                                    set({ inputRequest: data.prompt });
                                    break;
                            }

                        } catch (e) {
                            console.error('Error parsing SSE data', e);
                        }
                    }
                }
            }

        } catch (error) {
            console.error('Failed to send message:', error);
            set(state => ({
                logs: [...state.logs, { content: 'System Error: Failed to connect to agent.', timestamp: new Date() }]
            }));
        } finally {
            set({ isLoading: false });
        }
    },
}));
