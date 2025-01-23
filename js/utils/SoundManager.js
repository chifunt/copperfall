import { SoundEffects } from './SoundEffects.js';

class SoundManager {
  constructor() {
    // This will hold references to all loaded audio elements
    this.audioMap = {};

    // Volume master control if you want to have a global volume
    this.masterVolume = 1.0;

    // Optionally, preload sounds right away
    this.preloadAllSounds();
  }

  preloadAllSounds() {
    Object.keys(SoundEffects).forEach((key) => {
      const { fileName } = SoundEffects[key];
      // Construct a full path to the sfx directory
      const audioPath = `../../assets/audio/sfx/${fileName}`;
      const audio = new Audio(audioPath);

      // Store it in the audioMap under the same key
      this.audioMap[key] = audio;
    });
  }

  /**
   * Play a sound by referencing one of the SoundEffects keys.
   * @param {Object} sfxObject - The object from SoundEffects, e.g. SoundEffects.DASH
   */
  playSound(sfxObject) {
    const { fileName, volume } = sfxObject;
    // Find which key in SoundEffects matches this object (or pass in the key directly)
    const key = Object.keys(SoundEffects).find(
      (soundKey) => SoundEffects[soundKey] === sfxObject
    );

    if (!key) {
      console.warn('SoundManager: Unknown sound effect', sfxObject);
      return;
    }

    const audioElem = this.audioMap[key];
    if (!audioElem) {
      // If it wasn't preloaded, load it now (lazy loading fallback)
      const audioPath = `../../assets/audio/sfx/${fileName}`;
      this.audioMap[key] = new Audio(audioPath);
    }

    // Ensure we have the updated Audio object
    const audioToPlay = this.audioMap[key];
    audioToPlay.volume = volume * this.masterVolume;

    // If you want overlapping sounds, clone the node:
    //   const clone = audioToPlay.cloneNode();
    //   clone.volume = audioToPlay.volume;
    //   clone.play();

    // Otherwise, just play the existing one:
    audioToPlay.currentTime = 0; // restart sound if it's already playing
    audioToPlay.play();
  }

  setMasterVolume(value) {
    this.masterVolume = value;
  }
}

// Create and export a single instance (singleton)
export const soundManager = new SoundManager();
