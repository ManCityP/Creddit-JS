import './App.css'
import Login from './pages/Login.jsx'
import Register from './pages/Register'
import Home from './pages/Home'
import CreatePost from './pages/CreatePost.jsx'
import CommentsTest from './pages/CommentsTest.jsx'
import Navbar from './components/Navbar.jsx'
import { Routes, Route } from 'react-router-dom'

function App() {

  return (
    <>
        <Navbar />

        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/CreatePost" element={<CreatePost />} />
            <Route path="/comments-test" element={<CommentsTest />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
        </Routes>
    </>
  )
}

export default App
