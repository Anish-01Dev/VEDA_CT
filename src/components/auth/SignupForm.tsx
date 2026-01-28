import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeOff, Mail, Lock, User, UserPlus } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { useLanguage } from '@/contexts/language-context';

interface SignupFormProps {
  onSwitchToLogin: () => void;
  onClose?: () => void;
}

export function SignupForm({ onSwitchToLogin, onClose }: SignupFormProps) {
  const { signUp } = useAuth();
  const { currentLanguage } = useLanguage();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (formData.password !== formData.confirmPassword) {
      setError(currentLanguage === 'hi' ? 'पासवर्ड मैच नहीं कर रहे' : 'Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError(currentLanguage === 'hi' ? 'पासवर्ड कम से कम 6 अक्षर का होना चाहिए' : 'Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    const { error } = await signUp(formData.email, formData.password, {
      full_name: formData.name
    });
    
    if (error) {
      setError(error.message);
    } else {
      setSuccess(true);
    }
    
    setLoading(false);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (success) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="text-center p-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <UserPlus className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold mb-2">
            {currentLanguage === 'hi' ? 'खाता बनाया गया!' : 'Account Created!'}
          </h3>
          <p className="text-gray-600 mb-4">
            {currentLanguage === 'hi' 
              ? 'कृपया अपना ईमेल चेक करें और अकाउंट वेरिफाई करें।'
              : 'Please check your email to verify your account.'
            }
          </p>
          <Button onClick={onSwitchToLogin} className="bg-[#4A9B8E] hover:bg-[#4A9B8E]/90">
            {currentLanguage === 'hi' ? 'लॉग इन करें' : 'Sign In'}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2 text-[#2D3748]">
          <UserPlus className="w-5 h-5 text-[#4A9B8E]" />
          {currentLanguage === 'hi' ? 'साइन अप करें' : 'Sign Up'}
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
            <Label htmlFor="name">
              {currentLanguage === 'hi' ? 'पूरा नाम' : 'Full Name'}
            </Label>
            <div className="relative">
              <User className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder={currentLanguage === 'hi' ? 'आपका नाम' : 'Your name'}
                className="pl-10"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">
              {currentLanguage === 'hi' ? 'ईमेल' : 'Email'}
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
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
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                placeholder={currentLanguage === 'hi' ? 'पासवर्ड (कम से कम 6 अक्षर)' : 'Password (min 6 chars)'}
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

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">
              {currentLanguage === 'hi' ? 'पासवर्ड कन्फर्म करें' : 'Confirm Password'}
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <Input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                placeholder={currentLanguage === 'hi' ? 'पासवर्ड दोबारा डालें' : 'Confirm your password'}
                className="pl-10"
                required
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-[#4A9B8E] hover:bg-[#4A9B8E]/90"
          >
            {loading ? (
              currentLanguage === 'hi' ? 'खाता बनाया जा रहा है...' : 'Creating account...'
            ) : (
              currentLanguage === 'hi' ? 'साइन अप करें' : 'Sign Up'
            )}
          </Button>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              {currentLanguage === 'hi' ? 'पहले से खाता है?' : 'Already have an account?'}{' '}
              <button
                type="button"
                onClick={onSwitchToLogin}
                className="text-[#4A9B8E] hover:underline font-medium"
              >
                {currentLanguage === 'hi' ? 'लॉग इन करें' : 'Sign in'}
              </button>
            </p>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}