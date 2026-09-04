import { useState } from 'react'
import { emptyRegisterForm } from '../complaintShared.js'

export default function RegisterPage({ apiBaseUrl, error, loading, onRegister, onGoHome, onGoLogin }) {
  const [registerForm, setRegisterForm] = useState(emptyRegisterForm)

  const submitRegister = (event) => {
    event.preventDefault()
    onRegister(registerForm)
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
            <button type="button" className="public-nav-link" onClick={onGoLogin}>
              Login
            </button>
          </div>
        </header>

        <section className="auth-card">
          <div className="auth-brand-block">
            <p className="eyebrow">Create your account</p>
            <h1>Register for complaint tracking</h1>
            <p>Set up a user account so you can submit complaints and later review only your own complaint records.</p>
          </div>

          <div className="auth-meta">
            <span className="pill">API: {apiBaseUrl}</span>
            <span className="pill">Fast signup</span>
          </div>

          <form className="auth-form" onSubmit={submitRegister}>
            <div className="split-grid">
              <label className="field">
                <span>First name</span>
                <input
                  type="text"
                  value={registerForm.firstName}
                  onChange={(event) => setRegisterForm((current) => ({ ...current, firstName: event.target.value }))}
                  placeholder="Kasun"
                  required
                />
              </label>
              <label className="field">
                <span>Last name</span>
                <input
                  type="text"
                  value={registerForm.lastName}
                  onChange={(event) => setRegisterForm((current) => ({ ...current, lastName: event.target.value }))}
                  placeholder="Perera"
                  required
                />
              </label>
            </div>

            <label className="field">
              <span>Email Address</span>
              <input
                type="email"
                value={registerForm.email}
                onChange={(event) => setRegisterForm((current) => ({ ...current, email: event.target.value }))}
                placeholder="user@example.com"
                required
              />
            </label>

            <div className="split-grid">
              <label className="field">
                <span>Phone number</span>
                <input
                  type="text"
                  value={registerForm.phoneNumber}
                  onChange={(event) => setRegisterForm((current) => ({ ...current, phoneNumber: event.target.value }))}
                  placeholder="0712345678"
                  required
                />
              </label>
              <label className="field">
                <span>NIC number</span>
                <input
                  type="text"
                  value={registerForm.nicNumber}
                  onChange={(event) => setRegisterForm((current) => ({ ...current, nicNumber: event.target.value }))}
                  placeholder="200112345678"
                  required
                />
              </label>
            </div>

            <label className="field">
              <span>Password</span>
              <input
                type="password"
                value={registerForm.password}
                onChange={(event) => setRegisterForm((current) => ({ ...current, password: event.target.value }))}
                placeholder="Choose a password"
                required
              />
            </label>

            <div className="auth-actions">
              <button type="submit" className="primary-btn" disabled={loading}>
                {loading ? 'Creating...' : 'Register account'}
              </button>
              <div className="auth-links">
                <span className="helper-text">Already have an account?</span>
                <button type="button" className="text-link" onClick={onGoLogin}>
                  Login here
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
