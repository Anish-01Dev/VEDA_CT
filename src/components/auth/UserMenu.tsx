import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { User, Settings, FileText, LogOut, Heart } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { useLanguage } from '@/contexts/language-context';
import { useNavigate } from 'react-router-dom';

export function UserMenu() {
  const { user, signOut } = useAuth();
  const { currentLanguage } = useLanguage();
  const navigate = useNavigate();

  if (!user) return null;

  const handleSignOut = async () => {
    await signOut();
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const displayName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 sm:h-10 sm:w-10 rounded-full">
          <Avatar className="h-8 w-8 sm:h-10 sm:w-10">
            <AvatarFallback className="bg-[#4A9B8E] text-white text-xs sm:text-sm">
              {getInitials(displayName)}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-52 sm:w-56" align="end" forceMount>
        <div className="flex items-center justify-start gap-2 p-2">
          <div className="flex flex-col space-y-1 leading-none">
            <p className="font-medium text-sm">{displayName}</p>
            <p className="w-[180px] sm:w-[200px] truncate text-xs sm:text-sm text-muted-foreground">
              {user.email}
            </p>
          </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => navigate('/health-records')} className="text-sm">
          <FileText className="mr-2 h-4 w-4" />
          <span>{currentLanguage === 'hi' ? 'स्वास्थ्य रिकॉर्ड' : 'Health Records'}</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate('/health')} className="text-sm">
          <Heart className="mr-2 h-4 w-4" />
          <span>{currentLanguage === 'hi' ? 'स्वास्थ्य डैशबोर्ड' : 'Health Dashboard'}</span>
        </DropdownMenuItem>
        <DropdownMenuItem className="text-sm">
          <Settings className="mr-2 h-4 w-4" />
          <span>{currentLanguage === 'hi' ? 'सेटिंग्स' : 'Settings'}</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut} className="text-sm">
          <LogOut className="mr-2 h-4 w-4" />
          <span>{currentLanguage === 'hi' ? 'लॉग आउट' : 'Log out'}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}