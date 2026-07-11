export default function Landing({ setPage }) {
  return (
    <div className="landing-container glassmorphic gelap">
      <div className="dev-banner">🚧 PERINGATAN: Website ini masih dalam tahap pengembangan 🚧</div>
      <nav className="landing-nav">
        <div className="nav-left"><h1>QUANTA</h1><p>PROJECT</p></div>
        <div className="nav-right"><button className="btn-nav" onClick={() => setPage('auth')}>Masuk</button></div>
      </nav>
      <section className="hero">
        <h1>Platform Edukasi Digital<br/>untuk Anggota SSI</h1>
        <p>QUANTA adalah perpustakaan digital + forum akademik. Berbagi materi, filter by bidang, dan terhubung dengan sesama pelajar.</p>
        <div className="hero-buttons">
          <button className="btn-primary" onClick={() => setPage('auth')}>Mulai Bergabung</button>
          <a href="#fitur" className="btn-secondary">Pelajari Fitur</a>
        </div>
      </section>
      <section id="fitur" className="features">
        <h2>Standar Profesional. Fokus Edukasi.</h2>
        <div className="feature-grid">
          <div className="feature-card"><div className="icon">📚</div><h3>Perpustakaan Digital</h3><p>Upload dan cari materi by Bidang Studi</p></div>
          <div className="feature-card"><div className="icon">🔍</div><h3>Filter Cerdas</h3><p>Temukan materi: Ekonomi, Psikologi, Hukum, dll</p></div>
          <div className="feature-card"><div className="icon">👑</div><h3>Kurasi Admin</h3><p>Semua materi ditinjau tim Kurator SSI</p></div>
        </div>
      </section>
      <footer className="landing-footer">
        <p className="copyright">© 2026 QUANTA by SSI. All rights reserved.</p>
      </footer>
    </div>
  )
}