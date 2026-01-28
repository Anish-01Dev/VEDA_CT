import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { AnimatedLoginPage } from '@/components/ui/animated-characters-login-page';
import { AnimatedSignupPage } from './AnimatedSignupPage';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: 'login' | 'signup';
}

export function AuthModal({ isOpen, onClose, defaultMode = 'login' }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'signup'>(defaultMode);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl p-0 bg-transparent border-none shadow-none overflow-hidden">
        <VisuallyHidden>
          <DialogTitle>{mode === 'login' ? 'Sign In' : 'Sign Up'}</DialogTitle>
          <DialogDescription>
            {mode === 'login' ? 'Sign in to your account' : 'Create a new account'}
          </DialogDescription>
        </VisuallyHidden>
        <AnimatePresence mode="wait">
          <motion.div
            key={mode}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="w-full h-[90vh] max-h-[800px] overflow-hidden rounded-lg"
          >
            {mode === 'login' ? (
              <AnimatedLoginPage
                onSwitchToSignup={() => setMode('signup')}
                onClose={onClose}
              />
            ) : (
              <AnimatedSignupPage
                onSwitchToLogin={() => setMode('login')}
                onClose={onClose}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}