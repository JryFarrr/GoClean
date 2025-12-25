/**
 * ============================================================================
 * ZUSTAND GLOBAL STATE MANAGEMENT
 * ============================================================================
 * 
 * File ini mendefinisikan global state stores menggunakan Zustand library.
 * Zustand adalah state management yang lebih sederhana dibanding Redux.
 * 
 * MENGAPA ZUSTAND?
 * ----------------
 * - ✅ Lebih simple dibanding Redux (no boilerplate)
 * - ✅ TypeScript support yang excellent
 * - ✅ Tidak perlu Provider/Context wrapper
 * - ✅ Performance bagus (re-render hanya component yang subscribe)
 * - ✅ DevTools support untuk debugging
 * 
 * STORES YANG TERSEDIA:
 * ---------------------
 * 1. useAuthStore - Menyimpan data user yang sedang login
 * 2. useLocationStore - Menyimpan lokasi yang dipilih di peta
 * 3. useNotificationStore - Counter notifikasi yang belum dibaca
 * 
 * CARA PENGGUNAAN:
 * ----------------
 * import { useAuthStore } from '@/lib/store'
 * 
 * // Dalam React component:
 * const { user, setUser } = useAuthStore()
 * 
 * // Update state:
 * setUser({ id: '123', name: 'John', ... })
 * 
 * // Subscribe hanya ke field tertentu (performance optimization):
 * const user = useAuthStore((state) => state.user)
 * 
 * Dependencies:
 * - zustand: State management library
 * 
 * Author: GoClean Team
 * Last Updated: December 2024
 * ============================================================================
 */

// ===== IMPORTS =====
import { create } from 'zustand'

// ===== TYPE DEFINITIONS =====

/**
 * Interface untuk User object
 * Digunakan di AuthState untuk type safety
 */
interface User {
  id: string          // Unique ID dari database
  name: string        // Nama lengkap user
  email: string       // Email untuk login
  role: string        // ADMIN, TPS, atau USER
  phone?: string      // Nomor telepon (optional)
  address?: string    // Alamat lengkap (optional)
  avatar?: string     // URL foto profil (optional)
}

// ===== AUTH STORE =====

/**
 * Interface untuk Authentication State
 * Store ini menyimpan data user yang sedang login
 */
interface AuthState {
  user: User | null              // Data user (null jika belum login)
  isLoading: boolean             // Loading state saat fetch user data
  setUser: (user: User | null) => void    // Function untuk set user
  setLoading: (loading: boolean) => void  // Function untuk set loading
}

/**
 * AUTH STORE - Mengelola state authentication
 * 
 * Fungsi:
 * - Menyimpan data user yang sedang login
 * - Track loading state saat fetch user
 * - Provide actions untuk update user data
 * 
 * Cara Penggunaan:
 * ----------------
 * // Get user data
 * const { user, isLoading } = useAuthStore()
 * 
 * // Update user setelah login
 * const { setUser } = useAuthStore()
 * setUser({ id: '1', name: 'John', email: 'john@example.com', role: 'USER' })
 * 
 * // Clear user saat logout
 * setUser(null)
 * 
 * // Set loading saat fetch
 * const { setLoading } = useAuthStore()
 * setLoading(true)
 * // ... fetch data ...
 * setLoading(false)
 */
export const useAuthStore = create<AuthState>((set) => ({
  // Initial state
  user: null,           // Belum ada user (belum login)
  isLoading: true,      // Default loading true (akan di-set false setelah check session)

  // Actions
  setUser: (user) => set({ user }),                    // Update user data
  setLoading: (isLoading) => set({ isLoading })        // Update loading state
}))

// ===== LOCATION STORE =====

/**
 * Interface untuk Location State
 * Store ini menyimpan lokasi yang dipilih user di peta
 */
