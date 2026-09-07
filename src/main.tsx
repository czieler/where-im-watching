import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import PublicSitePage from './components/PublicSitePage.tsx'
import AppErrorBoundary from './components/system/AppErrorBoundary.tsx'
import ErrorPage from './components/system/ErrorPage.tsx'

const publicPages = {
  '/support': 'support',
  '/privacy': 'privacy',
  '/marketing': 'marketing',
} as const

const pathname = window.location.pathname.replace(/\/+$/, '') || '/'
const publicPage = publicPages[pathname as keyof typeof publicPages]

function RootContent() {
  if (publicPage) {
    return <PublicSitePage page={publicPage} />
  }

  if (pathname === '/500') {
    return <ErrorPage status={500} onRetry={() => window.location.assign('/')} />
  }

  if (pathname !== '/') {
    return <ErrorPage status={404} />
  }

  return <App />
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppErrorBoundary>
      <RootContent />
    </AppErrorBoundary>
  </StrictMode>,
)
