import { useState, useCallback } from 'react';
import Game from './components/Game';
import StartScreen from './components/StartScreen';
import { loadSavedProgress, clearSavedProgress } from './hooks/useGameState';

function App() {
  const [screen, setScreen] = useState('start');
  const [resumeData, setResumeData] = useState(null);
  const [gameMode, setGameMode] = useState('divide');

  const handlePlay = useCallback((mode) => {
    clearSavedProgress(mode);
    setGameMode(mode);
    setResumeData(null);
    setScreen('game');
  }, []);

  const handleContinue = useCallback((mode) => {
    const saved = loadSavedProgress(mode);
    setGameMode(mode);
    setResumeData(saved);
    setScreen('game');
  }, []);

  const handleBackToStart = useCallback(() => {
    setScreen('start');
  }, []);

  if (screen === 'start') {
    return <StartScreen onPlay={handlePlay} onContinue={handleContinue} />;
  }

  return <Game resumeData={resumeData} gameMode={gameMode} onBackToStart={handleBackToStart} />;
}

export default App;
