'use client';

import { createContext, useContext } from 'react';
import { User } from '@/types';

type UserContextType = User | null;

export const UserContext = createContext<UserContextType>(null);

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === null) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