interface LocationState {
  latitude: number | null         // Latitude koordinat (null jika belum pilih)
  longitude: number | null        // Longitude koordinat (null jika belum pilih)
  address: string                 // Alamat lengkap dari koordinat
  setLocation: (lat: number, lng: number, address: string) => void  // Set lokasi
  clearLocation: () => void       // Clear/reset lokasi
}

/**
 * LOCATION STORE - Mengelola state lokasi pickup
 * 
 * Fungsi:
 * - Menyimpan koordinat yang dipilih user di MapComponent
 * - Menyimpan alamat hasil reverse geocoding
 * - Digunakan untuk form pickup request
 * 
 * Flow Penggunaan:
 * ----------------
 * 1. User klik lokasi di peta (MapComponent)
 * 2. MapComponent call setLocation(lat, lng, address)
 * 3. Form pickup request baca lokasi dari store
 * 4. Setelah submit, call clearLocation() untuk reset
 * 
 * Cara Penggunaan:
 * ----------------
 * // Get current location
 * const { latitude, longitude, address } = useLocationStore()
 * 
 * // Set location (biasanya dari MapComponent)
 * const { setLocation } = useLocationStore()
 * setLocation(-7.257472, 112.752090, 'Jl. Contoh No. 123, Surabaya')
 * 
 * // Clear location (setelah submit form)
 * const { clearLocation } = useLocationStore()
 * clearLocation()
 */
export const useLocationStore = create<LocationState>((set) => ({
  // Initial state
  latitude: null,       // Belum ada lokasi terpilih
  longitude: null,      // Belum ada lokasi terpilih
  address: '',          // Alamat kosong

  // Actions
  setLocation: (latitude, longitude, address) => set({ latitude, longitude, address }),
  clearLocation: () => set({ latitude: null, longitude: null, address: '' })
}))

// ===== NOTIFICATION STORE =====

/**
 * Interface untuk Notification State
 * Store ini menyimpan counter notifikasi yang belum dibaca
 */
interface NotificationState {
  unreadCount: number                   // Jumlah notifikasi belum dibaca
  setUnreadCount: (count: number) => void        // Set count ke nilai spesifik
  incrementUnread: () => void           // Tambah 1 (bisa dipanggil dari WebSocket)
  decrementUnread: () => void           // Kurangi 1 (saat notif dibaca)
}

/**
 * NOTIFICATION STORE - Mengelola counter notifikasi
 * 
 * Fungsi:
 * - Menyimpan jumlah notifikasi yang belum dibaca
 * - Provide actions untuk update counter
 * - Ditampilkan sebagai badge di Navbar
 * 
 * Flow Penggunaan:
 * ----------------
 * 1. Saat load app, fetch unread count dari API
 * 2. Set count dengan setUnreadCount(count)
 * 3. Saat ada notif baru, call incrementUnread()
 * 4. Saat user baca notif, call decrementUnread()
 * 
 * Cara Penggunaan:
 * ----------------
 * // Get unread count (untuk badge)
 * const { unreadCount } = useNotificationStore()
 * 
 * // Set initial count (dari API)
 * const { setUnreadCount } = useNotificationStore()
 * setUnreadCount(5)
 * 
 * // Tambah count (notif baru masuk)
 * const { incrementUnread } = useNotificationStore()
 * incrementUnread()
 * 
 * // Kurangi count (user baca notif)
 * const { decrementUnread } = useNotificationStore()
 * decrementUnread()
 * 
 * NOTE: decrementUnread menggunakan Math.max(0, ...) untuk
 * mencegah count menjadi negatif
 */
export const useNotificationStore = create<NotificationState>((set) => ({
  // Initial state
  unreadCount: 0,       // Default 0 (akan di-update dari API)

  // Actions
  setUnreadCount: (count) => set({ unreadCount: count }),
  incrementUnread: () => set((state) => ({ unreadCount: state.unreadCount + 1 })),
  decrementUnread: () => set((state) => ({
    unreadCount: Math.max(0, state.unreadCount - 1)  // Prevent negative count
  }))
}))

