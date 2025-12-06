import Link from 'next/link'
import { Recycle, MapPin, DollarSign, Truck, ArrowRight, CheckCircle } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-green-700 to-green-900 text-white">
        <div className="max-w-7xl mx-auto px-4 py-20 md:py-32">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-6xl font-bold mb-6 text-white">
                GoClean
              </h1>
              <p className="text-xl md:text-2xl mb-4 text-white font-medium">
                Kelola Sampah Jadi Mudah & Menguntungkan
              </p>
              <p className="text-lg mb-8 text-green-50">
                Foto sampahmu, kirim lokasi, dan tunggu dijemput oleh TPS terdekat. 
                Sampah yang layak jual bisa jadi uang tambahan!
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/register"
                  className="flex items-center justify-center space-x-2 bg-white text-green-600 px-8 py-4 rounded-full font-semibold hover:bg-green-50 transition"
                >
                  <span>Mulai Sekarang</span>
                  <ArrowRight size={20} />
                </Link>
                <Link
                  href="/login"
                  className="flex items-center justify-center space-x-2 border-2 border-white text-white px-8 py-4 rounded-full font-semibold hover:bg-white/10 transition"
                >
                  <span>Sudah Punya Akun?</span>
                </Link>
              </div>
            </div>
            <div className="hidden md:flex justify-center">
              <div className="w-80 h-80 bg-white/20 rounded-full flex items-center justify-center">
                <Recycle size={200} className="text-white/80" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-gray-800">
            Fitur Unggulan
          </h2>
          <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
            GoClean menyediakan solusi lengkap untuk pengelolaan sampah dari rumah Anda
          </p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Feature 1 */}
            <div className="bg-green-50 rounded-2xl p-6 hover:shadow-lg transition border border-green-100">
              <div className="w-14 h-14 bg-green-600 rounded-full flex items-center justify-center mb-4">
                <MapPin size={28} className="text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-800">Penjemputan Lokasi</h3>
              <p className="text-gray-600">
                Gunakan GPS untuk menentukan lokasi penjemputan sampah dengan mudah dan akurat
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-green-50 rounded-2xl p-6 hover:shadow-lg transition border border-green-100">
              <div className="w-14 h-14 bg-green-600 rounded-full flex items-center justify-center mb-4">
                <Truck size={28} className="text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-800">Foto & Video</h3>
              <p className="text-gray-600">
                Dokumentasikan sampah Anda dengan foto dan video untuk proses verifikasi yang cepat
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-green-50 rounded-2xl p-6 hover:shadow-lg transition border border-green-100">
              <div className="w-14 h-14 bg-green-600 rounded-full flex items-center justify-center mb-4">
                <DollarSign size={28} className="text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-800">Jual Sampah</h3>
              <p className="text-gray-600">
                Sampah plastik, kertas, logam bisa dijual dan menghasilkan uang tambahan
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-green-50 rounded-2xl p-6 hover:shadow-lg transition border border-green-100">
              <div className="w-14 h-14 bg-green-600 rounded-full flex items-center justify-center mb-4">
                <Recycle size={28} className="text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-800">Integrasi TPS</h3>
              <p className="text-gray-600">
                Terhubung langsung dengan TPS terdekat untuk proses penjemputan yang efisien
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-gray-100">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-gray-800">
            Cara Kerja
          </h2>
          <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
            Hanya dengan beberapa langkah mudah, sampah Anda akan dijemput
          </p>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: 1, title: 'Daftar Akun', desc: 'Buat akun gratis sebagai masyarakat' },
              { step: 2, title: 'Foto Sampah', desc: 'Ambil foto atau video sampah Anda' },
              { step: 3, title: 'Tentukan Lokasi', desc: 'Pilih lokasi penjemputan di peta' },
              { step: 4, title: 'Tunggu Dijemput', desc: 'TPS akan datang menjemput sampah' }
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-16 h-16 bg-green-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="text-lg font-semibold mb-2 text-gray-800">{item.title}</h3>
                <p className="text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* User Types Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-800">
            Siapa Saja Bisa Menggunakan GoClean
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Masyarakat */}
            <div className="border-2 border-green-200 rounded-2xl p-8 hover:border-green-500 transition bg-white shadow-sm">
              <div className="text-4xl mb-4">👨‍👩‍👧‍👦</div>
              <h3 className="text-2xl font-semibold mb-4 text-gray-800">Masyarakat</h3>
              <ul className="space-y-3 text-gray-700">
                {[
                  'Foto & video sampah',
                  'Tentukan lokasi penjemputan',
                  'Pantau status penjemputan',
                  'Jual sampah layak jual',
                  'Riwayat transaksi lengkap'
                ].map((item, i) => (
                  <li key={i} className="flex items-center space-x-2">
                    <CheckCircle size={18} className="text-green-600" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* TPS */}
            <div className="border-2 border-green-200 rounded-2xl p-8 hover:border-green-500 transition bg-white shadow-sm">
              <div className="text-4xl mb-4">🏭</div>
              <h3 className="text-2xl font-semibold mb-4 text-gray-800">Pihak TPS</h3>
              <ul className="space-y-3 text-gray-700">
                {[
                  'Lihat permintaan penjemputan',
                  'Peta lokasi terintegrasi GIS',
                  'Terima/tolak permintaan',
                  'Input berat & harga sampah',
                  'Kelola transaksi penjualan'
                ].map((item, i) => (
                  <li key={i} className="flex items-center space-x-2">
                    <CheckCircle size={18} className="text-green-600" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Admin */}
            <div className="border-2 border-green-200 rounded-2xl p-8 hover:border-green-500 transition bg-white shadow-sm">
              <div className="text-4xl mb-4">👨‍💼</div>
              <h3 className="text-2xl font-semibold mb-4 text-gray-800">Admin</h3>
              <ul className="space-y-3 text-gray-700">
                {[
                  'Kelola semua pengguna',
                  'Kelola TPS terdaftar',
                  'Monitor semua transaksi',
                  'Statistik & laporan',
                  'Pengaturan sistem'
                ].map((item, i) => (
                  <li key={i} className="flex items-center space-x-2">
                    <CheckCircle size={18} className="text-green-600" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-green-700 to-green-900 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">
            Mulai Kelola Sampah dengan GoClean
          </h2>
          <p className="text-xl mb-8 text-green-50">
            Bergabung sekarang dan jadikan lingkungan lebih bersih sambil menghasilkan uang!
          </p>
          <Link
            href="/register"
            className="inline-flex items-center space-x-2 bg-white text-green-600 px-10 py-4 rounded-full font-semibold text-lg hover:bg-green-50 transition"
          >
            <span>Daftar Gratis</span>
            <ArrowRight size={24} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-2xl font-bold mb-4">GoClean</h3>
              <p className="text-gray-400">
                Aplikasi pengelolaan sampah berbasis GIS untuk masyarakat Indonesia
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Menu</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/login" className="hover:text-white">Login</Link></li>
                <li><Link href="/register" className="hover:text-white">Daftar</Link></li>
                <li><Link href="/about" className="hover:text-white">Tentang Kami</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Layanan</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Penjemputan Sampah</li>
                <li>Jual Sampah</li>
                <li>Integrasi TPS</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Kontak</h4>
              <ul className="space-y-2 text-gray-400">
                <li>info@goclean.id</li>
                <li>+62 812 3456 7890</li>
                <li>Jakarta, Indonesia</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 GoClean. Final Project - Teknologi Basis Data</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
