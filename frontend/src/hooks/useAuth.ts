// src/hooks/useAuth.ts
import { useContext } from 'react';
import { AuthContext, type AuthContextType } from '../context/AuthContextObject'; // Import from the new file

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
