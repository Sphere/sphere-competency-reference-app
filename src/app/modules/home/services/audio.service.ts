import { Injectable } from "@angular/core";
import { Capacitor } from "@capacitor/core";
import { NativeAudio } from "@capacitor-community/native-audio";
import { Platform } from "@ionic/angular";
import * as _ from "lodash-es";

export interface AudioConfig {
  id: string;
  path: string;
  language: string;
  type: "success" | "failure" | "notification";
}

@Injectable({ providedIn: "root" })
export class AudioService {
  private audioConfigs: AudioConfig[] = [
    {
      id: "success_en",
      path: "level-completion-page-english.mp3",
      language: "en",
      type: "success",
    },
    {
      id: "success_hi",
      path: "level-completion-page-hindi.mp3",
      language: "hi",
      type: "success",
    },
    {
      id: "failure_hi",
      path: "level-fail-page-hindi.mp3",
      language: "hi",
      type: "failure",
    },
    {
      id: "failure_en",
      path: "level-fail-page-english.mp3",
      language: "en",
      type: "failure",
    },
    {
      id: "competency_success_en",
      path: "competency-completion-page-english.mp3",
      language: "en",
      type: "success",
    },
    {
      id: "competency_success_hi",
      path: "competency-completion-page-hindi.mp3",
      language: "hi",
      type: "success",
    },
  ];

  private loadedAudios: Set<string> = new Set();
  private currentPlayingAudio: string | null = null;
  private isInitialized = false;
  private initializationPromise: Promise<void> | null = null;
  private readonly maxRetries = 3;
  private readonly retryDelay = 500; // ms

  constructor(private platform: Platform) {
    this.initializeAudioService();
  }

  private async initializeAudioService(): Promise<void> {
    // Prevent multiple initialization calls
    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    if (this.isInitialized) {
      console.log('Audio service already initialized');
      return;
    }

    this.initializationPromise = this.performInitialization();
    return this.initializationPromise;
  }

  private async performInitialization(): Promise<void> {
    try {
      await this.platform.ready();
      
      if (!this.platform.is("android") && !this.platform.is("ios")) {
        console.log('Not on mobile platform - skipping audio initialization');
        this.isInitialized = true;
        return;
      }

      // Clean up any existing assets first
      await this.cleanupExistingAudios();

      // Preload all audio files with parallel processing
      const preloadPromises = this.audioConfigs.map(config => 
        this.tryPreloadAudioWithRetry(config).catch(error => {
          console.error(`Failed to preload ${config.id}:`, error);
        })
      );
      
      await Promise.all(preloadPromises);

      this.isInitialized = true;

      const status = this.getInitializationStatus();
      if (status.loadedCount === 0) {
        console.warn("No audio files were loaded successfully. Check file paths and permissions.");
      } else {
        console.log(`Audio service initialized. Loaded ${status.loadedCount}/${status.totalCount} audio files.`);
      }
    } catch (error) {
      console.error('Failed to initialize audio service:', error);
      this.isInitialized = true; // Set to true to prevent infinite retry
    }
  }

  private async cleanupExistingAudios(): Promise<void> {
    const cleanupPromises = this.audioConfigs.map(async (config) => {
      try {
        await NativeAudio.unload({ assetId: config.id });
      } catch (error) {
        // Ignore cleanup errors - asset might not exist
      }
    });

    await Promise.all(cleanupPromises);
    this.loadedAudios.clear();
  }

  private async isAssetLoaded(assetId: string): Promise<boolean> {
    try {
      await NativeAudio.getDuration({ assetId });
      return true;
    } catch (error) {
      return false;
    }
  }

  private async tryPreloadAudioWithRetry(config: AudioConfig, retryCount = 0): Promise<void> {
    try {
      await this.tryPreloadAudio(config);
    } catch (error) {
      if (retryCount < this.maxRetries) {
        console.warn(`Retrying preload for ${config.id} (attempt ${retryCount + 1}/${this.maxRetries})`);
        await this.delay(this.retryDelay * (retryCount + 1)); // Exponential backoff
        return this.tryPreloadAudioWithRetry(config, retryCount + 1);
      }
      console.error(`Failed to preload ${config.id} after ${this.maxRetries} attempts`);
    }
  }

