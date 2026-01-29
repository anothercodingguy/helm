'use client';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { CheckCircle } from 'lucide-react';

export default function PaymentSuccessPage() {
    const router = useRouter();

    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-foreground">
            <div className="w-16 h-16 text-green-500 mb-6">
                <CheckCircle className="w-full h-full" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Payment Successful!</h1>
            <p className="text-muted-foreground mb-8">Your plan has been upgraded.</p>
            <Button onClick={() => router.push('/chat')}>Return to Chat</Button>
        </div>
    );
}
