function App() {
  return (
    <div className="container fade-in">
      <header>
        <h1>QUANTA</h1>
        <p>Platform berbagi materi</p>
      </header>

      <div className="card glass fade-in">
        <h3>📚 Belum ada materi</h3>
        <p>Jadilah kontributor pertama di QUANTA!</p>
      </div>

      <div className="card glass fade-in">
        <h3>🚀 Fitur Unggulan</h3>
        <p>Upload materi, diskusi, dan belajar bareng</p>
      </div>

      <nav className="glass">
        <button>🏠 Beranda</button>
        <button>🔍 Eksplorasi</button>
        <button>💬 Inbox</button>
        <button>👤 Profil</button>
      </nav>
    </div>
  )
}

export default App
