import React, { useState } from "react";
import type { FormEvent, ChangeEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  TrendingUp,
  Eye,
  EyeOff,
  Mail,
  User,
  Lock,
  AlertCircle,
  CheckCircle,
  ArrowLeft,
} from "lucide-react";
import "../../styles/pages/_auth.scss";

interface FormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  general?: string;
}

interface PasswordStrength {
  score: number;
  label: string;
  color: string;
}

const SignUp: React.FC = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState<boolean>(false);
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/v1";

  // Password strength calculator
  const calculatePasswordStrength = (password: string): PasswordStrength => {
    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^a-zA-Z0-9]/.test(password)) score++;

    if (score <= 2) return { score, label: "Weak", color: "error" };
    if (score <= 3) return { score, label: "Fair", color: "warning" };
    if (score <= 4) return { score, label: "Good", color: "success" };
    return { score, label: "Strong", color: "success" };
  };

  const passwordStrength = calculatePasswordStrength(formData.password);

  // Validation rules
  const validateField = (name: string, value: string): string | undefined => {
    switch (name) {
      case "name":
        if (!value.trim()) return "Name is required";
        if (value.trim().length < 2)
          return "Name must be at least 2 characters";
        return undefined;

      case "email":
        if (!value.trim()) return "Email is required";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
          return "Invalid email format";
        return undefined;

      case "password":
        if (!value) return "Password is required";
        if (value.length < 8) return "Password must be at least 8 characters";
        if (!/(?=.*[a-z])(?=.*[A-Z])/.test(value))
          return "Password must contain uppercase and lowercase letters";
        if (!/(?=.*\d)/.test(value))
          return "Password must contain at least one number";
        return undefined;

      case "confirmPassword":
        if (!value) return "Please confirm your password";
        if (value !== formData.password) return "Passwords do not match";
        return undefined;

      default:
        return undefined;
    }
  };

  // Handle input change
  const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }

    // Validate confirm password when password changes
    if (name === "password" && touched.confirmPassword) {
      const confirmError = validateField(
        "confirmPassword",
        formData.confirmPassword,
      );
      setErrors((prev) => ({ ...prev, confirmPassword: confirmError }));
    }
  };

  // Handle blur (field loses focus)
  const handleBlur = (e: ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    const error = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  // Validate all fields
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    Object.keys(formData).forEach((key) => {
      const error = validateField(key, formData[key as keyof FormData]);
      if (error) newErrors[key as keyof FormErrors] = error;
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();

    // Mark all fields as touched
    setTouched({
      name: true,
      email: true,
      password: true,
      confirmPassword: true,
    });

    if (!validateForm()) return;

    setLoading(true);
    setErrors({});

    try {
      const response = await fetch(`${API_URL}/auth/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Registration failed");
      }

      // Success - redirect to sign in
      navigate("/auth/signin", {
        state: {
          message: "Account created successfully! Please sign in.",
          email: formData.email,
        },
      });
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Registration failed. Please try again.";
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
        {/* Left Side - Branding */}
        <div className="auth-branding">
          <div className="branding-content">
            <div className="brand-logo">
              <TrendingUp className="logo-icon" />
              <h1>Trading Dashboard</h1>
            </div>
            <h2>Start Your Trading Journey</h2>
            <p>Join thousands of traders making smarter investment decisions</p>

            <div className="features-list">
              <div className="feature-item">
                <CheckCircle className="feature-icon" />
                <span>Real-time market data</span>
              </div>
              <div className="feature-item">
                <CheckCircle className="feature-icon" />
                <span>Portfolio tracking</span>
              </div>
              <div className="feature-item">
                <CheckCircle className="feature-icon" />
                <span>Advanced analytics</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="auth-form-section">
          <div className="auth-card">
            <div className="auth-header">
              <h2>Create Account</h2>
              <p>Get started with your free account</p>
            </div>

            {/* General Error */}
            {errors.general && (
              <div className="alert alert-error" role="alert">
                <AlertCircle className="alert-icon" />
                <span>{errors.general}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="auth-form" noValidate>
              {/* Name Field */}
              <div className="form-group">
                <label htmlFor="name" className="form-label">
                  Full Name
                </label>
                <div className="input-wrapper">
                  <input
                    id="name"
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`form-input ${
                      errors.name && touched.name ? "error" : ""
                    }`}
                    placeholder="John Doe"
                    disabled={loading}
                    autoComplete="name"
                  />
                </div>
                {errors.name && touched.name && (
                  <span className="form-error">{errors.name}</span>
                )}
              </div>

              {/* Email Field */}
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
                  />
                </div>
                {errors.email && touched.email && (
                  <span className="form-error">{errors.email}</span>
                )}
              </div>

              {/* Password Field */}
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
                    placeholder="Create a strong password"
                    disabled={loading}
                    autoComplete="new-password"
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

                {/* Password Strength Indicator */}
                {formData.password && !errors.password && (
                  <div className="password-strength">
                    <div className="strength-bars">
                      {[1, 2, 3, 4, 5].map((level) => (
                        <div
                          key={level}
                          className={`strength-bar ${
                            level <= passwordStrength.score
                              ? passwordStrength.color
                              : ""
                          }`}
                        />
                      ))}
                    </div>
                    <span
                      className={`strength-label strength-${passwordStrength.color}`}
                    >
                      {passwordStrength.label}
                    </span>
                  </div>
                )}
              </div>

              {/* Confirm Password Field */}
              <div className="form-group">
                <label htmlFor="confirmPassword" className="form-label">
                  Confirm Password
                </label>
                <div className="input-wrapper">
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`form-input ${
                      errors.confirmPassword && touched.confirmPassword
                        ? "error"
                        : ""
                    }`}
                    placeholder="Re-enter your password"
                    disabled={loading}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="password-toggle"
                    aria-label={
                      showConfirmPassword ? "Hide password" : "Show password"
                    }
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="toggle-icon" />
                    ) : (
                      <Eye className="toggle-icon" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && touched.confirmPassword && (
                  <span className="form-error">{errors.confirmPassword}</span>
                )}
              </div>

              {/* Submit Button */}
              <button type="submit" className="btn-submit" disabled={loading}>
                {loading ? (
                  <>
                    <span className="spinner"></span>
                    Creating Account...
                  </>
                ) : (
                  "Create Account"
                )}
              </button>

              {/* Terms */}
              <p className="form-terms">
                By creating an account, you agree to our{" "}
                <Link to="/terms" className="link">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link to="/privacy" className="link">
                  Privacy Policy
                </Link>
              </p>
            </form>

            {/* Sign In Link */}
            <div className="auth-footer">
              <p>
                Already have an account?{" "}
                <Link to="/auth/signin" className="link-primary">
                  Sign In
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;