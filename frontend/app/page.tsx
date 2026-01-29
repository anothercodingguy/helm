'use client';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import api from '@/lib/api';

export default function Home() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    setIsLoading(true);
    try {
      // Mock Login
      const response = await api.post('/auth/login', {
        email: 'test@example.com',
        password: 'password'
      });

      localStorage.setItem('token', response.data.token);
      router.push('/chat');
    } catch (error) {
      alert('Login Failed. Is backend running?');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-zinc-950 text-white space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl">Moltbot SaaS</h1>
        <p className="text-muted-foreground">Production-Ready AI Chat Interface</p>
      </div>

      <div className="p-8 border rounded-xl bg-zinc-900/50 backdrop-blur w-full max-w-sm space-y-4">
        <div className="space-y-4"> {/* Mock Form */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Email</label>
            <div className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm opacity-50 cursor-not-allowed">test@example.com</div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Password</label>
            <div className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm opacity-50 cursor-not-allowed">password</div>
          </div>
        </div>

        <Button onClick={handleLogin} className="w-full" disabled={isLoading}>
          {isLoading ? 'Signing In...' : 'Sign In'}
        </Button>
        <p className="text-xs text-center text-muted-foreground mt-4">
          Click to login with mock credentials.
        </p>
      </div>
    </div>
  );
}
