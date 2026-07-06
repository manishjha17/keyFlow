import { useState, useEffect, useRef, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { RotateCcw, AtSign, Hash, Clock, Type, Quote, Mountain, Wrench, Code, ChevronDown, Globe, User, Info, ArrowUp } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import {
  PieChart, Pie, Cell,
  BarChart, Bar,
  LineChart, Line,
  XAxis, YAxis, Tooltip, ResponsiveContainer
} from 'recharts';
import './TypingArea.css';

import {
  WORDS_LIST, WORDS_LIST_MEDIUM, WORDS_LIST_HARD,
  WORDS_LIST_HINGLISH_EASY, WORDS_LIST_HINGLISH_MEDIUM, WORDS_LIST_HINGLISH_HARD,
  WORDS_LIST_HINDI_EASY, WORDS_LIST_HINDI_MEDIUM, WORDS_LIST_HINDI_HARD,
  QUOTES_LIST
} from '../utils/wordLists';

const splitGraphemes = (str) => {
  if (!str) return [];
  const segmenter = new Intl.Segmenter('hi', { granularity: 'grapheme' });
  return Array.from(segmenter.segment(str)).map(x => x.segment);
};

function generateWords(count, hasPunctuation, hasNumbers, hasCapitalization, hasCode, testMode, difficulty, wordLengthFilter, language) {
  if (testMode === 'quote') {
    const quote = QUOTES_LIST[Math.floor(Math.random() * QUOTES_LIST.length)];
    return quote.split(' ');
  }

  let sourceList = WORDS_LIST;
  
  if (language === 'hinglish') {
    sourceList = WORDS_LIST_HINGLISH_EASY;
    if (difficulty === 'Medium') sourceList = WORDS_LIST_HINGLISH_MEDIUM;
    if (difficulty === 'Hard') sourceList = WORDS_LIST_HINGLISH_HARD;
  } else if (language === 'hindi') {
    sourceList = WORDS_LIST_HINDI_EASY;
    if (difficulty === 'Medium') sourceList = WORDS_LIST_HINDI_MEDIUM;
    if (difficulty === 'Hard') sourceList = WORDS_LIST_HINDI_HARD;
  } else {
    if (difficulty === 'Medium') sourceList = WORDS_LIST_MEDIUM;
    else if (difficulty === 'Hard') sourceList = WORDS_LIST_HARD;
  }
  if (wordLengthFilter === 'Short') {
    sourceList = sourceList.filter(w => w.length <= 4);
  } else if (wordLengthFilter === 'Long') {
    sourceList = sourceList.filter(w => w.length > 5);
  }
  if (sourceList.length === 0) sourceList = WORDS_LIST;

  const result = [];
  const punctuation = [',', '.', '?', '!', ';', ':', '"', "'"];
  const codeSymbols = ['()', '{}', '[]', '<>', '=>', '&&', '||', '===', '!=', '++', '--'];
  
  for (let i = 0; i < count; i++) {
    let word = sourceList[Math.floor(Math.random() * sourceList.length)];
    
    if (hasCode && Math.random() > 0.8) {
      word = codeSymbols[Math.floor(Math.random() * codeSymbols.length)];
    } else {
      if (hasNumbers && Math.random() > 0.8) {
        word = Math.floor(Math.random() * 1000).toString();
      } else if (hasNumbers && Math.random() > 0.8) {
        word = word + Math.floor(Math.random() * 100).toString();
      }

      if (hasPunctuation) {
        if (Math.random() > 0.8) {
          word += punctuation[Math.floor(Math.random() * punctuation.length)];
        }
      }
      
      if (hasCapitalization) {
        if (Math.random() > 0.7) {
          word = word.charAt(0).toUpperCase() + word.slice(1);
        }
      }
    }
    
    result.push(word);
  }
  return result;
}

function TypingArea() {
  const [testMode, setTestMode] = useState('time'); 
  const [timeSetting, setTimeSetting] = useState(30);
  const [wordSetting, setWordSetting] = useState(25);
  const [hasPunctuation, setHasPunctuation] = useState(false);
  const [hasNumbers, setHasNumbers] = useState(false);
  const [hasCapitalization, setHasCapitalization] = useState(false);
  const [hasCode, setHasCode] = useState(false);
  
  const [difficulty, setDifficulty] = useState('Easy'); // Easy | Hard
  const [wordLengthFilter, setWordLengthFilter] = useState('All'); // Short | Long | All
  const [showDiffMenu, setShowDiffMenu] = useState(false);
  const [showLenMenu, setShowLenMenu] = useState(false);
  
  const [words, setWords] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [activeWordIndex, setActiveWordIndex] = useState(0);
  const [status, setStatus] = useState('waiting'); 
  
  const [timeLeft, setTimeLeft] = useState(30);
  const [stats, setStats] = useState({ 
    correctChars: 0, incorrectChars: 0, extraChars: 0, missedChars: 0, 
    correctWords: 0, incorrectWords: 0,
    wpm: 0, rawWpm: 0, accuracy: 0, finalScore: 0, timeTaken: 0
  });
  const [isFocused, setIsFocused] = useState(true);
  
  const [typedHistory, setTypedHistory] = useState([]);
  const [wpmHistory, setWpmHistory] = useState([]);
  const [allTimeScores, setAllTimeScores] = useState([]);

  const { user, updateUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const inputRef = useRef(null);
  const timerRef = useRef(null);
  const wordsDisplayRef = useRef(null);
  const diffDropdownRef = useRef(null);

  const [language, setLanguage] = useState('english');

  const initTest = () => {
    const count = testMode === 'words' ? wordSetting : 200; 
    setWords(generateWords(count, hasPunctuation, hasNumbers, hasCapitalization, hasCode, testMode, difficulty, wordLengthFilter, language));
    setUserInput('');
    setActiveWordIndex(0);
    setStatus('waiting');
    setStats({ 
      correctChars: 0, incorrectChars: 0, extraChars: 0, missedChars: 0, 
      correctWords: 0, incorrectWords: 0,
      wpm: 0, rawWpm: 0, accuracy: 0, finalScore: 0
    });
    setTypedHistory([]);
    setWpmHistory([]);
    setTimeLeft(testMode === 'time' ? timeSetting : 0);
    clearInterval(timerRef.current);
    inputRef.current?.focus();
  };

  useEffect(() => {
    initTest();
  }, [testMode, timeSetting, wordSetting, hasPunctuation, hasNumbers, hasCapitalization, hasCode, difficulty, wordLengthFilter, language]);

  useEffect(() => {
    const handleResetEvent = () => initTest();
    window.addEventListener('reset-typing-test', handleResetEvent);
    return () => window.removeEventListener('reset-typing-test', handleResetEvent);
  }, [testMode, timeSetting, wordSetting, hasPunctuation, hasNumbers, hasCapitalization, hasCode, difficulty, wordLengthFilter, language]);

  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      if (status === 'finished') return;
      if (document.activeElement.tagName === 'INPUT') return;
      
      if (e.key.length === 1 || e.key === 'Backspace') {
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => { window.removeEventListener('keydown', handleGlobalKeyDown); };
  }, [isFocused]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (diffDropdownRef.current && !diffDropdownRef.current.contains(event.target)) {
        setShowDiffMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (wordsDisplayRef.current) {
      const activeWordElement = wordsDisplayRef.current.querySelector('.word.active');
      if (activeWordElement) {
        const wordTop = activeWordElement.offsetTop;
        if (wordTop > 70) {
          const shift = wordTop - 48; 
          wordsDisplayRef.current.style.transform = `translateY(-${shift}px)`;
        } else {
          wordsDisplayRef.current.style.transform = `translateY(0px)`;
        }
      }
    }
  }, [activeWordIndex, words]);

  useEffect(() => {
    if (status === 'typing' && (testMode === 'time' || testMode === 'quote' || testMode === 'words')) {
      timerRef.current = setInterval(() => {
        if (testMode === 'time') {
          setTimeLeft((prev) => prev - 1);
        } else {
          setTimeLeft((prev) => prev + 1);
        }
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [status, testMode]);

  const calculateStats = (finalHistory, currentInput, currentWordIndex, elapsedSeconds) => {
    let correct = 0;
    let incorrect = 0;
    let extra = 0;
    let missed = 0;
    let correctWordsCount = 0;
    let incorrectWordsCount = 0;
    
    finalHistory.forEach((typed, index) => {
      const actualWord = splitGraphemes(words[index]);
      const typedGraphemes = splitGraphemes(typed);
      let wordIsCorrect = true;
      const maxLen = Math.max(typedGraphemes.length, actualWord.length);
      for (let i = 0; i < maxLen; i++) {
        if (typedGraphemes[i] === undefined) { missed++; wordIsCorrect = false; }
        else if (actualWord[i] === undefined) { incorrect++; extra++; wordIsCorrect = false; }
        else if (typedGraphemes[i] === actualWord[i]) correct++;
        else { incorrect++; wordIsCorrect = false; }
      }
      if (wordIsCorrect) correctWordsCount++;
      else incorrectWordsCount++;
      correct++;
    });

    const actualCurrentWord = words[currentWordIndex] ? splitGraphemes(words[currentWordIndex]) : [];
    const currentInputGraphemes = splitGraphemes(currentInput);
    if (actualCurrentWord.length > 0 || currentInputGraphemes.length > 0) {
      let wordIsCorrect = true;
      for (let i = 0; i < currentInputGraphemes.length; i++) {
        if (actualCurrentWord[i] === undefined) { incorrect++; extra++; wordIsCorrect = false; }
        else if (currentInputGraphemes[i] === actualCurrentWord[i]) correct++;
        else { incorrect++; wordIsCorrect = false; }
      }
      if (currentInputGraphemes.length > 0 && currentInput !== words[currentWordIndex]) incorrectWordsCount++;
      else if (currentInputGraphemes.length > 0) correctWordsCount++;
    }

    const totalTyped = correct + incorrect;
    const accuracy = totalTyped > 0 ? (correct / totalTyped) * 100 : 0;
    
    const timeElapsed = elapsedSeconds || (testMode === 'time' ? timeSetting : 30); 
    const minutes = (timeElapsed || 1) / 60; 
    
    const wpm = (correct / 5) / minutes;
    const rawWpm = (totalTyped / 5) / minutes;
    const finalScore = rawWpm * (accuracy / 100);

    return { 
      correctChars: correct, incorrectChars: incorrect, extraChars: extra, missedChars: missed, 
      correctWords: correctWordsCount, incorrectWords: incorrectWordsCount,
      wpm: Math.round(wpm), rawWpm: Math.round(rawWpm), accuracy: Math.round(accuracy), finalScore: finalScore.toFixed(2)
    };
  };

  useEffect(() => {
    if (status === 'typing') {
      const timeElapsed = testMode === 'time' ? timeSetting - timeLeft : timeLeft;
      if (timeElapsed > 0) {
        const snapshot = calculateStats(typedHistory, userInput, activeWordIndex, timeElapsed);
        setWpmHistory(prev => {
          const last = prev[prev.length - 1];
          if (last && last.second === timeElapsed) return prev;
          return [...prev, {
            second: timeElapsed,
            wpm: snapshot.wpm,
            raw: snapshot.rawWpm
          }];
        });
      }
      
      if (testMode === 'time' && timeLeft <= 0) {
        endTest(timeSetting);
      }
    }
  }, [timeLeft, status, testMode]);

  const endTest = async (finalTimeElapsed) => {
    setStatus('finished');
    clearInterval(timerRef.current);
    
    const timeElapsed = finalTimeElapsed || (testMode === 'time' ? timeSetting : timeLeft);
    const finalStats = calculateStats(typedHistory, userInput, activeWordIndex, timeElapsed);
    
    const wpmValues = wpmHistory.map(h => h.raw);
    let calculatedConsistency = 90;
    if (wpmValues.length > 1) {
      const avg = wpmValues.reduce((a, b) => a + b, 0) / wpmValues.length;
      if (avg > 0) {
        const variance = wpmValues.reduce((a, b) => a + Math.pow(b - avg, 2), 0) / wpmValues.length;
        const stdDev = Math.sqrt(variance);
        calculatedConsistency = Math.max(50, Math.min(100, Math.round(100 - (stdDev / avg) * 100)));
      }
    } else {
      calculatedConsistency = Math.round(finalStats.accuracy * 0.95);
    }

    setStats({
      ...finalStats,
      timeTaken: timeElapsed,
      consistency: calculatedConsistency
    });

    if (user && user.token) {
      try {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
        const res = await fetch(`${API_URL}/scores`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${user.token}`,
          },
          body: JSON.stringify({
            wpm: finalStats.wpm,
            accuracy: finalStats.accuracy,
            mode: testMode,
            duration: testMode === 'time' ? timeSetting : wordSetting,
            language: language,
            raw: finalStats.rawWpm,
            consistency: calculatedConsistency
          }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.streak !== undefined) {
            updateUser({ ...user, streak: data.streak, lastTestDate: data.lastTestDate });
          }
        }
      } catch (error) {
        console.error('Failed to save score:', error);
      }

      try {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
        const historyRes = await fetch(`${API_URL}/scores/me`, {
          headers: { 'Authorization': `Bearer ${user.token}` }
        });
        if (historyRes.ok) {
          const historyData = await historyRes.json();
          setAllTimeScores(historyData);
        }
      } catch (e) {
        console.error('Failed to fetch history', e);
      }
    }
  };

  const resetAnalytics = async () => {
    if (!user) {
      alert("Please login to manage analytics.");
      return;
    }
    if (window.confirm("Are you sure you want to completely wipe all your test history? This action cannot be undone.")) {
      try {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
        const response = await fetch(`${API_URL}/scores/me`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${user.token}`
          }
        });
        if (response.ok) {
          alert('Analytics successfully reset.');
        } else {
          alert('Failed to reset analytics.');
        }
      } catch (error) {
        console.error(error);
        alert('An error occurred.');
      }
    }
  };

  const handleContainerClick = () => {
    if (status !== 'finished') inputRef.current?.focus();
  };

  const handleChange = (e) => {
    if (status === 'finished') return;
    if (status === 'waiting') setStatus('typing');

    const value = e.target.value;
    
    if (value.endsWith(' ')) {
      const newHistory = [...typedHistory, value.trim()];
      setTypedHistory(newHistory);
      
      if ((testMode === 'words' && activeWordIndex + 1 === wordSetting) || 
          (testMode === 'quote' && activeWordIndex + 1 === words.length)) {
        endTest(timeLeft);
      } else {
        setActiveWordIndex((prev) => prev + 1);
        setUserInput('');
      }
      return;
    }

    setUserInput(value);
  };

  const handleKeyDown = (e) => {
    if (status === 'finished') return;
    
    if (e.key === 'Backspace' && userInput === '' && activeWordIndex > 0) {
      e.preventDefault();
      const prevWord = typedHistory[typedHistory.length - 1];
      const newHistory = typedHistory.slice(0, -1);
      setTypedHistory(newHistory);
      setActiveWordIndex((prev) => prev - 1);
      setUserInput(prevWord);
    }
  };

  const COLORS = ['var(--main-color)', 'var(--text-color-light)'];

  if (status === 'finished') {
    const pieWordsData = [
      { name: 'Correct', value: stats.correctWords },
      { name: 'Wrong', value: stats.incorrectWords },
    ];

    const pieWpmData = [
      { name: 'Net WPM', value: stats.wpm },
      { name: 'Raw WPM', value: stats.rawWpm },
    ];

    const barData = [
      { name: 'Raw WPM', value: stats.rawWpm },
      { name: 'Overall WPM', value: stats.wpm },
    ];

    const allTimeMock = [
      { name: 'Current', accuracy: stats.accuracy, wpm: stats.rawWpm },
      { name: 'All Time', accuracy: 80, wpm: 35 }, 
    ];

    return (
      <div className="results-dashboard">
        {/* Hero Banner */}
        <div className="results-hero">
          <div className="hero-stat primary">
            <span className="hero-label">WPM</span>
            <span className="hero-value text-main">{stats.wpm}</span>
          </div>
          <div className="hero-stat">
            <span className="hero-label">Accuracy</span>
            <span className="hero-value">{stats.accuracy}%</span>
          </div>
        </div>

        {/* Secondary Stats Grid */}
        <div className="results-secondary-grid">
          <div className="stat-card">
            <span className="stat-label">
              Raw WPM
              <div className="tooltip-container">
                <Info size={14} className="info-icon" />
                <span className="tooltip-text">Your raw typing speed including all errors.</span>
              </div>
            </span>
            <span className="stat-val">{stats.rawWpm}</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">
              Time
              <div className="tooltip-container">
                <Info size={14} className="info-icon" />
                <span className="tooltip-text">Total time taken to complete the test.</span>
              </div>
            </span>
            <span className="stat-val">{stats.timeTaken || 0}s</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">
              Consistency
              <div className="tooltip-container">
                <Info size={14} className="info-icon" />
                <span className="tooltip-text">How steady your typing speed was throughout the test.</span>
              </div>
            </span>
            <span className="stat-val">{stats.consistency}%</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">
              Characters
              <div className="tooltip-container">
                <Info size={14} className="info-icon" />
                <span className="tooltip-text">Correct / Incorrect / Extra / Missed characters.</span>
              </div>
            </span>
            <span className="stat-val" style={{fontSize: '1rem', marginTop: '0.4rem'}}>{stats.correctChars}/{stats.incorrectChars}/{stats.extraChars}/{stats.missedChars}</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">
              Correct Words
              <div className="tooltip-container">
                <Info size={14} className="info-icon" />
                <span className="tooltip-text">Number of entirely correct words typed.</span>
              </div>
            </span>
            <span className="stat-val text-main">{stats.correctWords}</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">
              Wrong Words
              <div className="tooltip-container">
                <Info size={14} className="info-icon" />
                <span className="tooltip-text">Number of words typed with mistakes.</span>
              </div>
            </span>
            <span className="stat-val text-error">{stats.incorrectWords}</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">
              Final Score
              <div className="tooltip-container">
                <Info size={14} className="info-icon" />
                <span className="tooltip-text">Your overall typing score combining speed and accuracy.</span>
              </div>
            </span>
            <span className="stat-val">{stats.finalScore}</span>
          </div>
        </div>

        {/* Action Bar */}
        <div className="results-action-bar">
          <button className="results-btn primary" onClick={initTest} title="Restart Test">
            <RotateCcw size={18} /> Next Test
          </button>
          <button className="results-btn secondary" onClick={() => navigate('/profile')}>
            <User size={18} /> View Profile
          </button>
          {!user && (
            <div className="save-score-hint">
              <span className="text-error">Score not saved</span>
              <span>Login to save to your account</span>
            </div>
          )}
          {user && (
            <div className="save-score-hint">
              <span className="text-main">Score saved successfully</span>
            </div>
          )}
        </div>

        {/* Charts & History Table (Two Columns) */}
        <div className="results-data-grid">
          {/* Charts */}
          <div className="results-charts">
            <div className="results-chart-card">
              <span className="chart-title">WPM Progress Over Time</span>
              <div className="chart-wrapper">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={wpmHistory} margin={{top: 10, right: 10, left: -20, bottom: 0}}>
                    <XAxis dataKey="second" tick={{fill: 'var(--text-color-light)', fontSize: 10}} axisLine={false} tickLine={false} />
                    <YAxis tick={{fill: 'var(--text-color-light)', fontSize: 10}} axisLine={false} tickLine={false}/>
                    <Tooltip contentStyle={{backgroundColor: 'var(--sub-color)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'var(--text-color)'}} />
                    <Line type="monotone" dataKey="wpm" name="Net WPM" stroke="var(--main-color)" strokeWidth={3} dot={false} activeDot={{r: 6}} />
                    <Line type="monotone" dataKey="raw" name="Raw WPM" stroke="var(--text-color-light)" strokeWidth={2} dot={false} strokeDasharray="3 3" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {user && allTimeScores.length > 0 && (
              <div className="results-chart-card">
                <span className="chart-title">All-Time WPM History</span>
                <div className="chart-wrapper">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={[...allTimeScores].reverse()} margin={{top: 10, right: 10, left: -20, bottom: 0}}>
                      <XAxis dataKey="createdAt" tick={false} axisLine={false} tickLine={false} />
                      <YAxis tick={{fill: 'var(--text-color-light)', fontSize: 10}} axisLine={false} tickLine={false}/>
                      <Tooltip contentStyle={{backgroundColor: 'var(--sub-color)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'var(--text-color)'}} labelFormatter={() => 'Past Test'} />
                      <Line type="monotone" dataKey="wpm" name="WPM" stroke="var(--main-color)" strokeWidth={2} dot={{r: 2, fill: 'var(--main-color)', strokeWidth: 0}} activeDot={{r: 4, fill: 'var(--main-color)'}} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>

          {/* Table */}
          <div className="results-table-container">
            <div className="table-title">Keystroke History</div>
            <div className="results-table">
              <div className="rt-header">
                <span>#</span>
                <span>Expected</span>
                <span>Typed</span>
                <span>Status</span>
              </div>
              <div className="rt-body">
                {typedHistory.map((typed, idx) => {
                  const expected = words[idx];
                  const isCorrect = typed === expected;
                  return (
                    <div key={idx} className={`rt-row ${!isCorrect ? 'error-row' : ''}`}>
                      <span>{idx + 1}</span>
                      <span>{expected}</span>
                      <span className={isCorrect ? 'text-main' : 'text-error'}>{typed}</span>
                      <span className={isCorrect ? 'text-main' : 'text-error'}>{isCorrect ? 'Correct' : 'Incorrect'}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="typing-section">
      <div className="dashboard-header bg-sub">
        <div className="dashboard-left">
          <button className="dashboard-action-btn" onClick={initTest} title="Restart Test">
            <RotateCcw size={16} />
          </button>
          <div 
            className="dashboard-lang-selector" 
            onClick={() => {
              if (language === 'english') setLanguage('hinglish');
              else if (language === 'hinglish') setLanguage('hindi');
              else setLanguage('english');
            }}
          >
            <Globe size={14} /> {language}
          </div>
          
          <div className="dropdown-container" ref={diffDropdownRef}>
            <button 
              className="dashboard-lang-selector dropdown-btn" 
              onClick={() => setShowDiffMenu(!showDiffMenu)}
              style={{ padding: '0.3rem 0.6rem' }}
            >
              {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} <ChevronDown size={14} />
            </button>
            {showDiffMenu && (
              <div className="dropdown-menu">
                <div className={`dropdown-item ${difficulty === 'Easy' ? 'active text-main' : ''}`} onClick={() => { setDifficulty('Easy'); setShowDiffMenu(false); }}>Easy</div>
                <div className={`dropdown-item ${difficulty === 'Medium' ? 'active text-main' : ''}`} onClick={() => { setDifficulty('Medium'); setShowDiffMenu(false); }}>Medium</div>
                <div className={`dropdown-item ${difficulty === 'Hard' ? 'active text-main' : ''}`} onClick={() => { setDifficulty('Hard'); setShowDiffMenu(false); }}>Hard</div>
              </div>
            )}
          </div>
        </div>

        <div className="dashboard-center">
          <div className="segmented-control">
            <button className={`segment-btn ${hasPunctuation ? 'active text-main' : ''}`} onClick={() => setHasPunctuation(!hasPunctuation)}>
              <AtSign size={14}/> punct
            </button>
            <button className={`segment-btn ${hasNumbers ? 'active text-main' : ''}`} onClick={() => setHasNumbers(!hasNumbers)}>
              <Hash size={14}/> numbers
            </button>
            <button className={`segment-btn ${hasCapitalization ? 'active text-main' : ''}`} onClick={() => setHasCapitalization(!hasCapitalization)}>
              <span style={{fontWeight: 'bold', fontSize: '12px'}}>Aa</span> caps
            </button>
            <button className={`segment-btn ${hasCode ? 'active text-main' : ''}`} onClick={() => setHasCode(!hasCode)}>
              <Code size={14}/> code
            </button>
          </div>
          
          <div className="segmented-control">
            <button className={`segment-btn ${testMode === 'time' ? 'active text-main' : ''}`} onClick={() => setTestMode('time')}>
              <Clock size={14}/> time
            </button>
            <button className={`segment-btn ${testMode === 'words' ? 'active text-main' : ''}`} onClick={() => setTestMode('words')}>
              <Type size={14}/> words
            </button>
            <button className={`segment-btn ${testMode === 'quote' ? 'active text-main' : ''}`} onClick={() => setTestMode('quote')}>
              <Quote size={14}/> quote
            </button>
          </div>
        </div>

        <div className="dashboard-right">
          <div className="segmented-control">
            {testMode === 'time' ? (
              <>
                {[15, 30, 60, 120].map(t => (
                  <button key={t} className={`segment-btn ${timeSetting === t ? 'active text-main' : ''}`} onClick={() => setTimeSetting(t)}>{t}</button>
                ))}
              </>
            ) : testMode === 'words' ? (
              <>
                {[10, 25, 50, 100].map(w => (
                  <button key={w} className={`segment-btn ${wordSetting === w ? 'active text-main' : ''}`} onClick={() => setWordSetting(w)}>{w}</button>
                ))}
              </>
            ) : testMode === 'quote' ? (
              <>
                <button className="segment-btn active text-main">all</button>
                <button className="segment-btn">short</button>
                <button className="segment-btn">long</button>
              </>
            ) : null}
          </div>
        </div>
      </div>

      <div className="typing-info">
        <div className="progress">{(testMode === 'words' || testMode === 'quote') ? `${activeWordIndex} / ${words.length}` : ``}</div>
        <div className="timer text-main">{(testMode === 'time' || testMode === 'words' || testMode === 'quote') && status !== 'waiting' ? timeLeft : ''}</div>
      </div>

      <div className="typing-container" onClick={handleContainerClick}>
        <div ref={wordsDisplayRef} className={`words-display ${!isFocused && status !== 'finished' ? 'blurred' : ''}`}>
          {words.map((word, wordIndex) => {
            const isActive = wordIndex === activeWordIndex;
            const isPast = wordIndex < activeWordIndex;
            
            let wordClass = 'word';
            if (isActive) wordClass += ' active';
            
            const pastTypedGraphemes = isPast ? splitGraphemes(typedHistory[wordIndex]) : [];
            const wordGraphemes = splitGraphemes(word);
            
            if (isPast && typedHistory[wordIndex] !== word) {
              wordClass += ' error';
            }

            return (
              <div key={wordIndex} className={wordClass}>
                {isPast && wordGraphemes.map((char, charIndex) => {
                  const typedChar = pastTypedGraphemes[charIndex];
                  let charClass = typedChar === char ? 'correct' : 'incorrect';
                  return <span key={charIndex} className={`char ${charClass}`}>{char}</span>;
                })}
                {isPast && pastTypedGraphemes.length > wordGraphemes.length && pastTypedGraphemes.slice(wordGraphemes.length).map((char, i) => (
                  <span key={`extra-${i}`} className="char incorrect extra">{char}</span>
                ))}

                {isActive && wordGraphemes.map((char, charIndex) => {
                  const typedChar = splitGraphemes(userInput)[charIndex];
                  let charClass = '';
                  if (typedChar === undefined) charClass = 'pending';
                  else if (typedChar === char) charClass = 'correct';
                  else charClass = 'incorrect';
                  return <span key={charIndex} className={`char ${charClass}`}>{char}</span>;
                })}
                {isActive && splitGraphemes(userInput).length > wordGraphemes.length && splitGraphemes(userInput).slice(wordGraphemes.length).map((char, i) => (
                  <span key={`extra-${i}`} className="char incorrect extra">{char}</span>
                ))}

                {!isActive && !isPast && wordGraphemes.map((char, charIndex) => (
                  <span key={charIndex} className="char pending">{char}</span>
                ))}

                {isActive && (
                  <span className="caret" style={{ left: `calc(${splitGraphemes(userInput).length} * 1ch)` }} />
                )}
              </div>
            );
          })}
        </div>

        {!isFocused && status !== 'finished' && (
          <div className="focus-overlay">
            Click to focus
          </div>
        )}

        <input
          ref={inputRef}
          type="text"
          className="hidden-input"
          value={userInput}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          autoFocus
        />
      </div>
    </div>
  );
}

export default TypingArea;
