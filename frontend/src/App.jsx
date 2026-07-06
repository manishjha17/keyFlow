import { useState, useEffect, createContext, useContext } from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Leaderboard from './pages/Leaderboard';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import ScrollToTop from './components/ScrollToTop';
import { AuthProvider } from './context/AuthContext';

export const ThemeContext = createContext();

function App() {
  const validThemes = ['obsidian-gold', 'solar-eclipse', 'abyssal-blue', 'arctic-breeze', 'void', 'vampire-night', 'neon-jungle', 'cyber-hacker', 'retro-wave', 'twilight-blush', 'graphite', 'vintage-dos', 'paper-white'];
  const storedTheme = localStorage.getItem('theme');
  const [theme, setTheme] = useState(validThemes.includes(storedTheme) ? storedTheme : 'void');

  useEffect(() => {
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  return (
    <AuthProvider>
      <ThemeContext.Provider value={{ theme, setTheme }}>
        <Header />
        <div className="content-wrapper">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </div>
        <Footer />
        <ScrollToTop />
      </ThemeContext.Provider>
    </AuthProvider>
  );
}

export default App;
