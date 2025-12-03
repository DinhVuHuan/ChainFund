import { Routes, Route } from 'react-router-dom'
import Home from './views/Home'
import Header from './components/Header'

const App = () => {
  return (
    <div className="min-h-screen relative">
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
    </div>
  )
}

export default App
