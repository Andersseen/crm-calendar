import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.crm.estetica',
  appName: 'CRM Calendar',
  webDir: 'dist/mobile-ionic/browser',
  server: {
    androidScheme: 'https',
  },
};

export default config;
