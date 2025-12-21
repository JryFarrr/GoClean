import 'next-auth'
import { Role } from '@prisma/client'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name: string
      role: Role | string
      image?: string | null
    }
  }

  interface User {
    id: string
    email: string
    name: string
    role: Role | string
    image?: string | null
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    role: Role | string
  }
}