  private async tryPreloadAudio(config: AudioConfig): Promise<void> {
    // Check if already tracked as loaded
    if (this.loadedAudios.has(config.id)) {
      console.log(`Audio "${config.id}" is already tracked as preloaded`);
      return;
    }

    // Check if asset exists in native plugin
    const assetExists = await this.isAssetLoaded(config.id);
    if (assetExists) {
      console.log(`Audio asset "${config.id}" already exists in native plugin`);
      this.loadedAudios.add(config.id);
      return;
    }

    const assetPath = this.getAssetPath(config.path);

    try {
      await NativeAudio.preload({
        assetId: config.id,
        assetPath: assetPath,
        audioChannelNum: 1,
        isUrl: false,
      });
      
      this.loadedAudios.add(config.id);
      console.log(`Successfully preloaded audio: ${config.id} from path: ${assetPath}`);
      
    } catch (error) {
      const errorMessage = (error as any)?.message || '';
      
      // Handle "already exists" as success
      if (this.isAlreadyExistsError(errorMessage)) {
        console.log(`Audio asset already exists: ${config.id} - treating as loaded`);
        this.loadedAudios.add(config.id);
        return;
      }

      console.error(`Failed to preload ${config.id} from path: ${assetPath}`, error);
      
      // Try alternative paths
      await this.tryAlternativePaths(config);
    }
  }

  private isAlreadyExistsError(errorMessage: string): boolean {
    const existsPatterns = [
      'Audio Asset already exists',
      'already loaded',
      'duplicate',
      'asset exists',
      'already preloaded'
    ];
    
    return existsPatterns.some(pattern => 
      errorMessage.toLowerCase().includes(pattern.toLowerCase())
    );
  }

  private async tryAlternativePaths(config: AudioConfig): Promise<void> {
    if (this.loadedAudios.has(config.id)) {
      return;
    }

    const alternativePaths = [
      `assets/audio/${config.path}`,
      `www/assets/audio/${config.path}`,
      config.path,
      `android_asset/www/assets/audio/${config.path}`, // Android specific
      `/android_asset/www/assets/audio/${config.path}` // Android with leading slash
    ];

    for (const altPath of alternativePaths) {
      try {
        console.log(`Trying fallback path for ${config.id}: ${altPath}`);
        
        await NativeAudio.preload({
          assetId: config.id,
          assetPath: altPath,
          audioChannelNum: 1,
          isUrl: false,
        });
        
        this.loadedAudios.add(config.id);
        console.log(`Successfully preloaded ${config.id} using fallback path: ${altPath}`);
        return;
        
      } catch (error) {
        const errorMessage = (error as any)?.message || '';
        
        if (this.isAlreadyExistsError(errorMessage)) {
          console.log(`Audio asset already exists (fallback): ${config.id}`);
          this.loadedAudios.add(config.id);
          return;
        }
        
        console.warn(`Fallback path failed for ${config.id}: ${altPath}`);
      }
    }

    console.error(`All paths failed for ${config.id}. File may be missing or corrupted.`);
  }

  private getAssetPath(filename: string): string {
    if (Capacitor.isNativePlatform()) {
      return `public/assets/audio/${filename}`;
    }
    return `assets/audio/${filename}`;
  }

