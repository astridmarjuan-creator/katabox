import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import ConfigError from './pages/ConfigError.jsx'
import { AuthProvider } from './contexts/AuthContext.jsx'
import { isSupabaseConfigured } from './supabaseClient'
import './styles/index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {isSupabaseConfigured ? (
      <AuthProvider>
        <App />
      </AuthProvider>
    ) : (
      <ConfigError />
    )}
  </React.StrictMode>,
)
