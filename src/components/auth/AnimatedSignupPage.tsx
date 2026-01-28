import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeOff, Mail, Lock, User, UserPlus, Stethoscope, Heart } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { useLanguage } from '@/contexts/language-context';
import { cn } from '@/lib/utils';

interface AnimatedSignupPageProps {
  onSwitchToLogin: () => void;
  onClose?: () => void;
}

export function AnimatedSignupPage({ onSwitchToLogin, onClose }: AnimatedSignupPageProps) {
  const { signUp } = useAuth();
  const { currentLanguage } = useLanguage();
  const [userType, setUserType] = useState<'patient' | 'doctor' | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    specialization: '', // For doctors
    licenseNumber: '', // For doctors
    phone: ''
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

    if (!userType) {
      setError(currentLanguage === 'hi' ? 'कृपया अकाउंट प्रकार चुनें' : 'Please select account type');
      setLoading(false);
      return;
    }

    const userData = {
      full_name: formData.name,
      user_type: userType,
      phone: formData.phone,
      ...(userType === 'doctor' && {
        specialization: formData.specialization,
        license_number: formData.licenseNumber
      })
    };

    const { error } = await signUp(formData.email, formData.password, userData);
    
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
      <div className="min-h-screen flex items-center justify-center p-8 bg-background">
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
      </div>
    );
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2 overflow-hidden">
      {/* Left Content Section */}
      <div className="relative hidden lg:flex flex-col justify-between bg-gradient-to-br from-[#4A9B8E]/90 via-[#4A9B8E] to-[#4A9B8E]/80 p-12 text-white">
        <div className="relative z-20">
          <div className="flex items-center gap-2 text-lg font-semibold">
            <div className="size-8 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center">
              <Heart className="size-4" />
            </div>
            <span>Vaidyana</span>
          </div>
        </div>

        <div className="relative z-20 flex items-center justify-center h-[500px]">
          <div className="text-center">
            <h2 className="text-4xl font-bold mb-4">
              {currentLanguage === 'hi' ? 'स्वास्थ्य सेवा में शामिल हों' : 'Join Healthcare Revolution'}
            </h2>
            <p className="text-xl text-white/80 mb-8">
              {currentLanguage === 'hi' 
                ? 'मरीज़ या डॉक्टर के रूप में रजिस्टर करें'
                : 'Register as a Patient or Doctor'
              }
            </p>
            <div className="flex justify-center gap-8">
              <div className="text-center">
                <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mb-3">
                  <User className="w-10 h-10" />
                </div>
                <p className="text-sm">
                  {currentLanguage === 'hi' ? 'मरीज़' : 'Patient'}
                </p>
              </div>
              <div className="text-center">
                <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mb-3">
                  <Stethoscope className="w-10 h-10" />
                </div>
                <p className="text-sm">
                  {currentLanguage === 'hi' ? 'डॉक्टर' : 'Doctor'}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-20 flex items-center gap-8 text-sm text-white/60">
          <span className="text-white/80">
            {currentLanguage === 'hi' ? 'आपका स्वास्थ्य साथी' : 'Your Health Companion'}
          </span>
        </div>
      </div>

      {/* Right Signup Section */}
      <div className="flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-background overflow-y-auto max-h-screen">
        <div className="w-full max-w-[420px] my-auto">
          <div className="lg:hidden flex items-center justify-center gap-2 text-lg font-semibold mb-12">
            <div className="size-8 rounded-lg bg-[#4A9B8E]/10 flex items-center justify-center">
              <Heart className="size-4 text-[#4A9B8E]" />
            </div>
            <span>Vaidyana</span>
          </div>

          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold tracking-tight mb-2">
              {currentLanguage === 'hi' ? 'खाता बनाएं' : 'Create Account'}
            </h1>
            <p className="text-muted-foreground text-sm">
              {currentLanguage === 'hi' ? 'अपनी जानकारी दर्ज करें' : 'Enter your information'}
            </p>
          </div>

          {/* User Type Selection */}
          {!userType && (
            <div className="space-y-3 mb-6">
              <Label className="text-sm font-medium">
                {currentLanguage === 'hi' ? 'अकाउंट प्रकार चुनें' : 'Select Account Type'}
              </Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setUserType('patient')}
                  className="p-3 sm:p-4 border-2 border-gray-200 rounded-lg hover:border-[#4A9B8E] hover:bg-[#4A9B8E]/5 transition-colors"
                >
                  <User className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2 text-[#4A9B8E]" />
                  <p className="font-medium text-sm sm:text-base">
                    {currentLanguage === 'hi' ? 'मरीज़' : 'Patient'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {currentLanguage === 'hi' ? 'स्वास्थ्य सेवा प्राप्त करें' : 'Get healthcare services'}
                  </p>
                </button>
                <button
                  type="button"
                  onClick={() => setUserType('doctor')}
                  className="p-3 sm:p-4 border-2 border-gray-200 rounded-lg hover:border-[#4A9B8E] hover:bg-[#4A9B8E]/5 transition-colors"
                >
                  <Stethoscope className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2 text-[#4A9B8E]" />
                  <p className="font-medium text-sm sm:text-base">
                    {currentLanguage === 'hi' ? 'डॉक्टर' : 'Doctor'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {currentLanguage === 'hi' ? 'स्वास्थ्य सेवा प्रदान करें' : 'Provide healthcare services'}
                  </p>
                </button>
              </div>
            </div>
          )}

          {userType && (
            <form onSubmit={handleSubmit} className="space-y-3">
              {error && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertDescription className="text-red-700">{error}</AlertDescription>
                </Alert>
              )}

              <div className="flex items-center gap-2 mb-3 p-2 bg-[#4A9B8E]/10 rounded-lg">
                {userType === 'patient' ? (
                  <User className="w-4 h-4 text-[#4A9B8E]" />
                ) : (
                  <Stethoscope className="w-4 h-4 text-[#4A9B8E]" />
                )}
                <span className="text-sm font-medium text-[#4A9B8E]">
                  {currentLanguage === 'hi' 
                    ? (userType === 'patient' ? 'मरीज़ के रूप में रजिस्टर कर रहे हैं' : 'डॉक्टर के रूप में रजिस्टर कर रहे हैं')
                    : `Registering as ${userType === 'patient' ? 'Patient' : 'Doctor'}`
                  }
                </span>
                <button
                  type="button"
                  onClick={() => setUserType(null)}
                  className="ml-auto text-xs text-[#4A9B8E] hover:underline"
                >
                  {currentLanguage === 'hi' ? 'बदलें' : 'Change'}
                </button>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="name">
                  {currentLanguage === 'hi' ? 'पूरा नाम' : 'Full Name'}
                </Label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder={currentLanguage === 'hi' ? 'आपका नाम' : 'Your name'}
                  required
                  className="h-10 sm:h-12"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">
                  {currentLanguage === 'hi' ? 'ईमेल' : 'Email'}
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder={currentLanguage === 'hi' ? 'आपका ईमेल' : 'Your email'}
                  required
                  className="h-10 sm:h-12"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">
                  {currentLanguage === 'hi' ? 'फोन नंबर' : 'Phone Number'}
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder={currentLanguage === 'hi' ? 'आपका फोन नंबर' : 'Your phone number'}
                  required
                  className="h-10 sm:h-12"
                />
              </div>

              {userType === 'doctor' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="specialization">
                      {currentLanguage === 'hi' ? 'विशेषज्ञता' : 'Specialization'}
                    </Label>
                    <Input
                      id="specialization"
                      type="text"
                      value={formData.specialization}
                      onChange={(e) => handleInputChange('specialization', e.target.value)}
                      placeholder={currentLanguage === 'hi' ? 'जैसे: कार्डियोलॉजी' : 'e.g., Cardiology'}
                      required
                      className="h-10 sm:h-12"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="licenseNumber">
                      {currentLanguage === 'hi' ? 'लाइसेंस नंबर' : 'License Number'}
                    </Label>
                    <Input
                      id="licenseNumber"
                      type="text"
                      value={formData.licenseNumber}
                      onChange={(e) => handleInputChange('licenseNumber', e.target.value)}
                      placeholder={currentLanguage === 'hi' ? 'मेडिकल लाइसेंस नंबर' : 'Medical license number'}
                      required
                      className="h-10 sm:h-12"
                    />
                  </div>
                </>
              )}

              <div className="space-y-2">
                <Label htmlFor="password">
                  {currentLanguage === 'hi' ? 'पासवर्ड' : 'Password'}
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    placeholder={currentLanguage === 'hi' ? 'पासवर्ड (कम से कम 6 अक्षर)' : 'Password (min 6 chars)'}
                    required
                    className="h-10 sm:h-12 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">
                  {currentLanguage === 'hi' ? 'पासवर्ड कन्फर्म करें' : 'Confirm Password'}
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  placeholder={currentLanguage === 'hi' ? 'पासवर्ड दोबारा डालें' : 'Confirm your password'}
                  required
                  className="h-10 sm:h-12"
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-10 sm:h-12 bg-[#4A9B8E] hover:bg-[#4A9B8E]/90"
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
          )}
        </div>
      </div>
    </div>
  );
}