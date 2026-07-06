import { useContext, useState } from 'react';
import { Palette, Code2, Search, Check } from 'lucide-react';
import { ThemeContext } from '../App';
import './Footer.css';

const themes = [
  { id: 'obsidian-gold', name: 'obsidian gold', bg: '#212121', main: '#FFB300', text: '#BDBDBD', sub: '#424242' },
  { id: 'solar-eclipse', name: 'solar eclipse', bg: '#323437', main: '#e2b714', text: '#d1d0c5', sub: '#2c2e31' },
  { id: 'abyssal-blue', name: 'abyssal blue', bg: '#0f172a', main: '#38bdf8', text: '#cbd5e1', sub: '#1e293b' },
  { id: 'arctic-breeze', name: 'arctic breeze', bg: '#2e3440', main: '#88c0d0', text: '#d8dee9', sub: '#3b4252' },
  { id: 'void', name: 'void', bg: '#000000', main: '#eeeeee', text: '#aaaaaa', sub: '#111111' },
  { id: 'vampire-night', name: 'vampire night', bg: '#282a36', main: '#ff79c6', text: '#f8f8f2', sub: '#44475a' },
  { id: 'neon-jungle', name: 'neon jungle', bg: '#272822', main: '#a6e22e', text: '#f8f8f2', sub: '#3e3d32' },
  { id: 'cyber-hacker', name: 'cyber Dev', bg: '#000000', main: '#00ff00', text: '#008800', sub: '#001100' },
  { id: 'retro-wave', name: 'retro wave', bg: '#2b213a', main: '#f92aad', text: '#f8f8f2', sub: '#1f182b' },
  { id: 'twilight-blush', name: 'twilight blush', bg: '#191724', main: '#ebbcba', text: '#e0def4', sub: '#26233a' },
  { id: 'graphite', name: 'graphite', bg: '#313131', main: '#f3f3f3', text: '#8c8c8c', sub: '#424242' },
  { id: 'vintage-dos', name: 'vintage dos', bg: '#191a1b', main: '#79a617', text: '#e8e6e3', sub: '#222324' },
  { id: 'paper-white', name: 'paper white', bg: '#ffffff', main: '#111111', text: '#555555', sub: '#f0f0f0' }
].sort((a, b) => a.name.localeCompare(b.name));

function Footer() {
  const { theme, setTheme } = useContext(ThemeContext);
  const [search, setSearch] = useState('');

  const filteredThemes = themes.filter(t => t.name.includes(search.toLowerCase()));

  const handleMouseEnter = (themeId) => {
    document.body.setAttribute('data-theme', themeId);
  };

  const handleMouseLeave = () => {
    document.body.setAttribute('data-theme', theme);
  };

  const handleThemeSelect = (themeId) => {
    setTheme(themeId);
    setSearch('');
    // Remove focus from the menu so it hides (or let CSS hover handle it)
  };

  return (
    <footer className="app-footer">
      <div className="footer-left">
        <span className="footer-text">© 2026 KeyFlow</span>
      </div>

      <div className="footer-center">
        {/* Placeholder for test stats if active */}
      </div>

      <div className="footer-right">
        <div className="theme-selector group">
          <button className="theme-btn">
            <Palette size={14} /> {themes.find(t => t.id === theme)?.name || 'Theme'}
          </button>

          <div className="theme-menu bg-sub">
            <div className="theme-search">
              <Search size={14} />
              <input
                type="text"
                placeholder="Theme..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="theme-list">
              {filteredThemes.map(t => (
                <div
                  key={t.id}
                  className={`theme-option ${theme === t.id ? 'active' : ''}`}
                  onClick={() => handleThemeSelect(t.id)}
                  onMouseEnter={() => handleMouseEnter(t.id)}
                  onMouseLeave={handleMouseLeave}
                >
                  <span className="theme-name">
                    {theme === t.id ? <Check size={12} className="active-icon text-main" /> : <span className="active-icon-placeholder"></span>}
                    {t.name}
                  </span>

                  <div className="theme-preview-pill" style={{ backgroundColor: t.bg }}>
                    <span className="theme-dot" style={{ backgroundColor: t.main }}></span>
                    <span className="theme-dot" style={{ backgroundColor: t.text }}></span>
                    <span className="theme-dot" style={{ backgroundColor: t.sub }}></span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
