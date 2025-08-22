'use client';

import { ThemeProvider } from 'next-themes';
import { AuthProvider } from '@/lib/firebase/AuthContext';
import HideLayoutWrapper from '@/components/HideLayoutWrapper';

// Theme provider for the public-facing site
export default function Providers({ children }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem
      storageKey="site-theme"
    >
      <AuthProvider>
        <HideLayoutWrapper>{children}</HideLayoutWrapper>
      </AuthProvider>
    </ThemeProvider>
  );
}
