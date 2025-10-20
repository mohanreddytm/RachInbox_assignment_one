import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { EmailProvider } from './contexts/EmailContext'
import Layout from './components/Layout'
import EmailList from './pages/EmailList'
import EmailDetail from './pages/EmailDetail'
import Dashboard from './pages/Dashboard'
import SearchPage from './pages/Search'
import SettingsPage from './pages/Settings'

function App() {
  return (
    <EmailProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/emails" element={<EmailList />} />
            <Route path="/emails/:id" element={<EmailDetail />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </Layout>
      </Router>
    </EmailProvider>
  )
}

export default App
