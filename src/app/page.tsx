'use client'

import Link from 'next/link'
import { Recycle, MapPin, DollarSign, Truck, ArrowRight, CheckCircle, Leaf, Globe, Sparkles } from 'lucide-react'
import { useEffect, useState } from 'react'

export default function Home() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-green-600 via-green-700 to-emerald-900 text-white">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-72 h-72 bg-green-400/20 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-emerald-400/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
          <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-green-300/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '4s' }}></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 py-24 md:py-32">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className={`space-y-6 ${mounted ? 'animate-slide-up' : 'opacity-0'}`}>
              <div className="inline-block">
                <span className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-md rounded-full text-sm font-medium border border-white/30">
                  <Sparkles size={16} />
                  Platform Pengelolaan Sampah Modern
                </span>
              </div>

              <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight">
                GoClean
              </h1>

              <p className="text-2xl md:text-3xl font-semibold text-green-50">
                Kelola Sampah Jadi Mudah & Menguntungkan
              </p>

              <p className="text-lg md:text-xl text-green-100 leading-relaxed">
                Foto sampahmu, kirim lokasi, dan tunggu dijemput oleh TPS terdekat.
                Sampah yang layak jual bisa jadi uang tambahan!
              </p>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link
                  href="/register"
                  className="group flex items-center justify-center space-x-2 bg-white text-green-600 px-8 py-4 rounded-2xl font-semibold text-lg hover:bg-green-50 transition-all duration-300 hover:shadow-2xl hover:scale-105"
                >
                  <span>Mulai Sekarang</span>
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="/login"
                  className="group flex items-center justify-center space-x-2 bg-white/10 backdrop-blur-md border-2 border-white/40 text-white px-8 py-4 rounded-2xl font-semibold text-lg hover:bg-white/20 transition-all duration-300"
                >
                  <span>Sudah Punya Akun?</span>
                </Link>
              </div>
            </div>

            {/* Hero Image/Icon */}
            <div className={`hidden md:flex justify-center ${mounted ? 'animate-scale-in' : 'opacity-0'}`} style={{ animationDelay: '0.2s' }}>
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full blur-3xl opacity-50 animate-pulse-slow"></div>
                <div className="relative w-80 h-80 glass rounded-full flex items-center justify-center border-4 border-white/30">
                  <Leaf size={160} className="text-white animate-float" strokeWidth={1.5} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Wave Divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z" fill="#f0fdf4" />
          </svg>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-b from-green-50 to-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 gradient-text">
              Fitur Unggulan
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              GoClean menyediakan solusi lengkap untuk pengelolaan sampah dari rumah Anda
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: MapPin, title: 'Penjemputan Lokasi', desc: 'Gunakan GPS untuk menentukan lokasi penjemputan sampah dengan mudah dan akurat', gradient: 'from-green-500 to-emerald-500' },
              { icon: Truck, title: 'Foto & Video', desc: 'Dokumentasikan sampah Anda dengan foto dan video untuk proses verifikasi yang cepat', gradient: 'from-emerald-500 to-teal-500' },
              { icon: DollarSign, title: 'Jual Sampah', desc: 'Sampah plastik, kertas, logam bisa dijual dan menghasilkan uang tambahan', gradient: 'from-green-600 to-green-500' },
              { icon: Recycle, title: 'Integrasi TPS', desc: 'Terhubung langsung dengan TPS terdekat untuk proses penjemputan yang efisien', gradient: 'from-teal-600 to-emerald-500' }
            ].map((feature, i) => (
              <div
                key={i}
                className="group relative bg-white rounded-3xl p-8 hover:shadow-2xl transition-all duration-500 border border-green-100 hover:border-green-300 hover:-translate-y-2"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className={`w-16 h-16 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg`}>
                  <feature.icon size={32} className="text-white" strokeWidth={2} />
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-800 group-hover:text-green-600 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.desc}
                </p>

                {/* Hover Glow Effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-green-400/0 to-emerald-400/0 group-hover:from-green-400/5 group-hover:to-emerald-400/5 rounded-3xl transition-all duration-500"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-gradient-to-br from-white via-green-50/50 to-emerald-50/30 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle, #16a34a 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 gradient-text">
              Cara Kerja
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Hanya dengan beberapa langkah mudah, sampah Anda akan dijemput
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: 1, title: 'Daftar Akun', desc: 'Buat akun gratis sebagai masyarakat', icon: '📱' },
              { step: 2, title: 'Foto Sampah', desc: 'Ambil foto atau video sampah Anda', icon: '📸' },
              { step: 3, title: 'Tentukan Lokasi', desc: 'Pilih lokasi penjemputan di peta', icon: '📍' },
              { step: 4, title: 'Tunggu Dijemput', desc: 'TPS akan datang menjemput sampah', icon: '🚛' }
            ].map((item, i) => (
              <div key={item.step} className="relative text-center group">
                {/* Connection Line */}
                {i < 3 && (
                  <div className="hidden md:block absolute top-12 left-1/2 w-full h-1 bg-gradient-to-r from-green-300 to-emerald-300 -z-10"></div>
                )}

                <div className="relative">
                  <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-3xl flex flex-col items-center justify-center text-3xl font-bold mx-auto mb-6 shadow-xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 border-4 border-white">
                    <span className="text-4xl mb-1">{item.icon}</span>
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center text-green-600 font-bold shadow-lg border-2 border-green-400">
                    {item.step}
                  </div>
                </div>

                <h3 className="text-xl font-bold mb-3 text-gray-800">{item.title}</h3>
                <p className="text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* User Types Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 gradient-text">
              Siapa Saja Bisa Menggunakan GoClean
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                emoji: '👨‍👩‍👧‍👦',
                title: 'Masyarakat',
                items: ['Foto & video sampah', 'Tentukan lokasi penjemputan', 'Pantau status penjemputan', 'Jual sampah layak jual', 'Riwayat transaksi lengkap'],
                gradient: 'from-green-500 to-emerald-500'
              },
              {
                emoji: '🏭',
                title: 'Pihak TPS',
                items: ['Lihat permintaan penjemputan', 'Peta lokasi terintegrasi GIS', 'Terima/tolak permintaan', 'Input berat & harga sampah', 'Kelola transaksi penjualan'],
                gradient: 'from-emerald-600 to-teal-600'
              },
              {
                emoji: '👨‍💼',
                title: 'Admin',
                items: ['Kelola semua pengguna', 'Kelola TPS terdaftar', 'Monitor semua transaksi', 'Statistik & laporan', 'Pengaturan sistem'],
                gradient: 'from-green-600 to-green-700'
              }
            ].map((type, i) => (
              <div
                key={i}
                className="group relative bg-gradient-to-br from-white to-green-50/50 rounded-3xl p-8 hover:shadow-2xl transition-all duration-500 border-2 border-green-200 hover:border-green-400 hover:-translate-y-2"
              >
                {/* Gradient Accent Bar */}
                <div className={`absolute top-0 left-0 right-0 h-2 bg-gradient-to-r ${type.gradient} rounded-t-3xl`}></div>

                <div className="text-6xl mb-6 group-hover:scale-110 transition-transform duration-300 inline-block">
                  {type.emoji}
                </div>

                <h3 className="text-2xl font-bold mb-6 text-gray-800">
                  {type.title}
                </h3>

                <ul className="space-y-4">
                  {type.items.map((item, j) => (
                    <li key={j} className="flex items-start space-x-3 group/item">
                      <div className="flex-shrink-0 w-6 h-6 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mt-0.5">
                        <CheckCircle size={16} className="text-white" strokeWidth={3} />
                      </div>
                      <span className="text-gray-700 group-hover/item:text-gray-900 transition-colors">
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 bg-gradient-to-br from-green-600 via-emerald-600 to-teal-700 text-white overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute top-10 right-10 w-96 h-96 bg-green-400/20 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-10 left-10 w-80 h-80 bg-emerald-400/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '3s' }}></div>
        </div>

        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <div className="mb-8">
            <Globe size={64} className="mx-auto text-white/80 animate-float" />
          </div>

          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
            Mulai Kelola Sampah dengan GoClean
          </h2>

          <p className="text-xl md:text-2xl mb-10 text-green-50 max-w-2xl mx-auto leading-relaxed">
            Bergabung sekarang dan jadikan lingkungan lebih bersih sambil menghasilkan uang!
          </p>

          <Link
            href="/register"
            className="group inline-flex items-center space-x-3 bg-white text-green-600 px-12 py-5 rounded-2xl font-bold text-lg hover:bg-green-50 transition-all duration-300 hover:shadow-2xl hover:scale-105"
          >
            <span>Daftar Gratis</span>
            <ArrowRight size={24} className="group-hover:translate-x-2 transition-transform" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                  <Leaf size={24} className="text-white" />
                </div>
                <h3 className="text-2xl font-bold">GoClean</h3>
              </div>
              <p className="text-gray-400 leading-relaxed">
                Aplikasi pengelolaan sampah berbasis GIS untuk masyarakat Indonesia
              </p>
            </div>

            <div>
              <h4 className="font-bold mb-4 text-lg">Menu</h4>
              <ul className="space-y-3 text-gray-400">
                <li><Link href="/login" className="hover:text-green-400 transition-colors inline-flex items-center gap-2 group">
                  <span className="group-hover:translate-x-1 transition-transform">Login</span>
                </Link></li>
                <li><Link href="/register" className="hover:text-green-400 transition-colors inline-flex items-center gap-2 group">
                  <span className="group-hover:translate-x-1 transition-transform">Daftar</span>
                </Link></li>
                <li><Link href="/about" className="hover:text-green-400 transition-colors inline-flex items-center gap-2 group">
                  <span className="group-hover:translate-x-1 transition-transform">Tentang Kami</span>
                </Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4 text-lg">Layanan</h4>
              <ul className="space-y-3 text-gray-400">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                  Penjemputan Sampah
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                  Jual Sampah
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                  Integrasi TPS
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4 text-lg">Kontak</h4>
              <ul className="space-y-3 text-gray-400">
                <li className="flex items-start gap-2">
                  <span className="text-green-500">📧</span>
                  info@goclean.id
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500">📱</span>
                  +62 812 3456 7890
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500">📍</span>
                  Jakarta, Indonesia
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-700 pt-8 text-center">
            <p className="text-gray-400 flex items-center justify-center gap-2">
              <span>© 2025 GoClean.</span>
              <span className="text-gray-600">|</span>
              <span>Final Project - Teknologi Basis Data</span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

