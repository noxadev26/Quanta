import { useState, useEffect } from 'react';
import { auth } from './firebase.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";
import { db } from './firebase.js';

import Landing from './pages/Landing.jsx';
import Auth from './pages/Auth.jsx';
import Beranda from './pages/Beranda.jsx';
import Eksplorasi from './pages/Eksplorasi.jsx';
import Upload from './pages/Upload.jsx';
import Inbox from './pages/Inbox.jsx';
import Profil from './pages/Profil.jsx';
import Admin from './pages/Admin.jsx';

function App() {
  const [page, setPage] = useState('landing');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState('');
  const [theme, setTheme] = useState('gelap');

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if(currentUser){
        const userDoc = await getDoc(doc(db, "users", currentUser.uid));
        setUser({...currentUser,...userDoc.data()});
        setPage('beranda');
      } else {
        setUser(null);
        setPage('landing');
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => { await auth.signOut(); showToast('Logout berhasil'); }

  if(loading) return <div style={{background:'#0a0a0a', height:'100vh'}}></div>;

  const renderPage = () => {
    if(!user) {
      if(page === 'auth') return <Auth setPage={setPage} showToast={showToast} />
      return <Landing setPage={setPage} />
    }
    return (
      <div className={`${theme} glassmorphic`}>
        <div className="top-navbar">
          <div><h1>QUANTA</h1><p>PROJECT</p></div>
          <button className="icon-btn" onClick={() => setTheme(theme === 'gelap'? 'terang' : 'gelap')}>🌓</button>
        </div>
        <div className="page-content">
          {page === 'beranda' && <Beranda user={user} showToast={showToast} />}
          {page === 'eksplorasi' && <Eksplorasi showToast={showToast} />}
          {page === 'upload' && <Upload user={user} showToast={showToast} />}
          {page === 'inbox' && <Inbox showToast={showToast} />}
          {page === 'profil' && <Profil user={user} handleLogout={handleLogout} showToast={showToast} />}
          {page === 'admin' && user.role === 'admin' && <Admin showToast={showToast} />}
        </div>
        <div className="navbar">
          <button className={`nav-item ${page === 'beranda'? 'active' : ''}`} onClick={() => setPage('beranda')}>📚<span>Beranda</span></button>
          <button className={`nav-item ${page === 'eksplorasi'? 'active' : ''}`} onClick={() => setPage('eksplorasi')}>🔍<span>Eksplorasi</span></button>
          <button className="nav-item nav-add" onClick={() => setPage('upload')}>+</button>
          <button className={`nav-item ${page === 'inbox'? 'active' : ''}`} onClick={() => setPage('inbox')}>💬<span>Inbox</span></button>
          <button className={`nav-item ${page === 'profil'? 'active' : ''}`} onClick={() => setPage('profil')}>👤<span>Profil</span></button>
        </div>
        {toast && <div className="toast">{toast}</div>}
      </div>
    )
  }

  return renderPage();
}
export default App;