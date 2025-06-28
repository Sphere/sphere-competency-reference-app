import "@angular/compiler"
import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app/app.module';
import { configuration } from '../configurations/configuration';
import { hmrBootstrap } from './hmr';
import 'reflect-metadata';
import 'hammerjs';
import { SplashScreen } from "@capacitor/splash-screen";
import * as dayjs from 'dayjs';

window.dayjs = dayjs;
window.dayjs.extend(require('dayjs/plugin/duration'));

if (configuration.development) {
  enableProdMode();
}

const bootstrap: any = async () => {
  try {
    await platformBrowserDynamic().bootstrapModule(AppModule);
    setTimeout(() => {
      SplashScreen.hide(); // Hide the splash screen after app initialization
    }, 1000);
  } catch (err) {
    console.error("Bootstrap error:", err);
  }
};

if (configuration.hmr) {
  if (module['hot']) {
    hmrBootstrap(module, bootstrap);
  } else {
    console.error('HMR is not enabled for webpack-dev-server!');
    console.log('Are you using the --hmr flag for ng serve?');
  }
} else {
  bootstrap();
}
