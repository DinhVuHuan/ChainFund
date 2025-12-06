import { Routes, Route } from 'react-router-dom'
import Home from './views/Home'
import Header from './components/Header'
import DonatePage from "./components/DonatePage"; // 1. Import file mới

const App = () => {
  return (
    <div className="min-h-screen relative">
      <Header />
      <Routes>
        {/* Trang chủ (chứa danh sách dự án) */}
        <Route path="/" element={<Home />} />
        
        {/* 2. Thêm dòng này: Khi đường dẫn là /donate/0, /donate/1... thì mở trang DonatePage */}
        <Route path="/donate/:id" element={<DonatePage />} />
      </Routes>
    </div>
  )
}

export default App