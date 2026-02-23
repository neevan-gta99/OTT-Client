import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "./redux/store";
import { fetchTransactionsData, logoutUserSession } from "./redux/features/userAuthSlice";
import { type ReactNode, useEffect } from "react";

const SessionProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { loginTimestamp, transactionsLoaded } = useSelector((state: RootState) => state.userAuth);
  const dispatch = useDispatch<AppDispatch>();
  const userData = useSelector((state: RootState) => state.userAuth.userData);

  const sessionDuration = 3600000;
  const now = Date.now();

  useEffect(() => {
    if (loginTimestamp != null && now - loginTimestamp > sessionDuration) {
      dispatch(logoutUserSession());
    }
  }, [loginTimestamp, dispatch]);

  useEffect(() => {
    if (userData?.userName && !transactionsLoaded) {
      dispatch(fetchTransactionsData({
        username: userData.userName,
        offset: 0
      }));
    }
  }, [userData?.userName, transactionsLoaded, dispatch]);

  return children;
};

export default SessionProtectedRoute;