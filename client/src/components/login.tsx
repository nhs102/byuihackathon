import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { customSignUp, customSignIn, type CustomUser } from '../services/authService';
import { Loader2, Mail, UserPlus, Sparkles } from 'lucide-react';

interface LoginProps {
  onLoginSuccess: (user: CustomUser) => void;
}

export function Login({ onLoginSuccess }: LoginProps) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [isNameModalOpen, setIsNameModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [emailError, setEmailError] = useState('');

  // Email validation
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    setEmailError('');
    setError('');
  };

  const handleSignUp = () => {
    setError('');
    setEmailError('');

    if (!email.trim()) {
      setEmailError('Email is required');
      return;
    }

    if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address');
      return;
    }

    // Open modal to ask for name
    setIsNameModalOpen(true);
  };

  const handleSignIn = async () => {
    setError('');
    setEmailError('');

    if (!email.trim()) {
      setEmailError('Email is required');
      return;
    }

    if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);

    try {
      const user = await customSignIn(email);
      onLoginSuccess(user);
    } catch (err: any) {
      setError(err.message || 'Sign in failed. Please check your email.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmSignUp = async () => {
    setError('');

    if (!name.trim()) {
      setError('Name is required');
      return;
    }

    setIsLoading(true);

    try {
      const user = await customSignUp(email, name);
      setIsNameModalOpen(false);
      onLoginSuccess(user);
    } catch (err: any) {
      setError(err.message || 'Sign up failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleModalClose = () => {
    if (!isLoading) {
      setIsNameModalOpen(false);
      setName('');
      setError('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>, action: () => void) => {
    if (e.key === 'Enter') {
      action();
    }
  };

  return (
    <>
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
            {/* Email Input */}
            <div className="space-y-2">
              <label htmlFor="email" className="text-white/80 text-sm font-medium block">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/50" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={handleEmailChange}
                  onKeyPress={(e) => handleKeyPress(e, handleSignIn)}
                  className="pl-12 pr-4 bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-[#f9a826] focus:ring-[#f9a826]/20 h-12 rounded-xl"
                  style={{ fontFamily: 'var(--font-body)' }}
                  disabled={isLoading}
                />
              </div>
              {emailError && (
                <p className="text-yellow-300 text-base font-bold" style={{ fontFamily: 'var(--font-body)', color: '#fef08a' }}>
                  {emailError}
                </p>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-4 bg-yellow-500/25 border-2 border-yellow-400/60 rounded-xl shadow-lg">
                <p className="text-yellow-200 text-base text-center font-bold" style={{ fontFamily: 'var(--font-body)', color: '#fef08a' }}>
                  {error}
                </p>
              </div>
            )}

            {/* Sign In Button */}
            <Button 
              onClick={handleSignIn}
              disabled={!email.trim() || isLoading}
              className="w-full bg-gradient-to-r from-[#f9a826] to-[#f7931e] text-[#1a2332] hover:from-[#f7931e] hover:to-[#f9a826] shadow-lg shadow-[#f9a826]/20 h-12 rounded-xl transition-all duration-300 hover:shadow-xl hover:shadow-[#f9a826]/30 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              style={{ 
                fontFamily: 'var(--font-body)',
                fontWeight: 'var(--font-weight-semibold)'
              }}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
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
              onClick={handleSignUp}
              disabled={!email.trim() || isLoading}
              className="w-full bg-gradient-to-r from-[#f9a826] to-[#f7931e] text-[#1a2332] hover:from-[#f7931e] hover:to-[#f9a826] shadow-lg shadow-[#f9a826]/20 h-12 rounded-xl transition-all duration-300 hover:shadow-xl hover:shadow-[#f9a826]/30 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              style={{ 
                fontFamily: 'var(--font-body)',
                fontWeight: 'var(--font-weight-semibold)'
              }}
            >
              <UserPlus className="w-5 h-5 mr-2" />
              Sign Up
            </Button>
          </div>

          {/* Info Notice */}
          <div className="mt-8 p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 max-w-sm">
            <p className="text-white/60 text-sm text-center leading-relaxed" style={{ fontFamily: 'var(--font-body)' }}>
              Enter your email to sign in or create a new account
            </p>
          </div>

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

      {/* Name Input Modal */}
      <Dialog open={isNameModalOpen} onOpenChange={handleModalClose}>
        <DialogContent className="sm:max-w-md bg-[#1a2332] border-white/20">
          <DialogHeader>
            <DialogTitle 
              className="text-2xl text-white"
              style={{ 
                fontFamily: 'var(--font-headline)',
                fontWeight: 'var(--font-weight-bold)'
              }}
            >
              What is your name?
            </DialogTitle>
            <DialogDescription 
              className="text-white/60"
              style={{ fontFamily: 'var(--font-body)' }}
            >
              Please enter your name to complete the registration
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label 
                htmlFor="name" 
                className="text-white/80 text-sm font-medium block"
                style={{ fontFamily: 'var(--font-body)' }}
              >
                Full Name
              </label>
              <Input
                id="name"
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setError('');
                }}
                onKeyPress={(e) => handleKeyPress(e, handleConfirmSignUp)}
                className="bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-[#f9a826] focus:ring-[#f9a826]/20 h-12 rounded-xl"
                style={{ fontFamily: 'var(--font-body)' }}
                disabled={isLoading}
                autoFocus
              />
            </div>

            {error && (
              <div className="p-4 bg-yellow-500/25 border-2 border-yellow-400/60 rounded-xl shadow-lg">
                <p className="text-yellow-200 text-base font-bold" style={{ fontFamily: 'var(--font-body)', color: '#fef08a' }}>
                  {error}
                </p>
              </div>
            )}
          </div>

          <DialogFooter className="flex gap-2 sm:gap-2">
            <Button
              type="button"
              onClick={handleModalClose}
              disabled={isLoading}
              className="flex-1 bg-gradient-to-r from-[#f9a826] to-[#f7931e] text-[#1a2332] hover:from-[#f7931e] hover:to-[#f9a826] h-11 rounded-xl"
              style={{ 
                fontFamily: 'var(--font-body)',
                fontWeight: 'var(--font-weight-semibold)'
              }}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleConfirmSignUp}
              disabled={isLoading || !name.trim()}
              className="flex-1 bg-gradient-to-r from-[#f9a826] to-[#f7931e] text-[#1a2332] hover:from-[#f7931e] hover:to-[#f9a826] h-11 rounded-xl"
              style={{ 
                fontFamily: 'var(--font-body)',
                fontWeight: 'var(--font-weight-semibold)'
              }}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Confirm'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

