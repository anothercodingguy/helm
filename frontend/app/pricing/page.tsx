'use client';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

export default function PricingPage() {
    const router = useRouter();

    const handleBuy = async (planId: string) => {
        try {
            const res = await api.post('/payment/initiate', { planId });
            if (res.data.url) {
                window.location.href = res.data.url;
            }
        } catch (error) {
            console.error('Payment Error', error);
            alert('Failed to initiate payment');
        }
    };

    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-foreground">
            <h1 className="text-3xl font-bold mb-8">Upgrade for More Power</h1>
            <div className="grid md:grid-cols-3 gap-6 max-w-4xl w-full">

                {/* Free Plan */}
                <div className="border rounded-2xl p-6 flex flex-col bg-muted/20">
                    <h2 className="text-xl font-semibold">Free</h2>
                    <p className="text-4xl font-bold mt-4">₹0<span className="text-base font-normal text-muted-foreground">/mo</span></p>
                    <ul className="mt-6 space-y-3 flex-1">
                        <li>• 10 Messages / Day</li>
                        <li>• Basic Memory</li>
                        <li>• No Streaming</li>
                    </ul>
                    <Button variant="outline" className="mt-6" disabled>Current Plan</Button>
                </div>

                {/* Pro Plan */}
                <div className="border border-blue-500 rounded-2xl p-6 flex flex-col bg-blue-500/5 relative overflow-hidden">
                    <div className="absolute top-0 right-0 bg-blue-500 text-white text-xs px-2 py-1 rounded-bl">POPULAR</div>
                    <h2 className="text-xl font-semibold text-blue-500">Pro</h2>
                    <p className="text-4xl font-bold mt-4">₹499<span className="text-base font-normal text-muted-foreground">/30 days</span></p>
                    <ul className="mt-6 space-y-3 flex-1">
                        <li>• 500 Messages / Month</li>
                        <li>• <strong>Streaming Responses</strong></li>
                        <li>• Full Conversation Memory</li>
                        <li>• Priority Support</li>
                    </ul>
                    <Button className="mt-6 bg-blue-600 hover:bg-blue-700" onClick={() => handleBuy('pro')}>
                        Upgrade to Pro
                    </Button>
                </div>

                {/* Team Plan */}
                <div className="border rounded-2xl p-6 flex flex-col bg-muted/20">
                    <h2 className="text-xl font-semibold">Team</h2>
                    <p className="text-4xl font-bold mt-4">₹1499<span className="text-base font-normal text-muted-foreground">/30 days</span></p>
                    <ul className="mt-6 space-y-3 flex-1">
                        <li>• 2000 Messages / Month</li>
                        <li>• Everything in Pro</li>
                        <li>• Team Analytics (Soon)</li>
                    </ul>
                    <Button variant="outline" className="mt-6" onClick={() => handleBuy('team')}>Upgrade to Team</Button>
                </div>

            </div>

            <div className="mt-8 text-sm text-muted-foreground">
                <button onClick={() => router.push('/chat')} className="hover:underline">Back to Chat</button>
            </div>
        </div>
    );
}
