import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  TrendingUp,
  Eye,
  EyeOff,
  Mail,
  Lock,
  AlertCircle,
  CheckCircle,
  ArrowLeft,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

interface FormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

interface FormErrors {
  email?: string;
  password?: string;
  general?: string;
}

interface LocationState {
  message?: string;
  email?: string;
}

const SignIn: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState;
  const { login } = useAuth();

  const [formData, setFormData] = useState<FormData>({
    email: state?.email || "",
    password: "",
    rememberMe: false,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});
  const [successMessage, setSuccessMessage] = useState<string>(
    state?.message || ""
  );

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/v1";

  const validateField = (
    name: string,
    value: string | boolean,
  ): string | undefined => {
    if (typeof value !== "string") return undefined;

    switch (name) {
      case "email":
        if (!value.trim()) return "Email is required";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
          return "Invalid email format";
        return undefined;

      case "password":
        if (!value) return "Password is required";
        if (value.length < 8) return "Password must be at least 8 characters";
        return undefined;

      default:
        return undefined;
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value, type, checked } = e.target;
    const fieldValue = type === "checkbox" ? checked : value;

    setFormData((prev) => ({ ...prev, [name]: fieldValue }));

    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }

    if (successMessage) {
      setSuccessMessage("");
    }
  };

  const handleBlur = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    const error = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    const emailError = validateField("email", formData.email);
    const passwordError = validateField("password", formData.password);

    if (emailError) newErrors.email = emailError;
    if (passwordError) newErrors.password = passwordError;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    e.preventDefault();

    setTouched({ email: true, password: true });

    if (!validateForm()) return;

    setLoading(true);
    setErrors({});

    try {
      const response = await fetch(`${API_URL}/auth/signin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          rememberMe: formData.rememberMe,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Sign in failed");
      }

      const { token, refreshToken, user } = result.data;

      const storage = formData.rememberMe ? localStorage : sessionStorage;
      storage.setItem("token", token);
      storage.setItem("refreshToken", refreshToken);
      storage.setItem("user", JSON.stringify(user));

      login({ id: user.id, name: user.name, email: user.email }, token);

      navigate("/", { replace: true });
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Sign in failed. Please try again.";
      setErrors({ general: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* Back to Home Button */}
      <Link to="/" className="auth-back-btn">
        <ArrowLeft className="back-icon" />
        <span>Back to Home</span>
      </Link>

      <div className="auth-container">
        <div className="auth-branding">
          <div className="branding-content">
            <div className="brand-logo">
              <TrendingUp className="logo-icon" />
              <h1>Trading Dashboard</h1>
            </div>
            <h2>Welcome Back!</h2>
            <p>
              Sign in to continue managing your portfolio and tracking market
              trends
            </p>

            <div className="features-list">
              <div className="feature-item">
                <CheckCircle className="feature-icon" />
                <span>Secure authentication</span>
              </div>
              <div className="feature-item">
                <CheckCircle className="feature-icon" />
                <span>Real-time updates</span>
              </div>
              <div className="feature-item">
                <CheckCircle className="feature-icon" />
                <span>Multi-device access</span>
              </div>
            </div>
          </div>
        </div>

        <div className="auth-form-section">
          <div className="auth-card">
            <div className="auth-header">
              <h2>Sign In</h2>
              <p>Enter your credentials to access your account</p>
            </div>

            {successMessage && (
              <div className="alert alert-success" role="status">
                <CheckCircle className="alert-icon" />
                <span>{successMessage}</span>
              </div>
            )}

            {errors.general && (
              <div className="alert alert-error" role="alert">
                <AlertCircle className="alert-icon" />
                <span>{errors.general}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="auth-form" noValidate>
              <div className="form-group">
                <label htmlFor="email" className="form-label">
                  Email Address
                </label>
                <div className="input-wrapper">
                  <input
                    id="email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`form-input ${
                      errors.email && touched.email ? "error" : ""
                    }`}
                    placeholder="john@example.com"
                    disabled={loading}
                    autoComplete="email"
                    autoFocus
                  />
                </div>
                {errors.email && touched.email && (
                  <span className="form-error">{errors.email}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="password" className="form-label">
                  Password
                </label>
                <div className="input-wrapper">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`form-input ${
                      errors.password && touched.password ? "error" : ""
                    }`}
                    placeholder="Enter your password"
                    disabled={loading}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="password-toggle"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="toggle-icon" />
                    ) : (
                      <Eye className="toggle-icon" />
                    )}
                  </button>
                </div>
                {errors.password && touched.password && (
                  <span className="form-error">{errors.password}</span>
                )}
              </div>

              <div className="form-options">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="rememberMe"
                    checked={formData.rememberMe}
                    onChange={handleChange}
                    className="checkbox-input"
                  />
                  <span className="checkbox-text">Remember me</span>
                </label>
                <Link to="/auth/forgot-password" className="link-secondary">
                  Forgot password?
                </Link>
              </div>

              <button type="submit" className="btn-submit" disabled={loading}>
                {loading ? (
                  <>
                    <span className="spinner"></span>
                    Signing In...
                  </>
                ) : (
                  "Sign In"
                )}
              </button>
            </form>

            <div className="divider">
              <span className="divider-text">or</span>
            </div>

            <div className="social-login">
              <button className="btn-social" type="button">
                <svg className="social-icon" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Continue with Google
              </button>
            </div>

            <div className="auth-footer">
              <p>
                Don't have an account?{" "}
                <Link to="/auth/signup" className="link-primary">
                  Sign Up
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignIn;