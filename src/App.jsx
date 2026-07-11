import { useState, useEffect } from 'react';
import './App.css';
import { auth, db } from './firebase.js';
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

// IMPORT 8 HALAMAN
import Landing from './pages/Landing.jsx';
import Auth from './pages/Auth.jsx';
import Beranda from './pages/Beranda.jsx';
import Eksplorasi from './pages/Eksplorasi.jsx';
import Upload from './pages/Upload.jsx';
import Inbox from './pages/Inbox.jsx';
import Profil from './pages/Profil.jsx';
import Admin from './pages/Admin.jsx';
import TopNavbar from './components/TopNavbar.jsx';
import BottomNav from './components/BottomNav.jsx';

export default function App() {
  const [user, setUser] = useState(null);
  const [page, setPage] = useState('landing');
  const [theme, setTheme] = useState('glassmorphic');
  const [mode, setMode] = useState('gelap');
  const [isAdmin, setIsAdmin] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (userAuth) => {
      if (userAuth) {
        const userDoc = await getDoc(doc(db, "users", userAuth.uid));
        if(userDoc.exists()){
          const userData = { uid: userAuth.uid,...userDoc.data() };
          setUser(userData);
          setIsAdmin(userData.role === 'admin');
          setPage('beranda');
        }
      } else {
        setUser(null); setIsAdmin(false); setPage('landing');
      }
    });
    return () => unsubscribe();
  }, []);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 3000); }
  const handleLogout = async () => {
    await signOut(auth); showToast('Logout berhasil');
  }

  if (page === 'landing') return <Landing setPage={setPage} />;
  if (!user) return <Auth setPage={setPage} showToast={showToast} />;

  return (
    <div className={`app-container ${theme} ${mode}`}>
      <TopNavbar setMode={setMode} mode={mode} onRefresh={() => window.location.reload()} />
      <div className="page-content">
        {page === 'beranda' && <Beranda user={user} showToast={showToast} />}
        {page === 'eksplorasi' && <Eksplorasi user={user} showToast={showToast} />}
        {page === 'upload' && <Upload user={user} showToast={showToast} />}
        {page === 'inbox' && <Inbox user={user} showToast={showToast} />}
        {page === 'profil' && <Profil user={user} handleLogout={handleLogout} showToast={showToast} />}
        {page === 'admin' && isAdmin && <Admin user={user} showToast={showToast} />}
      </div>
      <BottomNav page={page} setPage={setPage} isAdmin={isAdmin} />
      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}