import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

interface PageTransitionProps {
  children: React.ReactNode;
}

export default function PageTransition({ children }: PageTransitionProps) {
  const location = useLocation();
  const [displayChildren, setDisplayChildren] = useState(children);
  const [transitionStage, setTransitionStage] = useState<'enter' | 'exit'>('enter');

  useEffect(() => {
    // When location changes, start exit animation
    setTransitionStage('exit');

    // After exit animation, update children and start enter animation
    const timeout = setTimeout(() => {
      setDisplayChildren(children);
      setTransitionStage('enter');
    }, 150); // Duration of exit animation

    return () => clearTimeout(timeout);
  }, [location.pathname]);

  // Update children immediately on first render
  useEffect(() => {
    setDisplayChildren(children);
  }, []);

  return (
    <div
      className={`transition-all duration-300 ease-out ${
        transitionStage === 'enter'
          ? 'opacity-100 translate-y-0'
          : 'opacity-0 translate-y-2'
      }`}
    >
      {displayChildren}
    </div>
  );
}
