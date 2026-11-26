import './App.css'
import Login from './pages/Login.jsx'
import Register from './pages/Register'
import Home from './pages/Home'
import Navbar from './components/Navbar.jsx'
import { Routes, Route } from 'react-router-dom'

function App() {

  return (
    <>
        <Navbar />

        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
        </Routes>
    </>
  )
}

export default App
