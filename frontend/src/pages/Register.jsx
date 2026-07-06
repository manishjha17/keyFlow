import { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { User, Lock, UserPlus, Mail } from 'lucide-react';
import '../styles/Auth.css';

function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { user, login } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (username.length < 3) {
      return setError('Username must be at least 3 characters');
    }

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password })
      });
      
      const data = await res.json();
      
      if (res.ok) {
        login(data);
        navigate('/', { replace: true });
      } else {
        setError(data.message || 'Registration failed');
      }
    } catch (err) {
      setError('Server error, please try again.');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card bg-sub">
        <div className="auth-header">
          <UserPlus size={32} className="text-main" />
          <h2>Register</h2>
        </div>
        
        {error && <div className="auth-error">{error}</div>}
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="input-group bg-bg">
            <User size={18} className="input-icon" />
            <input 
              type="text" 
              placeholder="Username" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="input-group bg-bg">
            <Mail size={18} className="input-icon" />
            <input 
              type="email" 
              placeholder="Email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="input-group bg-bg">
            <Lock size={18} className="input-icon" />
            <input 
              type="password" 
              placeholder="Password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="auth-btn">
            Create Account
          </button>
        </form>
        
        <div className="auth-footer">
          Already have an account? <Link to="/login" className="text-main">Login</Link>
        </div>
      </div>
    </div>
  );
}

export default Register;
