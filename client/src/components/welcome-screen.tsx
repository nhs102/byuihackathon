import { useState } from 'react';
import { Sparkles, Mail, UserPlus, AlertCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Alert, AlertDescription } from './ui/alert';
import { SignUpModal } from './signup-modal';
import { loginUser, registerUser } from '../services/userService';
import { useUser } from '../contexts/UserContext';

interface WelcomeScreenProps {
  onLogin: () => void;
  onViewBrandGuide: () => void;
}

export function WelcomeScreen({ onLogin, onViewBrandGuide }: WelcomeScreenProps) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [showSignUpModal, setShowSignUpModal] = useState(false);
  const { setUser } = useUser();

  const handleLogin = async () => {
    if (!email.trim()) return;
    
    setIsLoading(true);
    setError('');

    const result = await loginUser(email.trim());
    
    setIsLoading(false);

    if (result.success && result.user) {
      setUser(result.user);
      onLogin();
    } else {
      setError(result.error || 'Invalid email');
    }
  };

  const handleSignUpClick = () => {
    if (!email.trim()) {
      setError('Please enter your email first');
      return;
    }
    setError('');
    setShowSignUpModal(true);
  };

  const handleSignUpConfirm = async (name: string) => {
    setIsLoading(true);
    setError('');

    const result = await registerUser(email.trim(), name);
    
    setIsLoading(false);

    if (result.success && result.user) {
      setUser(result.user);
      setShowSignUpModal(false);
      onLogin();
    } else {
      setError(result.error || 'Registration failed');
      setShowSignUpModal(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a2332] to-[#2a3748] flex flex-col">
      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        {/* Logo and Tagline */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="mb-6 relative">
            <div className="w-24 h-24 mx-auto bg-gradient-to-br from-[#f9a826] to-[#f7931e] rounded-3xl flex items-center justify-center shadow-2xl transform hover:scale-105 transition-transform duration-300">
              <Sparkles className="w-12 h-12 text-white" strokeWidth={2.5} />
            </div>
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-[#f9a826] rounded-full animate-pulse"></div>
            <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-[#f9a826] rounded-full animate-pulse delay-300"></div>
          </div>
          
          <h1 className="text-5xl mb-3" style={{ 
            fontFamily: 'var(--font-headline)', 
            fontWeight: 'var(--font-weight-extrabold)',
            color: 'white',
            letterSpacing: '-0.02em'
          }}>
            IMPRINT
          </h1>
          
          <p className="text-[#f9a826] tracking-wide" style={{
            fontFamily: 'var(--font-body)',
            fontWeight: 'var(--font-weight-medium)',
            fontSize: '0.95rem'
          }}>
            Imprint Success DNA
          </p>
        </div>

        {/* Login Form */}
        <div className="w-full max-w-sm space-y-6 animate-fade-in">
          {/* Error Alert */}
          {error && (
            <Alert className="bg-red-500/10 border-red-500 text-white animate-fade-in">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <AlertDescription className="ml-2" style={{ fontFamily: 'var(--font-body)' }}>
                {error}
              </AlertDescription>
            </Alert>
          )}

          {/* Email Input */}
          <div className="space-y-2">
            <label htmlFor="email" className="text-white text-sm font-medium block">
              Email
            </label>
            <div className="relative flex items-center">
              <Mail className="absolute left-4 w-5 h-5 text-[#f9a826] pointer-events-none z-10" />
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 bg-white border-2 border-[#f9a826] text-[#1a2332] placeholder:text-[#1a2332]/60 focus:border-[#f9a826] focus:ring-2 focus:ring-[#f9a826]/30 h-14 rounded-xl font-medium shadow-md"
                style={{ fontFamily: 'var(--font-body)' }}
              />
            </div>
          </div>

          {/* Login Button */}
          <Button 
            onClick={handleLogin}
            disabled={!email.trim() || isLoading}
            className="w-full bg-gradient-to-r from-[#f9a826] to-[#f7931e] text-white hover:from-[#f7931e] hover:to-[#f9a826] shadow-lg shadow-[#f9a826]/30 h-12 rounded-xl transition-all duration-300 hover:shadow-xl hover:shadow-[#f9a826]/50 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 font-bold text-base"
            style={{ 
              fontFamily: 'var(--font-body)',
              fontWeight: '700'
            }}
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </Button>

          {/* Divider */}
          <div className="flex items-center gap-4">
            <div className="flex-1 h-px bg-white/30"></div>
            <span className="text-white/70 text-sm font-medium" style={{ fontFamily: 'var(--font-body)' }}>
              or
            </span>
            <div className="flex-1 h-px bg-white/30"></div>
          </div>

          {/* Sign Up Button */}
          <Button 
            onClick={handleSignUpClick}
            disabled={!email.trim() || isLoading}
            variant="outline"
            className="w-full border-2 border-white/80 bg-white/10 text-white hover:bg-white/20 hover:text-white hover:border-white h-12 rounded-xl transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 font-semibold text-base"
            style={{ 
              fontFamily: 'var(--font-body)',
              fontWeight: '600'
            }}
          >
            <UserPlus className="w-5 h-5 mr-2" />
            Sign up
          </Button>
        </div>

        {/* Sign Up Modal */}
        <SignUpModal
          open={showSignUpModal}
          onClose={() => setShowSignUpModal(false)}
          onConfirm={handleSignUpConfirm}
          isLoading={isLoading}
        />

      </div>

      {/* Bottom Decorative Elements */}
      <div className="pb-8 flex justify-center gap-2">
        <div className="w-2 h-2 bg-white/20 rounded-full"></div>
        <div className="w-2 h-2 bg-[#f9a826] rounded-full"></div>
        <div className="w-2 h-2 bg-white/20 rounded-full"></div>
      </div>

      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
        
        .delay-300 {
          animation-delay: 300ms;
        }
      `}</style>
    </div>
  );
}
