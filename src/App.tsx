import React from "react";
import { BrowserRouter as Router, useLocation } from "react-router-dom";
import Navigation from "./components/layout/Navigation";
import Footer from "./components/layout/Footer";
import AppRoutes from "./routes/AppRoutes";
import { AuthProvider } from "./context/AuthContext";
import "./styles/main.scss";

const AppContent: React.FC = () => {
  const location = useLocation();

  // Hide navigation and footer on auth pages
  const isAuthPage = location.pathname.startsWith("/auth");

  return (
    <div className="app">
      {!isAuthPage && <Navigation />}
      <div className={isAuthPage ? "" : "page"}>
        <main className={isAuthPage ? "" : "page-content"}>
          <AppRoutes />
        </main>
      </div>
      {!isAuthPage && <Footer />}
    </div>
  );
};

function App() {
  return (
    <Router basename="/">
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;
