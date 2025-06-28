import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app_id',
  appName: 'app_name',
  webDir: 'www',
  loggingBehavior: "none",
  server: {
    androidScheme: 'http'
  },
  android:{
    webContentsDebuggingEnabled: true,
    allowMixedContent:true,
  },
  
  // cordova: {
  //   preferences: {
  //     ScrollEnabled: 'false',
  //     'android-minSdkVersion': '22',
  //     BackupWebStorage: 'none',
  //     Orientation: 'portrait',
  //     AndroidLaunchMode: 'singleInstance',
  //     KeyboardDisplayRequiresUserAction: 'false',
  //     GradlePluginGoogleServicesEnabled: 'false',
  //     SplashScreenDelay: '2000'
  //   }
  // },
  plugins: {
    FCMPlugin: {
      "ANDROID_FIREBASE_BOM_VERSION": "26.5.0",
      "GRADLE_TOOLS_VERSION": "8.0.0",
      "GOOGLE_SERVICES_VERSION": "4.3.15",
      "ANDROID_DEFAULT_NOTIFICATION_ICON": "@mipmap/ic_launcher"
    },
    customtabs: {
      "URL_SCHEME": "org.sunbird.app",
      "URL_HOST": "mobile",
    },
    "window.plugins.googleplus": {
      "PLAY_SERVICES_VERSION": "15.0.1"
    },
    SplashScreen: {
      launchShowDuration: 5000,
      launchAutoHide: true,
      backgroundColor: '#ffffff',
      androidSplashResourceName: 'splash',
      splashFullScreen: true,
      splashImmersive: true,
    },
    LocalNotifications: {
      iconColor: "#488AFF",
      smallIcon: 'mipmap-hdpi-icon/ic_launcher',
      sound: "beep.wav",
    },
    SocialSharing: {
      
    }
  },
};

export default config;
