import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { 
  User, 
  onAuthStateChanged, 
  signInWithPopup, 
  signOut as firebaseSignOut
} from 'firebase/auth'
import { auth, googleProvider } from '../lib/firebase'

interface AuthContextType {
  user: User | null
  loading: boolean
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user)
      setLoading(false)
    })

    return unsubscribe
  }, [])

  const signInWithGoogle = async () => {
    try {
      setLoading(true)
      const result = await signInWithPopup(auth, googleProvider)
      
      // 管理者権限チェック
      const userEmail = result.user.email || ''
      const adminEmails = process.env.NEXT_PUBLIC_ADMIN_EMAILS?.split(',').filter(email => email.trim()) || []
      
      // 管理者メールアドレスが設定されている場合のみチェック
      if (adminEmails.length > 0 && !adminEmails.includes(userEmail)) {
        await firebaseSignOut(auth)
        setLoading(false)
        throw new Error('管理者権限がありません。許可されたメールアドレスでログインしてください。')
      }
      
      // Firebase の onAuthStateChanged が即座に発火しない場合があるため、
      // 認証成功時に手動でローディング状態を解除
      setUser(result.user)
      setLoading(false)
      
    } catch (error) {
      console.error('Google sign-in error:', error)
      setLoading(false)
      throw error
    }
  }

  const signOut = async () => {
    try {
      await firebaseSignOut(auth)
    } catch (error) {
      console.error('Sign out error:', error)
      throw error
    }
  }

  const value = {
    user,
    loading,
    signInWithGoogle,
    signOut
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}