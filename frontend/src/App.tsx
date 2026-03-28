import { BrowserRouter } from 'react-router-dom'
import { useEffect } from 'react'
import { AppRoutes } from './routes/AppRoutes'
import { ToastViewport } from './components/ui/toast-viewport'
import { useUIStore } from './store/uiStore'

function App() {
  const theme = useUIStore((state) => state.theme)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  return (
    <BrowserRouter>
      <AppRoutes />
      <ToastViewport />
    </BrowserRouter>
  )
}

export default App
