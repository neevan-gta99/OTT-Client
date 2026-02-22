import { useNavigate, useParams } from "react-router-dom";
import { videoMap } from "../utils/Videos.ts";
import { useEffect, useState } from "react";
import { BASE_URL } from "./config/apiconfig.ts";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "./redux/store.ts";
import { fetchUserData } from "./redux/features/userAuthSlice.ts";
import Navbar from "./Navbar.tsx";

function VideoPage() {
    const { id } = useParams();
    const [video, setVideo] = useState<any>(null);
    const [allowed, setAllowed] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(true);
    const navigate = useNavigate();

    const user_data = useSelector((state: RootState) => state.userAuth.userData);
    const dispatch = useDispatch<AppDispatch>();
    const loginTimestamp = useSelector((state: RootState) => state.userAuth.loginTimestamp);

    useEffect(() => {
        if (loginTimestamp == null) {
            navigate("/login");
        }
    }, [loginTimestamp, navigate]);

    useEffect(() => {
        const fetchAccess = async () => {
            if (!id) return;
            
            try {
                setLoading(true);
                const res = await fetch(`${BASE_URL}/api/users/video-access/${id}`, {
                    credentials: "include"
                });

                const videoData = videoMap[id];
                if (!videoData) {
                    navigate("/404");
                    return;
                }

                if (res.status === 403) {
                    setAllowed(false);
                    setVideo(videoData);
                } else {
                    const data = await res.json();
                    setAllowed(data.allowed);
                    setVideo(videoData);
                }
            } catch (err) {
                console.error("Error checking access:", err);
                setAllowed(false);
                setVideo(videoMap[id!]);
            } finally {
                setLoading(false);
            }
        };

        fetchAccess();
    }, [id, navigate]);

    const buyVideo = async () => {
        if (!id || !video) return;
        
        const vid = videoMap[id];
        let Vid_Coins;

        if (vid.coins) {
            if (!user_data || user_data.coins < vid.coins) {
                alert("You don't have enough coins to buy this video \n First you have to buy coins");
                return;
            }
            Vid_Coins = vid.coins;
        }

        try {
            const res = await fetch(`${BASE_URL}/api/users/buy-video/${id}`, {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    vidcoins: Vid_Coins,
                    vidhead: vid.title
                })
            });

            if (res.ok) {
                const data = await res.json();
                alert(`Success! Now you have access of this video -> ${vid.title}`);
                if (user_data?.userName) {
                    dispatch(fetchUserData(user_data.userName));
                }
                setAllowed(data.allowed);
                setVideo(videoMap[id!]);
            } else {
                console.error("Buy failed:", res.status);
                alert("Failed to buy video. Please try again.");
            }
        } catch (err) {
            console.error("Error buying video:", err);
            alert("Error buying video. Please try again.");
        }
    };

    if (loading) return <div>Loading...</div>;
    if (!video) return <h2>Video not found</h2>;

    return (
        <>
            {/* ✅ Navbar ko data pass karo, null ho sakta hai - ab error nahi aayega */}
            <Navbar data={user_data} />
            <div className="video-page text-center">
                <div className="video-left">
                    {allowed ? (
                        <video className="video-player" controls>
                            <source src={video.src} type="video/mp4" />
                        </video>
                    ) : (
                        <img src={video.thumbnail} alt={video.title} className="video-thumb" />
                    )}
                </div>

                <div className="video-right">
                    <h2>{video.title}</h2>
                    <p>
                        {allowed ? "Here it is" : (
                            <button onClick={buyVideo} className="buy-btn">
                                Buy for {video.coins} coins
                            </button>
                        )}
                    </p>
                </div>
            </div>
        </>
    );
}

export default VideoPage;