export default function HomePage({ session, onGoLogin, onGoRegister, onGoDashboard }) {
  return (
    <section className="home-shell">
      <header className="topbar">
        <button type="button" className="brand" onClick={onGoLogin}>
          TransitCare
        </button>

        <nav className="home-links">
          <button type="button" className="home-nav-link" onClick={onGoLogin}>
            Login
          </button>
          <button type="button" className="home-nav-link" onClick={onGoRegister}>
            Register
          </button>
          {session.token ? (
            <button type="button" className="home-nav-link" onClick={onGoDashboard}>
              Dashboard
            </button>
          ) : null}
        </nav>
      </header>

      <section className="home-hero-screen">
        <div className="home-hero-overlay" />

        <div className="home-hero-copy">
          <div className="home-hero-card">
            <p className="eyebrow">Sri Lanka complaint portal</p>
            <h1>Report transport issues with a clean, simple experience.</h1>
            <p>
              Log in, submit a complaint, and track every request in a modern white dashboard for both users and
              administrators.
            </p>

            <div className="home-hero-actions">
              <button type="button" className="home-btn primary" onClick={onGoLogin}>
                Login
              </button>
              <button type="button" className="home-btn secondary" onClick={onGoRegister}>
                Register
              </button>
            </div>

            <div className="home-feature-grid" style={{ marginTop: '28px' }}>
              <article className="home-feature-card">
                <strong>User view</strong>
                <p>See your own complaints, search by keyword, and filter by route, location, status, and date.</p>
              </article>
              <article className="home-feature-card">
                <strong>Admin view</strong>
                <p>Review every complaint from all users with powerful search and registry-style filters.</p>
              </article>
              <article className="home-feature-card">
                <strong>Clean UI</strong>
                <p>White cards, orange accents, and a polished layout inspired by the screen you shared.</p>
              </article>
            </div>
          </div>
        </div>
      </section>
    </section>
  )
}
