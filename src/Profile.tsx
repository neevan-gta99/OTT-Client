import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { RootState } from './redux/store.ts';
import { useSelector } from 'react-redux';
import Navbar from './Navbar.tsx';
import VideoGrid from './VideoGrid.tsx';

function Profile() {
  const { userName } = useParams();
  const navigate = useNavigate();
  const loginTimestamp = useSelector((state: RootState) => state.userAuth.loginTimestamp);
  const userData = useSelector((state: RootState) => state.userAuth.userData);

  useEffect(() => {
    if (loginTimestamp == null) {
      navigate("/login");
    }
  }, [loginTimestamp, navigate]);

  useEffect(() => {
    if (userName && userData && userName !== userData.userName) {
      navigate("/404"); // 404 page par bhejo
    }
  }, [userName, userData, navigate]);

  if (!userData) return <div>Loading...</div>;

  return (
    <div>
      <Navbar data={userData} />
      <h2 className='mt-44 profile-head'>Hey! {userData?.fullName}</h2>
      <VideoGrid />
    </div>
  );
}

export default Profile;