import { Routes, Route } from "react-router-dom"
import Home from "./Home";
import SignUp from "./SignUp";
import Login from "./Login";
import Profile from "./Profile";
import VideoPage from "./VideoPage";
import BuyCoins from "./BuyCoins";
import NotFound from "./NotFound";
import Transactions from "./Transactions";

const AppRoutes = () => {
    return (
        <Routes>
            <Route index element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/profile/:userName" element={<Profile />} />
            <Route path="/video/:id" element={<VideoPage />} />
            <Route path="/buy-coins" element={<BuyCoins />} />
            <Route path="/buy-coins" element={<BuyCoins />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="*" element={<NotFound />} />
        </Routes>
    )
}

export default AppRoutes;