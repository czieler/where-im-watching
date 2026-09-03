import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import PublicSitePage from './components/PublicSitePage.tsx'

const publicPages = {
  '/support': 'support',
  '/privacy': 'privacy',
  '/marketing': 'marketing',
} as const

const publicPage = publicPages[window.location.pathname as keyof typeof publicPages]

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {publicPage ? <PublicSitePage page={publicPage} /> : <App />}
  </StrictMode>,
)
