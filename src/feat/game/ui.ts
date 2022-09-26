export const determineFoxState = (state: any) => {
  return [
    state.toStrings().includes('init') && 'hidden',
    state.hasTag('hatching') && 'fox-egg',
    state.hasTag('idle') && 'fox-idling',
    state.hasTag('hungry-fox') && 'fox-hungry',
    state.hasTag('eating') && 'fox-eating',
    state.hasTag('fox-sleeping') && 'fox-sleep',
    state.hasTag('fox-celebrating') && 'fox-celebrate',
    state.hasTag('dead') && 'fox-dead',
    state.hasTag('raining') &&
      !state.hasTag('fox-celebrating') &&
      !(state.hasTag('filthy-fox') || state.hasTag('cleaning')) &&
      'fox-rain',
    (state.hasTag('filthy-fox') || state.hasTag('cleaning')) && 'fox-pooping',
  ].filter((truthy) => truthy);
};
