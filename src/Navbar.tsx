import { useDispatch } from "react-redux";
import type { AppDispatch } from "./redux/store";
import { logoutUserSession } from "./redux/features/userAuthSlice";
import { NavLink, useNavigate, useLocation } from "react-router-dom";

type UserData = {
  coins: number;
  userName?: string;
  fullName?: string;
};

type NavbarProps = {
  data: UserData | null; 
};

const Navbar = ({ data }: NavbarProps) => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const location = useLocation();

  const handleLogout = () => {
    dispatch(logoutUserSession()).then(() => {
      navigate("/login");
    });
  };

  const coins = data?.coins ?? 0;
  
  const isVideoPage = location.pathname.startsWith("/video/");
  const isProfilePage = location.pathname === "/profile" || location.pathname.startsWith("/profile/");
  const isBuyCoinsPage = location.pathname === "/buy-coins";

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <span className="brand-text">Coins: {coins}</span>

        {/* Conditional buttons */}
        {isVideoPage ? (
          <>
            <span className="brand-text">
              <NavLink to="/profile">Profile</NavLink>
            </span>
            <span className="brand-text">
              <NavLink to="/buy-coins">Buy Coins</NavLink>
            </span>
          </>
        ) : isBuyCoinsPage ? (
          <span className="brand-text">
            <NavLink to="/profile">Profile</NavLink>
          </span>
        ) : isProfilePage ? (
          <span className="brand-text">
            <NavLink to="/buy-coins">Buy Coins</NavLink>
          </span>
        ) : null}

      </div>
      <div className="navbar-right">
        <button onClick={handleLogout} className="logout-btn">
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;