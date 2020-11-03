import { MutableRefObject, useEffect, useRef } from 'react';

export const useCombinedRefs = <T>(
  ...refs: Array<MutableRefObject<T> | ((instance: T) => void)>
) => {
  const targetRef = useRef<T>();

  useEffect(() => {
    refs.forEach(ref => {
      if (!ref) return;

      if (typeof ref === 'function') {
        ref(targetRef.current);
      } else {
        ref.current = targetRef.current;
      }
    });
  }, [refs]);

  return targetRef;
};
