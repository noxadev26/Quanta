function BottomNav() {
    return (
      <nav className="navbar">
        <button onClick={() => setPage('home')} className={`nav-item ${page === 'home'? 'active' : ''}`}>
          <span>🏠</span>Home
        </button>
        <button onClick={() => setPage('cari')} className={`nav-item ${page === 'cari'? 'active' : ''}`}>
          <span>🔍</span>Cari
        </button>
        <button onClick={() => setShowForm(true)} className="nav-item nav-add">
          <span>+</span>
        </button>
        <button onClick={() => setPage('inbox')} className={`nav-item ${page === 'inbox'? 'active' : ''}`}>
          <span>💬</span>Inbox
        </button>
        <button onClick={() => setPage('profil')} className={`nav-item ${page === 'profil'? 'active' : ''}`}>
          <span>👤</span>Profil
        </button>
      </nav>
    );
  }