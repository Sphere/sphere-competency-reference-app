import { Injectable } from '@angular/core';
import { AppGlobalService } from '../../../../../services';
import { Storage } from '@capacitor/storage';

@Injectable({
  providedIn: 'root',
})
export class LocalStorageService {
  constructor(private appGlobalService: AppGlobalService) {}

  async setLocalStorage(key: string, value: any): Promise<void> {
    try {
      const userId = await this.appGlobalService.getActiveProfileUid();
      key = userId + key;
      await Storage.set({ key, value: JSON.stringify(value) });
    } catch (error) {
      console.error('Error setting storage', error);
      throw error;
    }
  }

  async getLocalStorage(key: string): Promise<any> {
    try {
      const userId = await this.appGlobalService.getActiveProfileUid();
      key = userId + key;
      const { value } = await Storage.get({ key });
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('Error getting storage', error);
      throw error;
    }
  }

  async deleteAllStorage(): Promise<void> {
    try {
      await Storage.clear();
    } catch (error) {
      console.error('Error clearing storage', error);
      throw error;
    }
  }

  async deleteOneStorage(key: string, courseId?: string): Promise<void> {
    try {
      const userId = await this.appGlobalService.getActiveProfileUid();
      key = userId + key;
      if (courseId) {
        const { value } = await Storage.get({ key });
        const parsedValue = value ? JSON.parse(value) : null;
        const updatedArray = parsedValue.filter(item => item.courseId !== courseId);
        await Storage.set({
          key: key,
          value: JSON.stringify(updatedArray),
         });
      } else {
      await Storage.remove({ key });
      }
    } catch (error) {
      console.error('Error deleting storage item', error);
      throw error;
    }
  }

  async hasKey(key: string): Promise<boolean> {
    try {
      const userId = await this.appGlobalService.getActiveProfileUid();
      key = userId + key;
      const { keys } = await Storage.keys();
      return keys.includes(key);
    } catch (error) {
      console.error('Error checking key', error);
      throw error;
    }
  }
}
