// deno-lint-ignore-file no-prototype-builtins no-explicit-any
import canUseDOM from './canUseDom.ts';
const animationEndEventNames = {
  WebkitAnimation: 'webkitAnimationEnd',
  OAnimation: 'oAnimationEnd',
  animation: 'animationend',
};
const transitionEventNames = {
  WebkitTransition: 'webkitTransitionEnd',
  OTransition: 'oTransitionEnd',
  transition: 'transitionend',
};

function supportEnd(names:any) {
  const el = document.createElement('div');
  for (const name in names) {
    //@ts-ignore original
    if (names.hasOwnProperty(name) && el.style[name] !== undefined) {
      return {
        end: names[name],
      };
    }
  }
  return false;
}

export const animation = canUseDOM() && supportEnd(animationEndEventNames);
export const transition = canUseDOM() && supportEnd(transitionEventNames);
