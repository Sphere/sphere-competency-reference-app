interface Window {
    fcWidget: {
      on: (event: string, callback: (resp?: any) => void) => void;
      init: () => void;
      setConfig: (config: any) => void;
      hide: () => void;
    };
    sbutility: {
      getDeviceAPILevel: (callback: (entry: string) => void, errorCallback: (err: any) => void) => void;
      checkAppAvailability: (packageName: string, callback: (entry: string) => void, errorCallback: (err: any) => void) => void;
      getDownloadDirectoryPath: (callback: (entry: string) => void, errorCallback: (err: any) => void) => void;
      getAppVersion: (callback: (entry: string) => void, errorCallback: (err: any) => void) => void;
      getAppName: (callback: (entry: string) => void, errorCallback: (err: any) => void) => void;
      getAppPackageName: (callback: (entry: string) => void, errorCallback: (err: any) => void) => void;  
      openPlayStore: (appId: string, callback: (entry: string) => void, errorCallback: (err: any) => void) => void;
      getDeviceInfo: (callback: (entry: string) => void, errorCallback: (err: any) => void) => void;
      getDeviceId: (callback: (entry: string) => void, errorCallback: (err: any) => void) => void;
      getMetaData: (callback: (entry: string) => void, errorCallback: (err: any) => void) => void;
      getApkSize: (callback: (entry: string) => void, errorCallback: (err: any) => void) => void;
      rm: (callback: (entry: string) => void, errorCallback: (err: any) => void) => void;
      readFromAssets: (callback: (entry: string) => void, errorCallback: (err: any) => void) => void;
      clearUtmInfo: (callback: (entry: string) => void, errorCallback: (err: any) => void) => void;
      getUtmInfo: (callback: (entry: string) => void, errorCallback: (err: any) => void) => void;
      exportApk: (callback: (entry: string) => void, errorCallback: (err: any) => void) => void;
      getDeviceSpec: (callback: (entry: string) => void, errorCallback: (err: any) => void) => void;
      getAppVersionName: (callback: (entry: string) => void, errorCallback: (err: any) => void) => void;
      getBuildConfigValue: (callback: (entry: string) => void, errorCallback: (err: any) => void) => void;
      getAppVersionCode: (callback: (entry: string) => void, errorCallback: (err: any) => void) => void;
      getAppIcon: (callback: (entry: string) => void, errorCallback: (err: any) => void) => void;
    }
  }