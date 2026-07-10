import { useState } from 'react'
import './App.css'

function App() {
  const [page, setPage] = useState('beranda') // beranda, posting, profil

  return (
    <div className="app-container">
      {/* HEADER */}
      <div className="header">
        <h1>QUANTA</h1>
        <button className="setting-btn">⚙️</button>
      </div>

      {/* BACKGROUND HEADER */}
      <div className="header-bg"></div>

      {/* CONTENT */}
      {page === 'beranda' && (
        <div className="feed">
          {/* POST 1 - ANGGOTA */}
          <div className="post-card">
            <div className="post-header">
              <img src="https://i.pravatar.cc/40" />
              <div>
                <p className="post-name">Budi <span className="badge">Anggota</span></p>
                <p className="post-time">Baru saja</p>
              </div>
            </div>
            <h3 className="post-title">Tips Belajar Coding</h3>
            <p className="post-desc">Mulai dari HTML CSS dulu ya guys, jangan langsung React</p>
            <div className="post-actions">
              <button>❤️ 0</button>
              <button>💬 Komen</button>
            </div>
          </div>

          {/* POST 2 - PENGUNJUNG NUNGGU VERIFIKASI */}
          <div className="post-card pending">
            <p className="pending-text">⏳ Menunggu Verifikasi Admin</p>
            <div className="post-header">
              <img src="https://i.pravatar.cc/41" />
              <div>
                <p className="post-name">Pengunjung123</p>
                <p className="post-time">5 menit lalu</p>
              </div>
            </div>
            <h3 className="post-title">undefined</h3>
            <p className="post-desc">Ini postingan test</p>
            <div className="post-actions">
              <button>❤️ 0</button>
              <button>💬 Komen</button>
            </div>
          </div>
        </div>
      )}

      {page === 'posting' && (
        <div className="posting-page">
          <h2>Buat Postingan</h2>
          <div className="form-group">
            <label>Kategori</label>
            <select>
              <option>🧠 Edukasi</option>
              <option>👥 Sosial</option>
              <option>💻 Teknologi</option>
            </select>
          </div>
          <div className="form-group">
            <label>Judul Postingan</label>
            <input type="text" placeholder="Judul postingan..." />
          </div>
          <div className="form-group">
            <label>Thumbnail</label>
            <div className="upload-box">📷 Klik untuk upload gambar</div>
          </div>
          <div className="form-group">
            <label>Isi Postingan</label>
            <textarea rows="5" placeholder="Tulis materimu disini..."></textarea>
          </div>
          <button className="btn-post">Posting Sekarang</button>
        </div>
      )}

      {page === 'profil' && (
        <div className="profil-page">
          <h2>← Profil</h2>
          <img className="profil-pic" src="https://i.pravatar.cc/100?u=yaegar" />
          <h3>Yaegar</h3>
          <div className="profil-stats">
            <div><b>0</b><p>Post</p></div>
            <div><b>0</b><p>Pengikut</p></div>
            <div><b>0</b><p>Mengikuti</p></div>
          </div>
          <button className="btn-ikuti">Ikuti</button>
          <h4>Postingan</h4>
          <p>Loading...</p>
        </div>
      )}

      {/* NAVBAR BAWAH */}
      <div className="navbar">
        <button onClick={() => setPage('beranda')}>🏠<span>Beranda</span></button>
        <button>🔍<span>Cari</span></button>
        <button onClick={() => setPage('posting')}>➕<span>Posting</span></button>
        <button>📥<span>Kotak Masuk <b className="notif">3</b></span></button>
        <button onClick={() => setPage('profil')}>👤<span>Profil</span></button>
      </div>
    </div>
  )
}

export default App
