// Decides what to show: the setup screen, the name prompt, or the site.
//
// Day pages sit OUTSIDE the shared layout on purpose. They get no top
// bar, no heading and no padding — just a back arrow in the corner —
// so each one is a genuinely blank canvas.
import { Routes, Route, Navigate } from 'react-router-dom'
import { isSupabaseConfigured } from './lib/supabase.js'
import { useWho } from './lib/WhoContext.jsx'
import SetupNeeded from './components/SetupNeeded.jsx'
import NamePrompt from './components/NamePrompt.jsx'
import Layout from './components/Layout.jsx'
import Notice from './components/Notice.jsx'
import CalendarPage from './pages/CalendarPage.jsx'
import DayPage from './pages/DayPage.jsx'
import EditorPage from './pages/EditorPage.jsx'
import PreviewPage from './pages/PreviewPage.jsx'
import EditDayPage from './pages/EditDayPage.jsx'

// The pages that keep the top bar.
function Framed() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<CalendarPage />} />
        <Route path="/editor" element={<EditorPage />} />
        <Route path="/editor/:day" element={<EditDayPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  )
}

export default function App() {
  const { person, loading } = useWho()

  if (!isSupabaseConfigured) {
    return (
      <div className="page">
        <SetupNeeded />
      </div>
    )
  }

  if (loading) {
    return (
      <div className="page">
        <Notice>Loading…</Notice>
      </div>
    )
  }

  if (!person) {
    return (
      <div className="page">
        <NamePrompt />
      </div>
    )
  }

  return (
    <Routes>
      {/* Blank canvas, no layout. */}
      <Route path="/day/:day" element={<DayPage />} />
      <Route path="/preview/:day" element={<PreviewPage />} />

      {/* Everything else keeps the top bar. */}
      <Route path="*" element={<Framed />} />
    </Routes>
  )
}
