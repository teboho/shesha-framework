import isEqualWith from 'lodash/isEqualWith';
import React, { useCallback, useEffect, useRef } from 'react';

/**
 * Custom version of isEqual to handle function comparison
 */
export const isEqual = (x: any, y: any) =>
  isEqualWith(x, y, (a, b) => {
    // Deal with the function comparison case
    if (typeof a === 'function' && typeof b === 'function') {
      return a.toString() === b.toString();
    }
    // Fallback on the method
    return undefined;
  });

function useDeepCompareMemoize(value: Readonly<any>) {
  const ref = useRef<any>();

  if (!isEqual(value, ref.current)) {
    ref.current = value;
  }

  return ref.current;
}

/**
 * Accepts a function that contains imperative, possibly effectful code.
 *
 * This is the deepCompare version of the `React.useEffect` hooks (that is shallowed compare)
 *
 * @param effect Imperative function that can return a cleanup function
 * @param deps If present, effect will only activate if the values in the list change.
 *
 * @see https://gist.github.com/kentcdodds/fb8540a05c43faf636dd68647747b074#gistcomment-2830503
 */
export function useDeepCompareEffect<T>(effect: React.EffectCallback, deps: T) {
  useEffect(effect, useDeepCompareMemoize(deps));
}

export function useDeepCompareCallback<T extends (...args: any[]) => any>(callback: T, deps: readonly any[]) {
  return useCallback(callback, useDeepCompareMemoize(deps));
}
