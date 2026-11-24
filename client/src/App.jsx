import './App.css'
import Login from './pages/Login.jsx'
import Register from './pages/Register'
import Home from './pages/Home'
import { Routes, Route } from 'react-router-dom'

function App() {


  return (
    <>
        <h1>Welcome</h1>
        <Routes>
            <Route path="/" component={<Home />} />
            <Route path="/login" component={<Login />} />
            <Route path="/register" component={<Register />} />
        </Routes>
    </>
  )
}

export default App
