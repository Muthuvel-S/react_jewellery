import React, { useState } from 'react';
import { Gem, LockKeyhole, UserRound, Sparkles, ShieldCheck } from 'lucide-react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import hero from '../assets/jewellery-hero.png';

export default function LoginPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [values, setValues] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to="/app/dashboard" replace />;

  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      await login(values.username, values.password);
      navigate('/app/dashboard', { replace: true });
    } catch (err) {
      setError(err.message || 'Invalid username or password');
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="login-page" style={{ '--hero': `url(${hero})` }}>
      {/* Left Column: Brand Story & Showroom Hero */}
      <section className="login-story">
        <div className="brand-mark">
          <div className="brand-emblem" style={{ width: '44px', height: '44px' }}>
            <Gem size={24} />
          </div>
          <div>
            <div style={{ color: '#FFFFFF', fontSize: '1.25rem', letterSpacing: '0.16em', fontFamily: "'Cinzel', serif" }}>
              ANDAL JEWELLERS
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--gold-soft)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
              Showroom Management ERP
            </div>
          </div>
        </div>

        <div>
          <p className="eyebrow light" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Sparkles size={14} /> Luxury Gold, Diamond & Silver Showroom
          </p>
          <h1>Craftsmanship & Financial Precision.</h1>
          <p>
            An integrated showroom ERP suite delivering live metal rates, POS billing, Nagai Seettu savings, gold loan portfolios, and workshop ledgers.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--sidebar-muted)', fontSize: '0.78rem' }}>
          <ShieldCheck size={16} style={{ color: 'var(--gold-soft)' }} />
          <span>Role-Based Access Control · Secure Encryption Active</span>
        </div>
      </section>

      {/* Right Column: Clean Login Form */}
      <section className="login-panel">
        <form className="login-card" onSubmit={submit}>
          <div className="mobile-brand" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <div className="brand-emblem" style={{ width: '36px', height: '36px' }}>
              <Gem size={18} />
            </div>
            <span style={{ fontFamily: "'Cinzel', serif", fontWeight: 800, fontSize: '1.15rem', color: 'var(--text-primary)', letterSpacing: '0.1em' }}>
              ANDAL JEWELLERS
            </span>
          </div>

          <div>
            <p className="eyebrow">Secure Portal</p>
            <h2>Sign In to Workspace</h2>
            <p className="subtle" style={{ fontSize: '0.85rem', marginTop: '4px' }}>
              Enter your showroom credentials to access daily counter operations.
            </p>
          </div>

          {error && (
            <div className="alert error" role="alert">
              <div>{error}</div>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="username">Username</label>
            <div className="input-wrap">
              <UserRound size={17} />
              <input
                id="username"
                autoFocus
                autoComplete="username"
                placeholder="Enter username"
                value={values.username}
                onChange={e => setValues(v => ({ ...v, username: e.target.value }))}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="input-wrap">
              <LockKeyhole size={17} />
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                placeholder="Enter password"
                value={values.password}
                onChange={e => setValues(v => ({ ...v, password: e.target.value }))}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg"
            disabled={busy}
            style={{ width: '100%', marginTop: '4px' }}
          >
            {busy ? <span className="btn-spinner" /> : null}
            <span>{busy ? 'Verifying Credentials…' : 'Sign In Securely'}</span>
          </button>

          <p className="subtle" style={{ textAlign: 'center', fontSize: '0.76rem', margin: '0.5rem 0 0' }}>
            Authorized showroom staff only. All system sessions are logged.
          </p>
        </form>
      </section>
    </main>
  );
}
