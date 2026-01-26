import { BrowserRouter } from 'react-router-dom'
import { Toaster } from '@/shared/components/ui/toaster'
import AppRoutes from './routes'

function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
      <Toaster />
    </BrowserRouter>
  )
}

export default App
