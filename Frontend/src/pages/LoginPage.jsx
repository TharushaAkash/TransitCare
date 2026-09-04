import { useState } from 'react'

export default function LoginPage({ apiBaseUrl, error, loading, onLogin, onGoHome, onGoRegister }) {
  const [loginForm, setLoginForm] = useState({ email: 'admin@sltcomplaints.lk', password: 'Admin@12345' })

  const submitLogin = (event) => {
    event.preventDefault()
    onLogin(loginForm)
  }

  return (
    <section className="auth-screen">
      <div className="auth-layout">
        <header className="topbar">
          <button type="button" className="brand" onClick={onGoHome}>
            TransitCare
          </button>

          <div className="public-actions">
            <button type="button" className="public-nav-link" onClick={onGoHome}>
              Home
            </button>
            <button type="button" className="public-nav-link" onClick={onGoRegister}>
              Register
            </button>
          </div>
        </header>

        <section className="auth-card">
          <div className="auth-brand-block">
            <p className="eyebrow">Member access & complaint tracking</p>
            <h1>Sign in to TransitCare</h1>
            <p>Use your account to create complaints, track status, and review your user-specific complaint history.</p>
          </div>

          <div className="auth-meta">
            <span className="pill">API: {apiBaseUrl}</span>
            <span className="pill">User and admin access</span>
          </div>

          <form className="auth-form" onSubmit={submitLogin}>
            <label className="field">
              <span>Email Address</span>
              <input
                type="email"
                value={loginForm.email}
                onChange={(event) => setLoginForm((current) => ({ ...current, email: event.target.value }))}
                placeholder="admin@sltcomplaints.lk"
                required
              />
            </label>

            <label className="field">
              <span>Password</span>
              <input
                type="password"
                value={loginForm.password}
                onChange={(event) => setLoginForm((current) => ({ ...current, password: event.target.value }))}
                placeholder="Password"
                required
              />
            </label>

            <div className="auth-actions">
              <button type="submit" className="primary-btn" disabled={loading}>
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
              <div className="auth-links">
                <span className="helper-text">Don&apos;t have an account?</span>
                <button type="button" className="text-link" onClick={onGoRegister}>
                  Register here
                </button>
              </div>
            </div>
          </form>

          {error ? <p className="error-box" style={{ marginTop: '16px' }}>{error}</p> : null}
        </section>
      </div>
    </section>
  )
}
