// src/hooks/useAuth.ts
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContextDefinition'; // Import AuthContext and AuthContextType from new definition file

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};