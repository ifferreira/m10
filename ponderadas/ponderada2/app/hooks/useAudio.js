import { useState, useEffect } from 'react';
import { Audio } from 'expo-av';

const DOUBT_SOUNDS = [
  require('../assets/duvidooooo.mp3'),
  require('../assets/duvido.mp3'),
  require('../assets/euduvidomc.mp3')
];

const LIE_SOUND = require('../assets/lula-mentirada-danada.mp3');
const TRUTH_SOUND = require('../assets/serjao-verdade-naominto-meme.mp3');

export function useAudio() {
  const [sounds, setSounds] = useState([]);
  const [lieSound, setLieSound] = useState(null);
  const [truthSound, setTruthSound] = useState(null);

  useEffect(() => {
    const setupAudio = async () => {
      try {
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          staysActiveInBackground: true,
          shouldDuckAndroid: true,
        });
        const loadedSounds = await Promise.all(
          DOUBT_SOUNDS.map(async (soundFile) => {
            const { sound } = await Audio.Sound.createAsync(soundFile);
            return sound;
          })
        );
        setSounds(loadedSounds);

        const { sound: lie } = await Audio.Sound.createAsync(LIE_SOUND);
        const { sound: truth } = await Audio.Sound.createAsync(TRUTH_SOUND);
        setLieSound(lie);
        setTruthSound(truth);
      } catch (error) {
        console.log('Erro ao configurar áudio:', error);
      }
    };
    setupAudio();

    return () => {
      sounds.forEach(sound => {
        if (sound) {
          sound.unloadAsync();
        }
      });
      if (lieSound) lieSound.unloadAsync();
      if (truthSound) truthSound.unloadAsync();
    };
  }, []);

  async function playDoubtSound() {
    try {
      if (sounds.length === 0) return;
      await Promise.all(sounds.map(sound => sound.stopAsync()));
      const randomSound = sounds[Math.floor(Math.random() * sounds.length)];
      await randomSound.setPositionAsync(0);
      await randomSound.playAsync();
    } catch (error) {
      console.log('Erro ao tocar som:', error);
    }
  }

  async function playLieSound() {
    try {
      if (!lieSound) return;
      await lieSound.setPositionAsync(0);
      await lieSound.playAsync();
    } catch (error) {
      console.log('Erro ao tocar som de mentira:', error);
    }
  }

  async function playTruthSound() {
    try {
      if (!truthSound) return;
      await truthSound.setPositionAsync(0);
      await truthSound.playAsync();
    } catch (error) {
      console.log('Erro ao tocar som de verdade:', error);
    }
  }

  return { playDoubtSound, playLieSound, playTruthSound };
}

