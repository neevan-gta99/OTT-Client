import { useEffect } from 'react'
import { useSelector } from 'react-redux';
import { NavLink, useNavigate } from 'react-router-dom'
import type { RootState } from './redux/store';

const Home = () => {
    const navigate = useNavigate();
    const loginTimestamp = useSelector((state: RootState) => state.userAuth.loginTimestamp);

    useEffect(() => {
        if (loginTimestamp != null) {
            navigate('/profile');
        }
    }, []); 

    return (
        <>
            <div className='main-div'>
                {/* Wrapper div for header */}
                <div className="custom-header">
                    <NavLink
                        to="/login"
                        className="custom-button"
                    >
                        Login
                    </NavLink>
                    <NavLink
                        to="/signup"
                        className="custom-button"
                    >
                        Sign Up
                    </NavLink>
                </div>

                {/* Main content centered */}
                <div className="content-div">
                    <main>
                        <h1 className="z-100">
                            GTA OTT
                        </h1>
                        <p className="z-100">
                            This is a sample OTT Demo
                        </p>
                    </main>
                </div>
            </div>
        </>
    )
}

export default Home;