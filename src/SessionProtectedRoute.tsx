import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "./redux/store";
import { logoutUserSession } from "./redux/features/userAuthSlice";
import {type ReactNode } from "react";

const SessionProtectedRoute = ({ children }: { children: ReactNode }) => {
 const { loginTimestamp } = useSelector((state: RootState) => state.userAuth);
  const dispatch = useDispatch<AppDispatch>();

  const sessionDuration = 3600000;
  const now = Date.now();

  if (loginTimestamp != null && now - loginTimestamp > sessionDuration) {
    dispatch(logoutUserSession())
  }

  return children;
};

export default SessionProtectedRoute;