import { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import axios from "axios";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Button from "../ui/button/Button";
import { BASE_URL } from "../../utils/constants";
import DeveloperFooter from "./DeveloperFooter";
import { EyeCloseIcon, EyeIcon } from "../../icons";

export default function ResetPasswordForm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (!token) {
      setError("Invalid or missing reset token");
      return;
    }

    setLoading(true);

    try {
      await axios.post(
        `${BASE_URL}/auth/reset-password`,
        { token, password },
        { withCredentials: true }
      );
      
      setSuccess(true);
      
      // Redirect to sign in after 3 seconds
      setTimeout(() => {
        navigate("/signin");
      }, 3000);
    } catch (err: any) {
      setError(
        err?.response?.data?.error || "Failed to reset password. The link may have expired."
      );
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="flex flex-col flex-1 w-full overflow-y-auto lg:w-1/2 no-scrollbar bg-white dark:bg-gray-900">
        <div className="flex flex-col justify-center flex-1 w-full max-w-md px-6 mx-auto sm:px-8 lg:px-12">
          <div className="w-full text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-red-100 dark:bg-red-900/20">
              <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="mb-3 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl dark:text-white">
              Invalid Link
            </h1>
            <p className="text-base text-gray-600 dark:text-gray-400 mb-8">
              This password reset link is invalid or has expired.
            </p>
            <Link to="/forgot-password">
              <Button className="w-full max-w-xs">Request New Link</Button>
            </Link>
            <DeveloperFooter />
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="flex flex-col flex-1 w-full overflow-y-auto lg:w-1/2 no-scrollbar bg-white dark:bg-gray-900">
        <div className="flex flex-col justify-center flex-1 w-full max-w-md px-6 mx-auto sm:px-8 lg:px-12">
          <div className="w-full text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-green-100 dark:bg-green-900/20">
              <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="mb-3 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl dark:text-white">
              Password Reset!
            </h1>
            <p className="text-base text-gray-600 dark:text-gray-400 mb-8">
              Your password has been successfully reset. Redirecting to sign in...
            </p>
            <Link to="/signin">
              <Button className="w-full max-w-xs">Go to Sign In</Button>
            </Link>
            <DeveloperFooter />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 w-full overflow-y-auto lg:w-1/2 no-scrollbar bg-white dark:bg-gray-900">
      <div className="flex flex-col justify-center flex-1 w-full max-w-md px-6 mx-auto sm:px-8 lg:px-12">
        <div className="w-full">
          {/* Header Section */}
          <div className="mb-8 sm:mb-10">
            <h1 className="mb-3 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl dark:text-white">
              Reset Password
            </h1>
            <p className="text-base text-gray-600 dark:text-gray-400">
              Enter your new password below.
            </p>
          </div>

          {/* Divider */}
          <div className="relative mb-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200 dark:border-gray-800"></div>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="space-y-5">
              {/* New Password */}
              <div>
                <Label>
                  New Password <span className="text-error-500">*</span>
                </Label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter new password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <span
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                  >
                    {showPassword ? (
                      <EyeIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                    ) : (
                      <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                    )}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">Must be at least 6 characters</p>
              </div>

              {/* Confirm Password */}
              <div>
                <Label>
                  Confirm Password <span className="text-error-500">*</span>
                </Label>
                <div className="relative">
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                  <span
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                  >
                    {showConfirmPassword ? (
                      <EyeIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                    ) : (
                      <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                    )}
                  </span>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="p-4 rounded-lg bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20">
                  <p className="text-sm font-medium text-red-600 dark:text-red-400">
                    {error}
                  </p>
                </div>
              )}

              {/* Submit */}
              <div className="pt-2">
                <Button
                  type="submit"
                  className="w-full transition-all duration-200 hover:scale-[1.02]"
                  size="sm"
                  disabled={loading}
                >
                  {loading ? "Resetting..." : "Reset Password"}
                </Button>
              </div>

              {/* Back to Sign In */}
              <div className="text-center">
                <Link
                  to="/signin"
                  className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                >
                  ← Back to Sign In
                </Link>
              </div>
            </div>
          </form>

          {/* Footer Note */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-500">
              Make sure to use a strong, unique password.
            </p>
          </div>

          <DeveloperFooter />
        </div>
      </div>
    </div>
  );
}
