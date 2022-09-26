import { assign, createMachine } from 'xstate';
import { raise } from 'xstate/lib/actions';
import {
  DAY_LENGTH,
  getNextDieTime,
  getNextHungerTime,
  getNextPoopTime,
  NIGHT_LENGTH,
} from '../assets/constants';

interface GameContext {
  time: number;
  deathTime: null | number;
  poopTime: null | number;
  hungerTime: null | number;
  sleepTime: null | number;
  awakeTime: null | number;
  canFeed: boolean;
  canClean: boolean;
  rainChance: number;
}
type GameEvents =
  | { type: 'START_GAME' }
  | { type: 'always' }
  | { type: 'PAUSE_GAME' }
  | { type: 'TICK' }
  | { type: 'WAKE' }
  | { type: 'SLEEP' }
  | { type: 'GET_HUNGRY' }
  | { type: 'DIE' }
  | { type: 'POOP' }
  | { type: 'FEED' }
  | { type: 'CLEAN_POOP' }
  | { type: 'RANDOMIZE_DAY' }
  | { type: 'NIGHT_TIME' }
  | { type: 'modFox' }
  | { type: 'setSunny' }
  | { type: 'setRaining' }
  | { type: 'modFox'; value: string };

export const gameMachine =
  /** @xstate-layout N4IgpgJg5mDOIC5QDMD2APAtFAhgWzADoBLAO2IBcBiAZQBUBBAJToH0BxBgWQFFFQADqliViqUvxDpEARgCccwgFYATEoAcANm0AGOQHZNAZiMAWADQgAnoiM7NhTTv0zNS-aZkqdM9QF8-SzQsXAJCBgAbYgA3IgAJBjoAYTiASQA5dipJIREKMQkkKUQlJ0IjOVNTJzljdQrNSxsEfSN1Qi1alQ8VJ30df0CQYOx8IkiY+IBVTKYATSoAMR4eABEc4VFxSWkEGSVSwj1nAyUdFVMDIybEN1NCC-k5dU91HR0jfQCgjFGwidihCSPAAMjwAEJMRIZLLoWAUHAUIg4ZBIgBOAAo7O8AJRUEahcZRQHAsGQ6GZDZ5Ao7RAqGQMxwyD6aFSfGT9OQ3FqVB4meraUylDxfIYEsbhYlEAAKAHlZdKYVQkmCGOlWFNpaw5QqqVtCqBdvtDsd9KdzpdWtzTG9ykZ3G5+io5Dp3N9hr9CZLJoRUqsQUq9fltkUjedFN5PtUOXJujJrc7lGb1CpnWcjGzeu7xf8pYRlmslXCEUjCCj0Rj9rj8Z6JQCiAXVjCgzTQ7IXUoHqyXh83ud1OpuZobY4qnJVOo5PIdNVs7Xcz6VTw1UX4YjkaiwJiqzo8TmiYvVelm0VcvraXtJ+1PPZDHcLjbrbaTA73OHXaKfiE63maGCeIqmTZKemzBgaxQIM8MiOEopgmK4rpVBm3LMioRyGK6GauL0Fyfh634LrEVB0KkSQANItiGhqyN0DgZvoZwqC8+iTpog7WIgmDMvojguLB1Qpg0HJzgRB5EZR4G7KmBgPAx+hMcOly1Ny46KBUlRGE4bT7M8ARDKQqAQHAkj7iQ5AUBJF4jk46iwbZ9reJm3LYoQ3FONoSixsaIl-GJ8SJCkJ6CKBrbUQgmntLUA4NG8U6GM5QrKJoXhmpUU72i8PlevWhBxDM7DzJZbZ7HYaEyJp8n7NULhchxCCsvcOFtLZMiXKUMhZT+i6ghCUIkZSIHUlREHeC6SbGMOhhKAy1q1OUzqmPo8mmmopidYRMryoB7BFWFXgyeVmiVbBR3yNaGblI6RjMj4nnXetfm+v6QUgGeYEXsYOjlIY5UfGcrH6M5bIdPJNoDAONprWK86PY2L1vaFEEcvahCLbd2guPFdUY4QrSlAOyUuFUeGmTlS4rgNwVDZJsitGVcFMRyFrXbNRgdAtS2jc4WbQ6J3qAn+KzbbtSNMYoA6qM87ieWojR1fI17PK0t0aA9-NgCLuxmPcUX1FFegcnLzSYPSHQaC86j7BcGjuWrqzLusg3nsV44PEonwE8crXKfL7z3J047XeoS1uCoD2a3S9w2XZ7uqOc12A3VXG2sO3MXBmSGwXpfhAA */
  createMachine<GameContext, GameEvents>(
    {
      id: 'game',

      initial: 'idle',
      context: {
        time: 0,
        deathTime: null,
        poopTime: null,
        hungerTime: null,
        sleepTime: null,
        awakeTime: null,
        canFeed: false,
        canClean: false,
        rainChance: 0.5,
      },
      on: {
        TICK: {
          actions: 'tick',
        },
      },
      states: {
        idle: {
          tags: 'game-idle',
          on: {
            START_GAME: ['hatching'],
          },
        },
        hatching: {
          tags: 'hatching',
          after: {
            3000: 'alive',
          },
        },
        alive: {
          type: 'parallel',
          invoke: {
            src: (_) => (cb) => {
              const interval = setInterval(() => {
                cb('TICK');
              }, 1000);

              return () => {
                clearInterval(interval);
              };
            },
          },
          entry: ['getHungerTime', 'getSleepTime', raise('RANDOMIZE_DAY')],
          always: {
            cond: 'isDeathTime',
            target: '#dead',
          },
          states: {
            scene: {
              id: 'scene',
              initial: 'day',
              on: {
                setSunny: {
                  target: '.day.sunny',
                },
                setRaining: {
                  target: '.day.raining',
                },
                NIGHT_TIME: {
                  target: '.night',
                },
                RANDOMIZE_DAY: [
                  {
                    target: '.day.sunny',
                    cond: 'isSunny',
                  },
                  {
                    target: '.day.raining',
                    cond: 'isRaining',
                  },
                ],
              },
              states: {
                day: {
                  initial: 'sunny',
                  states: {
                    sunny: {
                      tags: 'sunny',
                    },
                    raining: {
                      tags: 'raining',
                    },
                  },
                },

                night: {
                  tags: 'night',
                },
              },
            },
            fox: {
              id: 'fox',
              initial: 'idle',
              always: [
                {
                  cond: 'isHungry',
                  description: 'is hungry time',
                  target: 'fox.hungry',
                },
                {
                  cond: 'isPoopTime',
                  description: 'is pooping time',
                  target: 'fox.pooped',
                },
              ],

              states: {
                idle: {
                  tags: 'idle',
                  entry: 'resetAwake',
                  // @ts-ignore:next-line
                  always: {
                    cond: 'isSleepTime',
                    description: 'set day scene - night',
                    target: ['asleep'],
                    actions: raise('NIGHT_TIME'),
                  },
                },
                hungry: {
                  tags: ['hungry-fox'],
                  entry: ['resetHungerTime', 'getDeathTime', 'allowFeeding'],
                  exit: 'forbidFeeding',
                  on: {
                    FEED: {
                      cond: 'canFeed',
                      actions: ['getPoopTime'],
                      target: 'eating',
                    },
                  },
                },
                eating: {
                  tags: 'eating',
                  after: {
                    2000: {
                      target: 'celebrating',
                    },
                  },
                },
                pooped: {
                  tags: ['filthy-fox'],
                  entry: ['getDeathTime', 'allowCleaning', 'resetPoopTime'],
                  exit: 'forbidCleaning',
                  on: {
                    CLEAN_POOP: {
                      cond: 'canClean',
                      actions: ['getHungerTime'],
                      target: ['getCleaned'],
                    },
                  },
                },
                getCleaned: {
                  tags: 'cleaning',
                  after: {
                    2000: {
                      target: 'celebrating',
                    },
                  },
                },
                celebrating: {
                  tags: 'fox-celebrating',
                  after: { 3000: { target: 'idle' } },
                  exit: 'resetDeath',
                },
                asleep: {
                  tags: 'fox-sleeping',
                  entry: ['resetAll', 'getAwakeTime'],
                  // @ts-ignore:next-line
                  always: {
                    cond: 'isAwakeTime',
                    actions: raise('RANDOMIZE_DAY'),
                    target: 'idle',
                  },
                  exit: ['getAsleepTime', 'getHungerTime'],
                },
              },
            },
          },
        },
        dead: {
          tags: 'dead',
          id: 'dead',
          type: 'final',
        },
      },
    },
    {
      guards: {
        canClean: (ctx) => ctx.canClean,
        canFeed: (ctx) => ctx.canFeed,
        isHungry: (ctx) => ctx.hungerTime && ctx.hungerTime <= ctx.time,
        isDeathTime: (ctx) => ctx.deathTime && ctx.time >= ctx.deathTime,
        isPoopTime: (ctx) => ctx.poopTime && ctx.time >= ctx.poopTime,
        isSleepTime: (ctx) => ctx.sleepTime && ctx.time >= ctx.sleepTime,
        isAwakeTime: (ctx) => ctx.awakeTime && ctx.time >= ctx.awakeTime,

        isRaining: (ctx) => Math.random() < ctx.rainChance,
        isSunny: (ctx) => Math.random() >= ctx.rainChance,
      },
      actions: {
        tick: assign({
          time: (ctx) => +(ctx.time + 1),
        }),

        getSleepTime: assign({ sleepTime: (ctx) => ctx.time + DAY_LENGTH }),
        getAwakeTime: assign({ awakeTime: (ctx) => ctx.time + NIGHT_LENGTH }),
        getHungerTime: assign({ hungerTime: (ctx) => getNextHungerTime(ctx.time) }),
        getPoopTime: assign({ poopTime: (ctx) => getNextPoopTime(ctx.time) }),
        getDeathTime: assign({ deathTime: (ctx) => getNextDieTime(ctx.time) }),

        forbidCleaning: assign({ canClean: false }),
        forbidFeeding: assign({ canFeed: false }),
        resetAwake: assign({ awakeTime: null }),
        resetHungerTime: assign({ hungerTime: null }),
        resetDeath: assign({ deathTime: null }),
        resetPoopTime: assign({ poopTime: null }),
        resetAll: assign({
          sleepTime: null,
          deathTime: null,
          hungerTime: null,
          poopTime: null,
        }),

        allowCleaning: assign({ canClean: true }),
        allowFeeding: assign({ canFeed: true }),
      },
    }
  );
