import { useState, useCallback } from 'react';
import Game from './components/Game';
import StartScreen from './components/StartScreen';
import { loadSavedProgress, clearSavedProgress } from './hooks/useGameState';

function App() {
  const [screen, setScreen] = useState('start');
  const [resumeData, setResumeData] = useState(null);

  const handlePlay = useCallback(() => {
    clearSavedProgress();
    setResumeData(null);
    setScreen('game');
  }, []);

  const handleContinue = useCallback(() => {
    const saved = loadSavedProgress();
    setResumeData(saved);
    setScreen('game');
  }, []);

  const handleBackToStart = useCallback(() => {
    setScreen('start');
  }, []);

  if (screen === 'start') {
    const saved = loadSavedProgress();
    return <StartScreen savedData={saved} onPlay={handlePlay} onContinue={handleContinue} />;
  }

  return <Game resumeData={resumeData} onBackToStart={handleBackToStart} />;
}

export default App;
