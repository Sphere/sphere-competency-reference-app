import videojs from 'video.js';

declare module 'video.js' {
  interface VideoJsPlayer {
    landscapeFullscreen(options?: {
      fullscreen: {
        enterOnRotate: boolean;
        exitOnRotate: boolean;
        alwaysInLandscapeMode: boolean;
        iOS: boolean;
      };
    }): any;
  }
}
