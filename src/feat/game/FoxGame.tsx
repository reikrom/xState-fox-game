import React, { useState } from 'react';
import { useMachine } from '@xstate/react';
import { gameMachine } from './machine/gameMachine';
import cn from 'classnames';
import './sprites.css';
import './style.scss';
import { determineFoxState } from './ui';

const FoxGame = () => {
  const [state, send] = useMachine(gameMachine);
  const [activeButton, setActiveButton] = useState(0);

  const handleRightButton = () => {
    setActiveButton((state) => (state + 1) % 3);
  };
  const handleLeftButton = () => {
    setActiveButton((state) => (state + 2) % 3);
  };

  const handleSelectButton = () => {
    if (state.hasTag('game-idle')) {
      send('START_GAME');
      return;
    }

    switch (activeButton) {
      case 0:
        send('FEED');
        break;
      case 1:
        send('CLEAN_POOP');
        break;
      case 2:
        state.hasTag('raining') ? send('setSunny') : send('setRaining');
        break;
      default:
        break;
    }
  };

  return (
    <>
      <div className="container">
        <div className="inner">
          <div
            className={cn(
              'game',
              state.hasTag('dead') && 'dead',
              state.hasTag('fox-sleeping') && 'night',
              state.hasTag('raining') && 'rain'
            )}
          ></div>
          <div className={cn('fox', determineFoxState(state))}></div>
          <div className={cn('poop-bag', !state.hasTag('cleaning') && 'hidden')}></div>
          <div className={cn('foreground-rain rain')}></div>
          <div className="frame"></div>
          <div className={cn('modal', !state.hasTag('game-idle') && 'hidden')}>
            <div className="modal-inner">Press the middle button to start</div>
          </div>
          <div className="buttons">
            <button onClick={handleLeftButton} className="btn left-btn"></button>
            <button onClick={handleSelectButton} className="btn middle-btn"></button>
            <button onClick={handleRightButton} className="btn right-btn"></button>
          </div>
          <div className="icons">
            <div
              className={cn('icon', 'fish-icon', activeButton === 0 && 'highlighted')}
            ></div>
            <div
              className={cn('icon poop-icon', activeButton === 1 && 'highlighted')}
            ></div>
            <div
              className={cn('icon weather-icon', activeButton === 2 && 'highlighted')}
            ></div>
          </div>
        </div>
      </div>
    </>
  );
};

export default FoxGame;
