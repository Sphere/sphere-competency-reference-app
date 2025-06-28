import { Injectable } from '@angular/core';
import { AppVersion } from '@awesome-cordova-plugins/app-version/ngx';
import * as _ from 'lodash-es';

@Injectable({
  providedIn: 'root'
})
export class AppFrameworkDetectorService {
  constructor(private appVersion: AppVersion) {}

  async getPackageName(): Promise<string> {
    try {
      const packageName = await this.appVersion.getPackageName();
      return packageName;
    } catch (error) {
      console.warn('Failed to get the package name:--', error);
      return '';
    }
  }

  isSphereApp(packageName: string): boolean {
    return _.startsWith(packageName, 'com.aastrika.sphere');
  }

  isEkshamataApp(packageName: string): boolean {
    return _.startsWith(packageName, 'org.aastrika.ekshamata');
  }
 
  async detectAppFramework(): Promise<string> {
    const packageName = await this.getPackageName();
    if (this.isSphereApp(packageName)) {
      return 'Sphere';
    } else if (this.isEkshamataApp(packageName)) {
      return 'Ekshamata';
    } else {
      return 'Unknown';
    }
  }
}
