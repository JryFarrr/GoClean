import { create } from 'zustand'

interface User {
  id: string
  name: string
  email: string
  role: string
  phone?: string
  address?: string
  avatar?: string
}

interface AuthState {
  user: User | null
  isLoading: boolean
  setUser: (user: User | null) => void
  setLoading: (loading: boolean) => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  setUser: (user) => set({ user }),
  setLoading: (isLoading) => set({ isLoading })
}))

interface LocationState {
  latitude: number | null
  longitude: number | null
  address: string
  setLocation: (lat: number, lng: number, address: string) => void
  clearLocation: () => void
}

export const useLocationStore = create<LocationState>((set) => ({
  latitude: null,
  longitude: null,
  address: '',
  setLocation: (latitude, longitude, address) => set({ latitude, longitude, address }),
  clearLocation: () => set({ latitude: null, longitude: null, address: '' })
}))

interface NotificationState {
  unreadCount: number
  setUnreadCount: (count: number) => void
  incrementUnread: () => void
  decrementUnread: () => void
}

export const useNotificationStore = create<NotificationState>((set) => ({
  unreadCount: 0,
  setUnreadCount: (count) => set({ unreadCount: count }),
  incrementUnread: () => set((state) => ({ unreadCount: state.unreadCount + 1 })),
  decrementUnread: () => set((state) => ({ unreadCount: Math.max(0, state.unreadCount - 1) }))
}))