  private async ensureInitialized(): Promise<void> {
    if (!this.isInitialized) {
      await this.initializeAudioService();
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async tryPlayAudio(config: AudioConfig): Promise<void> {
    await this.stopCurrentAudio();

    // Ensure audio is loaded
    if (!this.loadedAudios.has(config.id)) {
      console.log(`Audio ${config.id} not loaded, attempting to preload...`);
      await this.tryPreloadAudioWithRetry(config);
    }

    if (!this.loadedAudios.has(config.id)) {
      console.error(`Cannot play ${config.id}: audio not loaded after retry`);
      return;
    }

    try {
      await NativeAudio.play({ assetId: config.id });
      this.currentPlayingAudio = config.id;
      console.log(`Playing audio: ${config.id}`);
    } catch (error) {
      console.error(`Error playing ${config.id}:`, error);
      
      // Try to reload and play again
      try {
        await this.tryPreloadAudioWithRetry(config);
        if (this.loadedAudios.has(config.id)) {
          await NativeAudio.play({ assetId: config.id });
          this.currentPlayingAudio = config.id;
          console.log(`Successfully played ${config.id} after reload`);
        }
      } catch (retryError) {
        console.error(`Failed to play ${config.id} even after reload:`, retryError);
      }
    }
  }

  private getConfig(type: "success" | "failure", language: string): AudioConfig | undefined {
    return _.find(this.audioConfigs, { type, language }) || 
           _.find(this.audioConfigs, { type, language: "en" });
  }

  // Public Methods
  async playAudioById(id: string): Promise<void> {
    await this.ensureInitialized();
    
    const config = this.audioConfigs.find(c => c.id === id);
    if (!config) {
      console.warn(`Audio with id ${id} not found in configs.`);
      return;
    }
    
    await this.tryPlayAudio(config);
  }

  async playSuccessAudio(language: string = "en"): Promise<void> {
    await this.ensureInitialized();
    
    const config = this.getConfig("success", language);
    if (config) {
      await this.tryPlayAudio(config);
    } else {
      console.warn(`No success audio found for language: ${language}`);
    }
  }

  async playFailureAudio(language: string = "en"): Promise<void> {
    await this.ensureInitialized();
    
    const config = this.getConfig("failure", language);
    if (config) {
      await this.tryPlayAudio(config);
    } else {
      console.warn(`No failure audio found for language: ${language}`);
    }
  }

  async stopCurrentAudio(): Promise<void> {
    if (!this.currentPlayingAudio) return;

    try {
      await NativeAudio.stop({ assetId: this.currentPlayingAudio });
      console.log(`Stopped audio: ${this.currentPlayingAudio}`);
    } catch (error) {
      console.warn(`Failed to stop audio: ${this.currentPlayingAudio}`, error);
    } finally {
      this.currentPlayingAudio = null;
    }
  }

  async stopAllAudio(): Promise<void> {
    await this.stopCurrentAudio();
    
    const unloadPromises = Array.from(this.loadedAudios).map(async (id) => {
      try {
        await NativeAudio.unload({ assetId: id });
      } catch (error) {
        console.warn(`Failed to unload audio: ${id}`, error);
      }
    });

    await Promise.all(unloadPromises);
    this.loadedAudios.clear();
  }

  async reloadAudio(audioId: string): Promise<void> {
    const config = this.audioConfigs.find(c => c.id === audioId);
    if (!config) {
      console.warn(`Audio config not found for id: ${audioId}`);
      return;
    }

    // Remove from loaded set and try to unload
    this.loadedAudios.delete(audioId);
    try {
      await NativeAudio.unload({ assetId: audioId });
    } catch (error) {
      // Ignore unload errors
    }

    // Reload
    await this.tryPreloadAudioWithRetry(config);
  }

  // Utility Methods
  isReady(): boolean {
    return this.isInitialized;
  }

  isPlaying(): boolean {
    return !!this.currentPlayingAudio;
  }

  getCurrentlyPlaying(): string | null {
    return this.currentPlayingAudio;
  }

  getLoadedAudios(): string[] {
    return Array.from(this.loadedAudios);
  }

  getInitializationStatus() {
    return {
      isInitialized: this.isInitialized,
      loadedCount: this.loadedAudios.size,
      totalCount: this.audioConfigs.length,
      loadedAudios: Array.from(this.loadedAudios),
      platform: {
        isNative: Capacitor.isNativePlatform(),
        platform: Capacitor.getPlatform(),
      },
    };
  }

  addAudioConfig(config: AudioConfig): void {
    const existing = _.find(this.audioConfigs, { id: config.id });
    if (existing) {
      Object.assign(existing, config);
    } else {
      this.audioConfigs.push(config);
    }

    // If service is already initialized, preload the new audio
    if (this.isInitialized) {
      this.tryPreloadAudioWithRetry(config).catch(error => {
        console.error(`Failed to preload newly added audio ${config.id}:`, error);
      });
    }
  }

  removeAudioConfig(audioId: string): void {
    _.remove(this.audioConfigs, (c) => c.id === audioId);
    this.loadedAudios.delete(audioId);
    
    // Try to unload the audio
    NativeAudio.unload({ assetId: audioId }).catch(error => {
      console.warn(`Failed to unload removed audio ${audioId}:`, error);
    });
  }
}