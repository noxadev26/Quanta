import { useState } from 'react'
import './App.css'

function App() {
  return (
    <div className="min-h-screen bg-[#0f172a] text-white">
      {/* NAVBAR */}
      <nav className="border-b border-slate-800 p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-cyan-400">QUANTA</h1>
        <div className="flex gap-3">
          <button className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700">Masuk</button>
          <button className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-600">Daftar</button>
        </div>
      </nav>

      {/* HERO */}
      <section className="text-center py-20 px-4">
        <h2 className="text-5xl font-bold mb-4">Berbagi Ilmu Bareng Komunitas SSI</h2>
        <p className="text-slate-400 mb-8">Pengunjung bisa baca. Anggota bisa nulis & terverifikasi.</p>
        <button className="px-6 py-3 bg-cyan-500 rounded-lg font-semibold">Gabung Jadi Anggota</button>
      </section>

      {/* FEED MATERI */}
      <section className="max-w-3xl mx-auto px-4 pb-20">
        <h3 className="text-2xl font-bold mb-6">Materi Terbaru</h3>
        
        {/* CONTOH POSTINGAN ANGGOTA */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 mb-4">
          <div className="flex items-center gap-3 mb-3">
            <img src="https://i.pravatar.cc/40" className="rounded-full"/>
            <div>
              <p className="font-semibold">Budi SSI <span className="text-xs bg-cyan-500 px-2 py-0.5 rounded">Anggota</span></p>
            </div>
          </div>
          <h4 className="text-xl font-bold mb-2">Cara Cepat Belajar React</h4>
          <p className="text-slate-400">Ini tips dari anggota SSI yang udah terverifikasi...</p>
        </div>

        {/* CONTOH POSTINGAN PENGUNJUNG MENUNGGU */}
        <div className="bg-slate-900 border-yellow-500 rounded-xl p-5 mb-4 opacity-70">
          <p className="text-xs text-yellow-400 mb-2">⏳ Menunggu Verifikasi Admin</p>
          <h4 className="text-xl font-bold">Tutorial GitHub</h4>
        </div>

      </section>
    </div>
  )
}

export default App
