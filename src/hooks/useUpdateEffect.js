/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useRef } from 'react';

export const useUpdateEffect = (effect, deps) => {
  const isMounted = useRef(false);

  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
    } else {
      return effect();
    }
  }, deps);
};
