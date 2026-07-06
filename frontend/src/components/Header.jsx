import { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Flame, User, LogOut } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import TypingLogo from './TypingLogo';
import './Header.css';

function Header() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Returns 0 if the user skipped yesterday and today (streak expired)
  const effectiveStreak = () => {
    if (!user || !user.lastTestDate) return 0;
    const now = new Date();
    const today = new Date(now); today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);
    const last = new Date(user.lastTestDate); last.setHours(0, 0, 0, 0);
    // Valid if last test was today or yesterday
    if (last >= yesterday) return user.streak ?? 0;
    return 0;
  };

  const handleLogoClick = (e) => {
    if (window.location.pathname === '/') {
      e.preventDefault();
      window.dispatchEvent(new Event('reset-typing-test'));
    }
  };

  return (
    <header className="app-header">
      <Link to="/" onClick={handleLogoClick} className="logo" style={{ gap: '0.5rem', display: 'flex', alignItems: 'center' }}>
        <div className="logo-icon-container">
          <TypingLogo size={32} className="text-main logo-custom" />
        </div>
        <h1>Key<span className="text-main">Flow</span></h1>
      </Link>
      
      <nav className="nav-links">
        <div className="stat-pill">
          <Flame size={16} className="text-main" />
          <span>{effectiveStreak()}</span>
        </div>
        <Link to="/leaderboard" className="nav-item">Leaderboard</Link>
        
        {user ? (
          <>
            <Link to="/profile" className="nav-item user-info">
              <img
                src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${user.avatarSeed || user.username}`}
                alt="avatar"
                style={{ width: '22px', height: '22px', borderRadius: '50%' }}
              />
              <span>{user.username}</span>
            </Link>
            <button onClick={handleLogout} className="nav-item flex-center">
              <LogOut size={16} />
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="nav-item">Login</Link>
            <Link to="/register" className="nav-item">Register</Link>
          </>
        )}
      </nav>
    </header>
  );
}

export default Header;
