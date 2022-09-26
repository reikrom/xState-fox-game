export const TICK_RATE = 2000;
export const ICONS = ['fish', 'poop', 'weather'];
export const RAIN_CHANCE = 0.2;
export const SCENES = ['day', 'rain'];
export const DAY_LENGTH = 60;
export const NIGHT_LENGTH = 10;

export const getNextHungerTime = (time: number) =>
  Math.floor(Math.random() + 2) * 5 + time;
export const getNextDieTime = (time: number) => Math.floor(Math.random() + 4) * 8 + time;
export const getNextPoopTime = (time: number) => Math.floor(Math.random() + 2) * 5 + time;
export const determineIsRaining = () => (Math.random() > RAIN_CHANCE ? 0 : 1);
