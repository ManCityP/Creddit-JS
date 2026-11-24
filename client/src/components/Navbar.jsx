import { Link } from 'react-router-dom'

function Navegator(){
    return(
        <>
            <Link to="/">Home</Link>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
        </>
    )
}

export default Navegator;