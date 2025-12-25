'use client'

import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { useState, useEffect } from 'react'
import {
  Menu,
  X,
  User,
  LogOut,
  Bell,
  Home,
  Truck,
  MapPin,
  DollarSign,
  Users,
  Settings
} from 'lucide-react'
import { useNotificationStore } from '@/lib/store'

export default function Navbar() {
  const { data: session } = useSession()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const { unreadCount, setUnreadCount } = useNotificationStore()

  useEffect(() => {
    if (session?.user) {
      fetchNotifications()
    }
  }, [session])

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications')
      const data = await res.json()
      setUnreadCount(data.unreadCount)
    } catch (error) {
      console.error('Error fetching notifications:', error)
    }
  }

  const getNavItems = () => {
    if (!session?.user) return []

    const baseItems = [
      { href: '/dashboard', label: 'Dashboard', icon: Home }
    ]

    switch (session.user.role) {
      case 'USER':
        return [
          ...baseItems,
          { href: '/pickup/new', label: 'Antar/Jemput', icon: Truck },
          { href: '/pickup/history', label: 'Riwayat', icon: MapPin }
        ]
      case 'TPS':
        return [
          ...baseItems,
          { href: '/tps/requests', label: 'Permintaan', icon: Truck },
          { href: '/tps/map', label: 'Peta Lokasi', icon: MapPin }
        ]
      default:
        return baseItems
    }
  }

  return (
    <nav className="bg-green-600 text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
              <span className="text-green-600 font-bold text-xl">G</span>
            </div>
            <span className="font-bold text-xl">GoClean</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {session?.user ? (
              <>
                {getNavItems().map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center space-x-1 px-3 py-2 rounded-md hover:bg-green-700 transition"
                  >
                    <item.icon size={18} />
                    <span>{item.label}</span>
                  </Link>
                ))}

                {/* Notifications - removed in simplified version */}
                {/* <Link
                  href="/notifications"
                  className="relative p-2 hover:bg-green-700 rounded-full transition"
                >
                  <Bell size={20} />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </Link> */}

                {/* Profile Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center space-x-2 p-2 hover:bg-green-700 rounded-md transition"
                  >
                    <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                      <User size={18} className="text-green-600" />
                    </div>
                    <span className="hidden lg:block">{session.user.name}</span>
                  </button>

                  {isProfileOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                      <Link
                        href={session.user.role === 'TPS' ? '/tps/profile' : '/profile'}
                        className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <User size={18} className="inline mr-2" />
                        Profile
                      </Link>
                      <button
                        onClick={() => signOut({ callbackUrl: '/' })}
                        className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                      >
                        <LogOut size={18} className="inline mr-2" />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-4 py-2 hover:bg-green-700 rounded-md transition"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 bg-white text-green-600 rounded-md hover:bg-gray-100 transition"
                >
                  Daftar
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-green-500">
            {session?.user ? (
              <>
                <div className="px-4 py-2 border-b border-green-500 mb-2">
                  <p className="font-semibold">{session.user.name}</p>
                  <p className="text-sm text-green-200">{session.user.email}</p>
                </div>
                {getNavItems().map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center space-x-2 px-4 py-3 hover:bg-green-700"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <item.icon size={18} />
                    <span>{item.label}</span>
                  </Link>
                ))}
                {/* Notifications removed in simplified version */}
                <Link
                  href={session.user.role === 'TPS' ? '/tps/profile' : '/profile'}
                  className="flex items-center space-x-2 px-4 py-3 hover:bg-green-700"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <User size={18} />
                  <span>Profile</span>
                </Link>
                <button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="flex items-center space-x-2 px-4 py-3 hover:bg-green-700 w-full text-left"
                >
                  <LogOut size={18} />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="block px-4 py-3 hover:bg-green-700"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="block px-4 py-3 hover:bg-green-700"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Daftar
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}
