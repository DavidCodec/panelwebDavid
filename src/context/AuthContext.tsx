import { createContext, useContext, useEffect, useState } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '../firebase/config'
import type { ReactNode } from 'react'
import type { User } from 'firebase/auth'

interface AuthContextType {
	user: User | null
	loading: boolean
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true })

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
	const [user, setUser] = useState<User | null>(null)
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		const unsubscribe = onAuthStateChanged(auth, (user) => {
			setUser(user)
			setLoading(false)
		})
		return () => unsubscribe()
	}, [])

	return <AuthContext.Provider value={{ user, loading }}>{children}</AuthContext.Provider>
}