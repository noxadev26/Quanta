export default function TopNavbar({ setMode, mode, onRefresh }) {
  return (
    <nav className="top-navbar">
      <div><h1>Quanta</h1><p>Academic Hub</p></div>
      <div style={{display: 'flex', gap: '10px'}}>
        <button className="icon-btn" onClick={() => setMode(mode === 'gelap'? 'terang' : 'gelap')}>{mode === 'gelap'? '☀️' : '🌙'}</button>
        <button className="icon-btn" onClick={onRefresh}>🔄</button>
      </div>
    </nav>
  );
}