import { Link } from "react-router-dom";
import { videos } from "../utils/Videos.ts";

interface Video {
  id: string;
  title: string;
  thumbnail: string;
  src: string;
  coins: number;
}

const VideoGrid = () => {
  return (
    <div className="video-grid">
      {videos.map((video: Video, index: number) => (
        <div key={index} className="video-card">
          <img src={video.thumbnail} alt={video.title} className="video-thumb" />
          <div className="overlay">
            <Link to={`/video/${video.id}`} className="play-btn">▶</Link>
          </div>
          <div className="video-title">{video.title}</div>
          {/* <div className="video-price">{video.coins} 🪙</div> */}
        </div>
      ))}
    </div>
  );
};

export default VideoGrid;