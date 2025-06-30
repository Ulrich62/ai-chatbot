import { useRef, useCallback } from 'react';

type ScrollOptions = {
  behavior?: ScrollBehavior;
  block?: ScrollLogicalPosition;
  inline?: ScrollLogicalPosition;
};

export function useScrollToView() {
  const elementRef = useRef<HTMLDivElement>(null);

  const scrollToView = useCallback((options: ScrollOptions = {}) => {
    const {
      behavior = 'smooth',
      block = 'start',
      inline = 'nearest',
    } = options;

    console.log("scrollToView", behavior, block, inline);
    elementRef.current?.scrollIntoView({
      behavior,
      block,
      inline,
    });
  }, []);

  return {
    elementRef,
    scrollToView,
  };
} 
