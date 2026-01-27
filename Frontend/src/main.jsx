import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import Layout from './components/layouts/layout/layout'
import { AuthProvider } from './components/context/authcontext'


createRoot(document.getElementById('root')).render(
  <BrowserRouter>
      <AuthProvider>
        <Layout />
      </AuthProvider>
  </BrowserRouter>
)
