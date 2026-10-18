import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type SoundType = 'xp' | 'correct' | 'incorrect' | 'crown' | 'levelUp' | 'click';

interface AudioSettings {
  musicEnabled: boolean;
  sfxEnabled: boolean;
  musicVolume: number;
  sfxVolume: number;
}

interface AudioState extends AudioSettings {
  setMusicEnabled: (enabled: boolean) => void;
  setSfxEnabled: (enabled: boolean) => void;
  setMusicVolume: (volume: number) => void;
  setSfxVolume: (volume: number) => void;
}

// Sound assets - Using high-quality royalty-free placeholders
// User can replace these URLs with local assets in /public/sounds/
const SOUNDS: Record<SoundType, string> = {
  xp: 'https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3', // Short sparkle/pop
  correct: 'https://assets.mixkit.co/active_storage/sfx/2013/2013-preview.mp3', // Positive chime
  incorrect: 'https://assets.mixkit.co/active_storage/sfx/2019/2019-preview.mp3', // Soft thud/error
  crown: 'https://assets.mixkit.co/active_storage/sfx/201 la.mp3', // Fanfare/Victory (placeholder)
  levelUp: 'https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3', // Level up chime
  click: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3', // Soft click
};

const BGM_URL = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'; // Placeholder for Peruvian ambient music

// Background music instance (singleton)
let bgmInstance: HTMLAudioElement | null = null;
const noopAudio = { pause() {}, play: () => Promise.resolve(), volume: 0, currentTime: 0 } as unknown as HTMLAudioElement;
function getBgm(): HTMLAudioElement {
  if (typeof window === "undefined" || typeof Audio === "undefined") return noopAudio;
  if (!bgmInstance) {
    bgmInstance = new Audio(BGM_URL);
    bgmInstance.loop = true;
  }
  return bgmInstance;
}

export const useAudioStore = create<AudioState>()(
  persist(
    (set) => ({
      musicEnabled: true,
      sfxEnabled: true,
      musicVolume: 0.5,
      sfxVolume: 0.7,
      setMusicEnabled: (enabled) => {
        set({ musicEnabled: enabled });
        if (!enabled) getBgm().pause();
        else getBgm().play().catch(() => {}); // Handle autoplay restrictions
      },
      setSfxEnabled: (enabled) => set({ sfxEnabled: enabled }),
      setMusicVolume: (volume) => {
        set({ musicVolume: volume });
        getBgm().volume = volume;
      },
      setSfxVolume: (volume) => set({ sfxVolume: volume }),
    }),
    { name: 'peru-quest-audio-settings' }
  )
);

class SoundManager {
  private static instance: SoundManager;
  private activeSfx: Map<SoundType, HTMLAudioElement> = new Map();

  private constructor() {}

  public static getInstance(): SoundManager {
    if (!SoundManager.instance) {
      SoundManager.instance = new SoundManager();
    }
    return SoundManager.instance;
  }

  public playSfx(type: SoundType) {
    const { sfxEnabled, sfxVolume } = useAudioStore.getState();
    if (!sfxEnabled) return;

    try {
      const soundUrl = SOUNDS[type];
      let audio = this.activeSfx.get(type);

      if (!audio) {
        audio = new Audio(soundUrl);
        this.activeSfx.set(type, audio);
      }

      audio.currentTime = 0;
      audio.volume = sfxVolume;
      audio.play().catch(e => console.warn(`Audio playback failed for ${type}:`, e));
    } catch (error) {
      console.error(`Error playing SFX ${type}:`, error);
    }
  }

  public playMusic() {
    const { musicEnabled, musicVolume } = useAudioStore.getState();
    if (!musicEnabled) return;

    getBgm().volume = musicVolume;
    getBgm().play().catch(e => {
      console.warn('Autoplay blocked. Music will start on first user interaction.');
    });
  }

  public stopMusic() {
    getBgm().pause();
    getBgm().currentTime = 0;
  }

  public updateMusicVolume(volume: number) {
    getBgm().volume = volume;
  }
}

export const soundManager = SoundManager.getInstance();
