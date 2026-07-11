import { useState } from 'react';
import { db, storage } from '../firebase.js';
import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";
import { ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-storage.js";

export default function Upload({ user, showToast }) {
  const [materiForm, setMateriForm] = useState({judul: '', abstrak: '', bidangUtama: '', tingkat: 'Umum', tipe: 'Ringkasan', file: null});
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
    if(!materiForm.judul ||!materiForm.abstrak ||!materiForm.bidangUtama ||!materiForm.file){
      showToast('Semua field wajib diisi!'); return;
    }
    setLoading(true);
    try {
      const storageRef = ref(storage, `materi/${user.uid}/${Date.now()}-${materiForm.file.name}`);
      const snap = await uploadBytes(storageRef, materiForm.file);
      const fileUrl = await getDownloadURL(snap.ref);

      await addDoc(collection(db, "materi"), {
       ...materiForm, fileUrl, penulis: user.nama, penulisId: user.uid,
        status: 'pending', createdAt: serverTimestamp(), likes: 0
      });
      showToast('Materi dikirim! Menunggu persetujuan Kurator');
    } catch(err) { showToast(err.message); }
    setLoading(false);
  }

  return (
    <div className="upload-page">
      <h2>📤 Upload Materi Baru</h2>
      <input type="text" placeholder="Judul Materi *" className="auth-input" onChange={e => setMateriForm({...materiForm, judul: e.target.value})} />
      <textarea placeholder="Abstrak *" className="auth-input textarea" rows="3" onChange={e => setMateriForm({...materiForm, abstrak: e.target.value})}></textarea>
      <div className="filter-row">
        <select className="auth-input" onChange={e => setMateriForm({...materiForm, bidangUtama: e.target.value})}><option value="">Pilih Bidang *</option><option>Psikologi</option><option>Ekonomi</option></select>
        <select className="auth-input" onChange={e => setMateriForm({...materiForm, tingkat: e.target.value})}><option>Kuliah</option><option>SMA</option></select>
        <select className="auth-input" onChange={e => setMateriForm({...materiForm, tipe: e.target.value})}><option>Ringkasan</option><option>Jurnal</option></select>
      </div>
      <label className="upload-label">📎 Upload File PDF/PPT<input type="file" accept=".pdf,.ppt,.jpg,.png" onChange={e => setMateriForm({...materiForm, file: e.target.files[0]})} hidden /></label>
      <button className="btn-primary" onClick={handleUpload} disabled={loading}>{loading? 'Uploading...' : 'Kirim Untuk Ditinjau'}</button>
    </div>
  );
}