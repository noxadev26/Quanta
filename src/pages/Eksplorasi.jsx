import { useState, useEffect } from 'react';
import { db } from '../firebase.js';
import { collection, getDocs, query, where } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

export default function Eksplorasi({ showToast }) {
  const [materi, setMateri] = useState([]);
  const [filter, setFilter] = useState({bidang: 'Semua', tingkat: 'Semua', tipe: 'Semua'});

  useEffect(() => { fetchMateri() }, []);

  const fetchMateri = async () => {
    const q = query(collection(db, "materi"), where("status", "==", "published"));
    const snapshot = await getDocs(q);
    setMateri(snapshot.docs.map(d => ({id: d.id,...d.data()})));
  }

  const filtered = materi.filter(m => 
    (filter.bidang === 'Semua' || m.bidangUtama === filter.bidang) &&
    (filter.tingkat === 'Semua' || m.tingkat === filter.tingkat)
  );

  return (
    <div className="eksplorasi-page">
      <h2>🔍 Eksplorasi Materi</h2>
      <div className="filter-bar">
        <select className="auth-input" onChange={e => setFilter({...filter, bidang: e.target.value})}><option>Semua</option><option>Psikologi</option><option>Ekonomi</option><option>Hukum</option></select>
        <select className="auth-input" onChange={e => setFilter({...filter, tingkat: e.target.value})}><option>Semua</option><option>Kuliah</option><option>SMA</option></select>
        <select className="auth-input" onChange={e => setFilter({...filter, tipe: e.target.value})}><option>Semua</option><option>Jurnal</option><option>Ringkasan</option></select>
      </div>
      <div className="materi-grid">
        {filtered.map(m => (
          <div key={m.id} className="materi-card"><span className="tag">{m.bidangUtama}</span><h3>{m.judul}</h3><small>{m.penulis}</small></div>
        ))}
      </div>
    </div>
  );
}