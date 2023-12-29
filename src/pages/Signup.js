import React, { useState } from 'react';
import './SignupLogin.css';

const Signup = ({ onToggle, onSignupSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [signupSuccess, setSignupSuccess] = useState(false);

  const handleSignup = async () => {
    try {
      const response = await fetch('https://urslhashingtask-production.up.railway.app/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log('Signup successful:', data);
        setSignupSuccess(true);
        alert('Signup successful! Please login.');
        setUsername('');
        setPassword('');
        onSignupSuccess();
      } else {
        setError(data.message || 'Error signing up');
      }
    } catch (error) {
      setError('Error signing up');
    }
  };

  return (
    <div className="signup-login-card">
      <h2>Signup</h2>
      {signupSuccess ? (
        <p className="success-message">Signup successful! Please login.</p>
      ) : (
        <>
          <div className="input-group">
            <label>Username:</label>
            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} />
          </div>
          <div className="input-group">
            <label>Password:</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <div className="button-group">
            <button onClick={handleSignup}>Sign Up</button>
            <p>
              Already have an account?{' '}
              <span className="toggle-link" onClick={() => onToggle('login')}>
                Login
              </span>
            </p>
          </div>
          {error && <p className="error-message">{error}</p>}
        </>
      )}
    </div>
  );
};

const Login = ({ onToggle }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async () => {
    try {
      const response = await fetch('https://urslhashingtask-production.up.railway.app/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        const { token, username } = data;
        localStorage.setItem('authToken', token);
        localStorage.setItem('userData', JSON.stringify({ username, token }));
        alert('Login successful!');
        window.location.href = '/dashboard';
      } else {
        setError(data.message || 'Invalid credentials');
      }
    } catch (error) {
      setError('Error logging in');
    }
  };

  return (
    <div className="signup-login-card">
      <h2>Login</h2>
      <div className="input-group">
        <label>Username:</label>
        <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} />
      </div>
      <div className="input-group">
        <label>Password:</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      </div>
      <div className="button-group">
        <button onClick={handleLogin}>Login</button>
        <p>
          Don't have an account?{' '}
          <span className="toggle-link" onClick={() => onToggle('signup')}>
            Sign Up
          </span>
        </p>
      </div>
      {error && <p className="error-message">{error}</p>}
    </div>
  );
};

const SignupLogin = () => {
  const [activeForm, setActiveForm] = useState('signup');

  const handleToggle = (form) => {
    setActiveForm(form);
  };

  const handleSignupSuccess = () => {
    setActiveForm('login');
  };

  return (
    <div className="signup-login-container">
      {activeForm === 'signup' ? (
        <Signup onToggle={handleToggle} onSignupSuccess={handleSignupSuccess} />
      ) : (
        <Login onToggle={handleToggle} />
      )}
    </div>
  );
};

export default SignupLogin;
