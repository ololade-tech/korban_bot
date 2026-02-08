'use client';

import { PrivyProvider } from '@privy-io/react-auth';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID || 'insert-your-privy-app-id-here'}
      config={{
        // Customize the look and feel for a premium dark mode experience
        appearance: {
          theme: 'dark',
          accentColor: '#FF8C00', // Deep Orange
          logo: 'https://github.com/ololade-tech.png',
        },
        // Embedded wallets allow the bot to trade seamlessly
        embeddedWallets: {
          createOnLogin: 'users-without-wallets',
        },
      }}
    >
      {children}
    </PrivyProvider>
  );
}
