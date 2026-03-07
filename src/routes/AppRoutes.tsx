import React, { Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { publicRoutes, authRoutes, protectedRoutes } from "./index";
import ProtectedRoute from "./ProtectedRoute";

const LoadingFallback: React.FC = () => (
  <div className="loading-container">
    <div className="spinner-wrapper">
      <div className="spinner"></div>
      <p className="loading-text">Loading...</p>
    </div>
  </div>
);

const AppRoutes: React.FC = () => {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        {/* Public Routes */}
        {publicRoutes.map((route) => {
          const Component = route.element;
          return (
            <Route key={route.path} path={route.path} element={<Component />} />
          );
        })}

        {protectedRoutes.map((route) => {
  const Component = route.element;
  return (
    <Route
      key={route.path}
      path={route.path}
      element={
        <ProtectedRoute 
          pageName={route.title}
          description={`Access your ${route.title.toLowerCase()} with personalized tracking and insights.`}
        >
          <Component />
        </ProtectedRoute>
      }
    />
  );
})}

        {/* Auth Routes */}
        {authRoutes.map((route) => {
          const Component = route.element;
          return (
            <Route key={route.path} path={route.path} element={<Component />} />
          );
        })}

        {/* Protected Routes */}
        {protectedRoutes.map((route) => {
          const Component = route.element;
          return (
            <Route
              key={route.path}
              path={route.path}
              element={
                <ProtectedRoute>
                  <Component />
                </ProtectedRoute>
              }
            />
          );
        })}

        {/* 404 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
