export default function Navbar() {
  return (
    <nav className="glass fixed top-4 left-1/2 -translate-x-1/2 w-[95%] md:w-[80%] rounded-2xl px-6 py-4 flex justify-between items-center z-50">
      <h1 className="text-2xl font-bold text-[#00BFFF] drop-shadow-[0_0_10px_#00BFFF]">QUANTA</h1>
      <div className="space-x-6 text-white">
        <a className="hover:text-[#00BFFF] transition">Home</a>
        <a className="hover:text-[#00BFFF] transition">Dashboard</a>
        <a className="hover:text-[#00BFFF] transition">About</a>
      </div>
    </nav>
  )
    }
