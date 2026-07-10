export default function Home() {
  return (
    <div className="pt-32 pb-20 px-6 text-center">
      <div className="glass max-w-3xl mx-auto rounded-3xl p-12">
        <h1 className="text-5xl font-bold text-white mb-4">
          Selamat Datang di <span className="text-[#00BFFF]">QUANTA</span>
        </h1>
        <p className="text-gray-300 mb-8">
          Platform SSI untuk eksplorasi data, visualisasi, dan kolaborasi tim.
        </p>
        <button className="glass px-8 py-3 rounded-xl text-white font-semibold hover:bg-[#0066FF]/30 transition shadow-[0_0_20px_#0066FF]">
          Masuk Dashboard
        </button>
      </div>
    </div>
  )
}
