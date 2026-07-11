export default function Profil({ user, handleLogout, showToast }) {
  return (
    <div className="profil-page">
      <div className="profile-card">
        <div className="avatar">{user.nama.charAt(0).toUpperCase()}</div>
        <h2>{user.nama}</h2>
        <span className={`badge ${user.type}`}>{user.type}</span>
      </div>
      <div className="stats-grid">
        <div><h3>0</h3><p>Materi</p></div>
        <div><h3>0</h3><p>Like</p></div>
        <div><h3>0</h3><p>Followers</p></div>
        <div><h3>0</h3><p>Following</p></div>
      </div>
      <button onClick={() => showToast('Edit Profil Coming Soon')} className="btn-secondary" style={{width: '100%', marginBottom: 10}}>Edit Profil</button>
      <button onClick={handleLogout} className="btn-logout">Logout</button>
    </div>
  );
}