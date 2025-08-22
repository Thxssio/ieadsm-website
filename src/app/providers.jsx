'use client';

import { ThemeProvider } from 'next-themes';
import { AuthProvider } from '@/lib/firebase/AuthContext';
import HideLayoutWrapper from '@/components/HideLayoutWrapper';

export default function Providers({ children }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <AuthProvider>
        <HideLayoutWrapper>{children}</HideLayoutWrapper>
      </AuthProvider>
    </ThemeProvider>
  );
}
