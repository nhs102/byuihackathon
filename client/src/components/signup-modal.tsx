import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { User } from 'lucide-react';

interface SignUpModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (name: string) => void;
  isLoading?: boolean;
}

export function SignUpModal({ open, onClose, onConfirm, isLoading }: SignUpModalProps) {
  const [name, setName] = useState('');

  const handleSubmit = () => {
    if (name.trim()) {
      onConfirm(name.trim());
      setName('');
    }
  };

  const handleClose = () => {
    setName('');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="bg-[#1a2332] border-2 border-[#f9a826] text-white max-w-md shadow-2xl" style={{ backgroundColor: '#1a2332' }}>
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-white" style={{ fontFamily: 'var(--font-headline)' }}>
            Sign Up
          </DialogTitle>
          <DialogDescription className="text-white/80 text-base" style={{ fontFamily: 'var(--font-body)' }}>
            What is your name?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <label htmlFor="name" className="text-white text-sm font-medium block">
              Name
            </label>
            <div className="relative flex items-center">
              <User className="absolute left-4 w-5 h-5 text-[#f9a826] pointer-events-none z-10" />
              <Input
                id="name"
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && name.trim()) {
                    handleSubmit();
                  }
                }}
                className="w-full pl-12 pr-4 bg-white border-2 border-[#f9a826] text-[#1a2332] placeholder:text-[#1a2332]/60 focus:border-[#f9a826] focus:ring-2 focus:ring-[#f9a826]/30 h-12 rounded-xl font-medium"
                style={{ fontFamily: 'var(--font-body)' }}
                autoFocus
              />
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={handleClose}
              variant="outline"
              className="flex-1 border-2 border-white/80 bg-white/10 text-white hover:bg-white/20 hover:text-white hover:border-white h-11 rounded-xl transition-all duration-300 font-semibold"
              style={{ fontFamily: 'var(--font-body)' }}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!name.trim() || isLoading}
              className="flex-1 bg-gradient-to-r from-[#f9a826] to-[#f7931e] text-white hover:from-[#f7931e] hover:to-[#f9a826] shadow-lg h-11 rounded-xl transition-all duration-300 font-bold disabled:opacity-50"
              style={{ fontFamily: 'var(--font-body)' }}
            >
              {isLoading ? 'Creating...' : 'Confirm'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

