import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeOff, Mail, Lock, LogIn } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { useLanguage } from '@/contexts/language-context';

interface LoginFormProps {
  onSwitchToSignup: () => void;
  onClose?: () => void;
}

export function LoginForm({ onSwitchToSignup, onClose }: LoginFormProps) {
  const { signIn } = useAuth();
  const { currentLanguage } = useLanguage();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await signIn(email, password);
    
    if (error) {
      setError(currentLanguage === 'hi' ? 'गलत ईमेल या पासवर्ड' : 'Invalid email or password');
    } else {
      onClose?.();
    }
    
    setLoading(false);
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2 text-[#2D3748]">
          <LogIn className="w-5 h-5 text-[#4A9B8E]" />
          {currentLanguage === 'hi' ? 'लॉग इन करें' : 'Sign In'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert className="border-red-200 bg-red-50">
              <AlertDescription className="text-red-700">{error}</AlertDescription>
            </Alert>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="email">
              {currentLanguage === 'hi' ? 'ईमेल' : 'Email'}
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={currentLanguage === 'hi' ? 'आपका ईमेल' : 'Your email'}
                className="pl-10"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">
              {currentLanguage === 'hi' ? 'पासवर्ड' : 'Password'}
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={currentLanguage === 'hi' ? 'आपका पासवर्ड' : 'Your password'}
                className="pl-10 pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-[#4A9B8E] hover:bg-[#4A9B8E]/90"
          >
            {loading ? (
              currentLanguage === 'hi' ? 'लॉग इन हो रहा है...' : 'Signing in...'
            ) : (
              currentLanguage === 'hi' ? 'लॉग इन करें' : 'Sign In'
            )}
          </Button>

          <div className="text-center space-y-2">
            <p className="text-sm text-gray-600">
              {currentLanguage === 'hi' ? 'खाता नहीं है?' : "Don't have an account?"}{' '}
              <button
                type="button"
                onClick={onSwitchToSignup}
                className="text-[#4A9B8E] hover:underline font-medium"
              >
                {currentLanguage === 'hi' ? 'साइन अप करें' : 'Sign up'}
              </button>
            </p>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}