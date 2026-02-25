import { createContext, useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState(null)
  const [loading, setLoading] = useState(true)
  const [manualLogout, setManualLogout] = useState(false)
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
    setManualLogout(false)
    sessionStorage.setItem('siga.just_logged_in', '1')
    navigate('/')
  }

  const logout = () => {
    setManualLogout(true)
    sessionStorage.removeItem("session-warning-shown");
    localStorage.removeItem('auth')
    setAuth(null)
    navigate('/login')
  }

  return (
    <AuthContext.Provider
      value={{ auth, login, logout, loading, manualLogout }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
