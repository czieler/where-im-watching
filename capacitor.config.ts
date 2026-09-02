import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.czielerworks.whereimwatching',
  appName: "Where I'm Watching",
  webDir: 'dist',
  backgroundColor: '#f8fafc',
  ios: {
    backgroundColor: '#f8fafc',
    contentInset: 'never',
    preferredContentMode: 'mobile',
    allowsLinkPreview: false,
  },
};

export default config;
