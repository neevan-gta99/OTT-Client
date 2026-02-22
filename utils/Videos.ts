export const videos = [
  { 
    id: "vid01",
    coins: 25,
    src: "/videos/ott-video1.mp4", 
    title: "Video 1", 
    thumbnail: "/images/thumbnail-1.png" 
  },
  { 
    id: "vid02",
    coins: 32,
    src: "/videos/ott-video2.mp4", 
    title: "Video 2", 
    thumbnail: "/images/thumbnail-2.png" 
  },
  { 
    id: "vid03",
    coins: 50,
    src: "/videos/ott-video3.mp4", 
    title: "Video 3", 
    thumbnail: "/images/thumbnail-3.png" 
  },
  { 
    id: "vid04",
    coins: 5,
    src: "/videos/ott-video4.mp4", 
    title: "Video 4", 
    thumbnail: "/images/thumbnail-4.png" 
  },
  { 
    id: "vid05",
    coins: 15,
    src: "/videos/ott-video5.mp4", 
    title: "Video 5", 
    thumbnail: "/images/thumbnail-5.png" 
  },
  { 
    id: "vid06",
    coins: 46,
    src: "/videos/ott-video6.mp4", 
    title: "Video 6", 
    thumbnail: "/images/thumbnail-6.png" 
  },
];

export const videoMap: Record<string, typeof videos[number]> = Object.fromEntries(videos.map(v => [v.id, v]));
