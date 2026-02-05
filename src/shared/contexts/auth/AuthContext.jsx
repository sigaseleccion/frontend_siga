import { createContext, useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const storedAuth = localStorage.getItem('auth')
    if (storedAuth) {
      setAuth(JSON.parse(storedAuth))
    }
    setLoading(false)
  }, [])

  const login = (data) => {
    const authData = {
      token: data.token,
      usuario: data.usuario
    }

    localStorage.setItem('auth', JSON.stringify(authData))
    setAuth(authData)
    navigate('/')
  }

  const logout = () => {
    localStorage.removeItem('auth')
    setAuth(null)
    navigate('/login')
  }

  return (
    <AuthContext.Provider value={{ auth, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
