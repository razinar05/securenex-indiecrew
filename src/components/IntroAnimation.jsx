import { useEffect, useState } from 'react';
import './IntroAnimation.css';

const IntroAnimation = () => {
  const [stage, setStage] = useState('fade-in'); // fade-in, split

  useEffect(() => {
    // Stage 1: Fade in and zoom (0-1.5s)
    const timer1 = setTimeout(() => {
      setStage('split');
    }, 1500);

    return () => clearTimeout(timer1);
  }, []);

  return (
    <div className="intro-container">
      <div className={`intro-text ${stage}`}>
        <span className="intro-left">PETRO</span>
        <span className="intro-right">NAS</span>
      </div>
    </div>
  );
};

export default IntroAnimation;
