import { Navigate, Outlet } from 'react-router-dom';

// Ensures a parent selected a child profile before entering child mode.
export const ChildModeRoute = (): JSX.Element => {
  const selectedChildId = localStorage.getItem('selected_child_id');

  if (!selectedChildId) {
    return <Navigate to="/child-selection" replace />;
  }

  return <Outlet />;
};

