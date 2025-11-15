import { useState, useEffect } from 'react';
import SentinelView from './components/SentinelView';
import VanguardView from './components/VanguardView';
import StrategicIntelView from './components/StrategicIntelView';
import IntroAnimation from './components/IntroAnimation';
import Homepage from './components/Homepage';
import './components/theme.css';

function App() {
  const [showIntro, setShowIntro] = useState(true);
  const [showHomepage, setShowHomepage] = useState(false);
  const [activeModule, setActiveModule] = useState(null);
  const [activeSubModule, setActiveSubModule] = useState(null);

  useEffect(() => {
    // Show intro animation for 3 seconds
    const timer = setTimeout(() => {
      setShowIntro(false);
      setShowHomepage(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const handleModuleSelect = (module, subModule) => {
    setActiveModule(module);
    setActiveSubModule(subModule);
    setShowHomepage(false);
  };

  const handleBackToHome = () => {
    setShowHomepage(true);
    setActiveModule(null);
    setActiveSubModule(null);
  };

  if (showIntro) {
    return <IntroAnimation />;
  }

  if (showHomepage) {
    return <Homepage onModuleSelect={handleModuleSelect} />;
  }

  return (
    <div className="min-h-screen" style={{ background: '#0a0a14' }}>
      {/* Header with back button */}
      <header className="backdrop-blur-lg border-b sticky top-0 z-50" style={{ background: 'rgba(30, 27, 75, 0.6)', borderColor: 'rgba(139, 92, 246, 0.2)' }}>
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={handleBackToHome}
            className="flex items-center gap-2 transition-colors group"
            style={{ color: '#94a3b8' }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#8b5cf6'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#94a3b8'}
          >
            <svg className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span className="font-semibold">Back to Home</span>
          </button>
          <h1 className="text-3xl tracking-wider sentry-glow-text" style={{ 
            letterSpacing: '0.15em',
            fontWeight: '900',
            fontFamily: '"Inter", "Roboto", "Helvetica Neue", system-ui, sans-serif'
          }}>SENTRY</h1>
        </div>
      </header>

      {/* Module Content */}
      <main className="container mx-auto px-6 py-8">
        {activeModule === 'sentinel' && <SentinelView />}
        {activeModule === 'vanguard' && <VanguardView />}
        {activeModule === 'citadel' && <StrategicIntelView />}
      </main>
    </div>
  );
}

export default App;
