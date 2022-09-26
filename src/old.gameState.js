import {
  SCENES,
  DAY_LENGTH,
  NIGHT_LENGTH,
  getNextHungerTime,
  getNextDieTime,
  getNextPoopTime,
  determineIsRaining,
} from './constants';
import { modFox, modScene, togglePoopBag, writeModal } from './ui';

const gameState = {
  current: 'INIT',
  clock: 1,
  wakeTime: -1,
  sleepTime: -1,
  hungryTime: -1,
  dieTime: -1,
  poopTime: -1,
  timeToStartCelebrating: -1,
  timeToEndCelebrating: -1,
  scene: 0,
  tick() {
    this.clock++;
    // console.log('clock', this.clock);
    if (this.clock === this.wakeTime) {
      this.wake();
    } else if (this.clock === this.sleepTime) {
      this.sleep();
    } else if (this.clock === this.hungryTime) {
      this.getHungry();
    } else if (this.clock === this.dieTime) {
      this.die();
    } else if (this.clock === this.timeToStartCelebrating) {
      this.startCelebrating();
    } else if (this.clock === this.timeToEndCelebrating) {
      this.endCelebrating();
    } else if (this.clock === this.poopTime) {
      this.poop();
    }
    return this.clock;
  },
  startGame() {
    // console.log('hatching');
    this.current = 'HATCHING';
    this.wakeTime = this.clock + 2;
    modFox('egg');
    modScene('day');
    writeModal('');
  },
  wake() {
    // console.log('iddling');
    this.current = 'IDLING';
    this.wakeTime = -1;

    this.scene = determineIsRaining();
    modScene(SCENES[this.scene]);
    this.sleepTime = this.clock + DAY_LENGTH;
    this.hungryTime = getNextHungerTime(this.clock);
    this.determineFoxState();
  },
  sleep() {
    // console.log('sleeping');
    this.state = 'SLEEP';
    modFox('sleep');
    modScene('night');
    this.clearTimes();
    this.wakeTime = this.clock + NIGHT_LENGTH;
  },
  clearTimes() {
    // console.log('clearing times');
    this.wakeTime = -1;
    this.sleepTime = -1;
    this.dieTime = -1;
    this.hungryTime = -1;
    this.poopTime = -1;
    this.timeToStartCelebrating = -1;
    this.timeToEndCelebrating = -1;
  },
  getHungry() {
    // console.log('hungry');
    this.current = 'HUNGRY';
    this.dieTime = getNextDieTime(this.clock);
    this.hungryTime = -1;
    modFox('hungry');
  },
  die() {
    // console.log('dead');
    this.current = 'DEAD';
    modFox('dead');
    modScene('dead');
    this.clearTimes();
    writeModal('You died. <br/> Press the middle button to start over.');
  },
  poop() {
    // console.log('pooping');
    this.current = 'POOPING';
    this.poopTime = -1;
    this.dieTime = getNextDieTime(this.clock);
    modFox('pooping');
  },
  startCelebrating() {
    // console.log('celebrating');
    this.current = 'CELEBRATING';
    modFox('celebrate');
    this.timeToStartCelebrating = -1;
    this.timeToEndCelebrating = this.clock + 2;
  },
  endCelebrating() {
    // console.log('end celebrating');
    this.current = 'IDLING';
    this.timeToEndCelebrating = -1;
    this.determineFoxState();
    togglePoopBag(false);
  },
  determineFoxState() {
    // console.log('determine fox state');
    if (this.current === 'IDLING') {
      if (SCENES[this.scene] === 'rain') {
        modFox('rain');
      } else {
        modFox('idling');
      }
    }
  },

  // USER ACTIONS
  handleUserAction(icon) {
    if (['SLEEP', 'FEEDING', 'CELEBRATING', 'HATCHING'].includes(this.current)) {
      return;
    }
    if (this.current === 'INIT' || this.current === 'DEAD') {
      this.startGame();
      return;
    }

    switch (icon) {
      case 'weather':
        this.changeWeather();
        break;
      case 'poop':
        this.cleanUpPoop();
        break;
      case 'fish':
        this.feed();
        break;
      default:
        new Error('unknown icon', icon);
    }
  },
  changeWeather() {
    // console.log('changing weather');
    this.scene = (this.scene + 1) % SCENES.length;
    modScene(SCENES[this.scene]);
    this.determineFoxState();
  },
  cleanUpPoop() {
    togglePoopBag();
    // console.log('cleaning up poop');
    if (this.current !== 'POOPING') {
      return;
    }
    this.dieTime = -1;
    togglePoopBag();
    this.startCelebrating();
    this.hungryTime = getNextHungerTime(this.clock);
  },
  feed() {
    // console.log('feeding');
    if (this.current !== 'HUNGRY') {
      return;
    }

    this.current = 'FEEDING';
    this.dieTime = -1;
    this.poopTime = getNextPoopTime(this.clock);
    modFox('eating');
    this.timeToStartCelebrating = this.clock + 2;
  },
};

export const handleUserAction = gameState.handleUserAction.bind(gameState);
export default gameState;
