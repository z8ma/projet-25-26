import { useEffect, useRef, useState } from 'react';

export const useScrollAnimation = (deps: any[] = []) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Reset visibility when dependencies change
    setIsVisible(false);

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          // Une fois visible, on peut arrêter d'observer
          if (ref.current) {
            observer.unobserve(ref.current);
          }
        }
      },
      {
        threshold: 0.1, // L'élément doit être visible à 10%
        rootMargin: '50px', // Commence l'animation 50px avant que l'élément soit visible
      }
    );

    // Use a small delay to ensure the element is mounted in the DOM
    const timer = setTimeout(() => {
      const currentElement = ref.current;
      if (currentElement) {
        observer.observe(currentElement);
      }
    }, 10);

    return () => {
      clearTimeout(timer);
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, deps);

  return { ref, isVisible };
};
