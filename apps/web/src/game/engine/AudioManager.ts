// Central Audio Manager for Menu Music, Previews, SFX, and Volume Configuration.

export interface AudioSettings {
  masterVolume: number;
  musicVolume: number;
  sfxVolume: number;
  audioOffsetMs: number;
  keyBindings: "arrows" | "dfjk";
  scrollSpeed: number;
}

const SETTINGS_STORAGE_KEY = "rhythm_battle_settings_v1";

const DEFAULT_SETTINGS: AudioSettings = {
  masterVolume: 0.8,
  musicVolume: 0.75,
  sfxVolume: 0.85,
  audioOffsetMs: 0,
  keyBindings: "arrows",
  scrollSpeed: 450
};

export class AudioManager {
  private static instance: AudioManager | null = null;

  private menuMusic: HTMLAudioElement | null = null;
  private previewAudio: HTMLAudioElement | null = null;
  private previewTimeoutId: number | null = null;
  private settings: AudioSettings = { ...DEFAULT_SETTINGS };

  private constructor() {
    this.loadSettings();
  }

  static getInstance(): AudioManager {
    if (!AudioManager.instance) {
      AudioManager.instance = new AudioManager();
    }
    return AudioManager.instance;
  }

  loadSettings(): AudioSettings {
    if (typeof window === "undefined") {
      return this.settings;
    }
    try {
      const stored = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as Partial<AudioSettings>;
        this.settings = {
          ...DEFAULT_SETTINGS,
          ...parsed
        };
      }
    } catch {
      this.settings = { ...DEFAULT_SETTINGS };
    }
    this.applyVolumeToActiveAudio();
    return this.settings;
  }

  saveSettings(newSettings: Partial<AudioSettings>): AudioSettings {
    this.settings = {
      ...this.settings,
      ...newSettings
    };
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(this.settings));
      } catch {
        // LocalStorage write failed silently
      }
    }
    this.applyVolumeToActiveAudio();
    return this.settings;
  }

  getSettings(): AudioSettings {
    return { ...this.settings };
  }

  private applyVolumeToActiveAudio(): void {
    const musicVol = Math.max(0, Math.min(1, this.settings.masterVolume * this.settings.musicVolume));
    if (this.menuMusic) {
      this.menuMusic.volume = musicVol;
    }
    if (this.previewAudio) {
      this.previewAudio.volume = musicVol;
    }
  }

  playMenuMusic(): void {
    if (typeof window === "undefined") {
      return;
    }
    this.stopPreview();

    if (!this.menuMusic) {
      this.menuMusic = new Audio("/assets/music/freakyMenu.ogg");
      this.menuMusic.loop = true;
    }

    this.applyVolumeToActiveAudio();

    if (this.menuMusic.paused) {
      this.menuMusic.play().catch(() => {
        // Autoplay may be blocked until user interacts with the page
      });
    }
  }

  stopMenuMusic(): void {
    if (this.menuMusic) {
      this.menuMusic.pause();
      this.menuMusic.currentTime = 0;
    }
  }

  playScroll(): void {
    this.playSfx("/assets/sounds/menu/scrollMenu.ogg", 0.6);
  }

  playConfirm(): void {
    this.playSfx("/assets/sounds/menu/confirmMenu.ogg", 0.85);
  }

  playCancel(): void {
    this.playSfx("/assets/sounds/menu/cancelMenu.ogg", 0.75);
  }

  playSfx(path: string, volumeScale = 1.0): void {
    if (typeof window === "undefined") {
      return;
    }
    try {
      const sfx = new Audio(path);
      const effectiveVolume = Math.max(
        0,
        Math.min(1, this.settings.masterVolume * this.settings.sfxVolume * volumeScale)
      );
      sfx.volume = effectiveVolume;
      sfx.play().catch(() => {
        // SFX play error ignored
      });
    } catch {
      // Ignored
    }
  }

  startSongPreview(audioUrl: string): void {
    if (typeof window === "undefined") {
      return;
    }
    this.stopPreview();

    if (!audioUrl || audioUrl.trim().length === 0) {
      return;
    }

    this.previewTimeoutId = window.setTimeout(() => {
      try {
        this.previewAudio = new Audio(audioUrl);
        this.previewAudio.loop = true;
        this.previewAudio.currentTime = 10; // Start 10s into track for energetic preview
        this.applyVolumeToActiveAudio();

        if (this.menuMusic) {
          this.menuMusic.volume =
            Math.max(0, Math.min(1, this.settings.masterVolume * this.settings.musicVolume)) * 0.15;
        }

        this.previewAudio.play().catch(() => {
          // Playback blocked or failed
        });
      } catch {
        // Preview failed
      }
    }, 350);
  }

  stopPreview(): void {
    if (this.previewTimeoutId !== null) {
      window.clearTimeout(this.previewTimeoutId);
      this.previewTimeoutId = null;
    }
    if (this.previewAudio) {
      this.previewAudio.pause();
      this.previewAudio.currentTime = 0;
      this.previewAudio = null;
    }
    if (this.menuMusic) {
      this.applyVolumeToActiveAudio();
    }
  }

  stopAll(): void {
    this.stopMenuMusic();
    this.stopPreview();
  }
}
