import { Navigate, Outlet } from "react-router-dom";
import { useAppSelector } from "@/hooks/useRedux";

export const ProtectedRoute = () => {
  const { accessToken } = useAppSelector((state) => state.auth);

  if (!accessToken) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};
