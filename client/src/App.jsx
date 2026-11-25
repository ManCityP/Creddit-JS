import './App.css'
import Login from './pages/Login.jsx'
import Register from './pages/Register'
import Home from './pages/Home'
import Navbar from './components/Navbar.jsx'
import CreateCommunity from './pages/CreateCommunity.jsx'
import Community from './pages/Community.jsx'
import { Routes, Route } from 'react-router-dom'

function App() {

  return (
    <>
        <Navbar />

        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/create-community" element={<CreateCommunity />} />
            <Route path="/r/:name" element={<Community />} />
        </Routes>
    </>
  )
}

export default App
