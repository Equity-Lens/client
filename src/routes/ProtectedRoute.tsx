import React from 'react';
import { useAuth } from '../context/AuthContext';
import LockedPage from '../components/features/LockedPage';

interface ProtectedRouteProps {
  children: React.ReactNode;
  pageName: string;
  description?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  pageName,
  description 
}) => {
  const { isAuthenticated, loading } = useAuth();

  console.log(' ProtectedRoute check:', { isAuthenticated, loading, pageName });

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="protected-route-loading">
        <div className="spinner"></div>
        <p>Verifying access...</p>
      </div>
    );
  }

  // NOT authenticated - Show locked page message (NO redirect!)
  if (!isAuthenticated) {
    console.log(' Not authenticated, showing locked page');
    return <LockedPage pageName={pageName} description={description} />;
  }

  // Authenticated - Show the actual page
  console.log(' Authenticated, showing protected page');
  return <>{children}</>;
};

export default ProtectedRoute;