import { useState } from 'react'
import HomeScreen from './components/HomeScreen'
import EntryFormScreen from './components/EntryFormScreen'
import ExitScreen from './components/ExitScreen'
import { VIEWS } from './constants/views'
import './App.css'

function App() {
  const [view, setView] = useState(VIEWS.HOME)

  const handleGoHome = () => setView(VIEWS.HOME)

  switch (view) {
    case VIEWS.ENTRY:
      return <EntryFormScreen onBack={handleGoHome} />
    case VIEWS.EXIT:
      return <ExitScreen onBack={handleGoHome} />
    default:
      return <HomeScreen onSelect={setView} />
  }
}

export default App
