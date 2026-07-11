export default function BottomNav({ page, setPage, isAdmin }) {
  const navItems = [
    { id: 'beranda', icon: '🏠', label: 'Beranda' },
    { id: 'eksplorasi', icon: '🔍', label: 'Cari' },
    { id: 'upload', icon: '+', label: '', isAdd: true },
    { id: 'inbox', icon: '💬', label: 'Inbox' },
    { id: 'profil', icon: '👤', label: 'Profil' },
  ];

  return (
    <nav className="navbar">
      {navItems.map(item => (
        item.id === 'upload' ? 
        <button key={item.id} onClick={() => setPage(item.id)} className="nav-item nav-add"><span>{item.icon}</span></button>
        :
        <button key={item.id} onClick={() => setPage(item.id)} className={`nav-item ${page === item.id? 'active' : ''}`}>
          <span>{item.icon}</span>{item.label}
        </button>
      ))}
      {isAdmin && <button onClick={() => setPage('admin')} className={`nav-item ${page === 'admin'? 'active' : ''}`}><span>👑</span>Admin</button>}
    </nav>
  );
}