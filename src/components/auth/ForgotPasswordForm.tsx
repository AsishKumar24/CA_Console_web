import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Button from "../ui/button/Button";
import { BASE_URL } from "../../utils/constants";
import DeveloperFooter from "./DeveloperFooter";

export default function ForgotPasswordForm() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await axios.post(
        `${BASE_URL}/auth/forgot-password`,
        { email },
        { withCredentials: true }
      );
      
      setSuccess(true);
    } catch (err: any) {
      setError(
        err?.response?.data?.error || "Failed to send reset link. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex flex-col flex-1 w-full overflow-y-auto lg:w-1/2 no-scrollbar bg-white dark:bg-gray-900">
        <div className="flex flex-col justify-center flex-1 w-full max-w-md px-6 mx-auto sm:px-8 lg:px-12">
          <div className="w-full">
            {/* Success Message */}
            <div className="mb-8 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-green-100 dark:bg-green-900/20">
                <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="mb-3 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl dark:text-white">
                Check Your Email
              </h1>
              <p className="text-base text-gray-600 dark:text-gray-400 mb-6">
                We've sent a password reset link to <span className="font-semibold text-gray-900 dark:text-white">{email}</span>
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500 mb-8">
                The link will expire in 1 hour. If you don't see the email, check your spam folder.
              </p>
              <div className="space-y-3">
                <Button
                  onClick={() => navigate("/signin")}
                  className="w-full"
                  variant="outline"
                >
                  ← Back to Sign In
                </Button>
                <button
                  onClick={() => {
                    setSuccess(false);
                    setEmail("");
                  }}
                  className="w-full text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                >
                  Didn't receive email? Send again
                </button>
              </div>
            </div>
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
              Forgot Password?
            </h1>
            <p className="text-base text-gray-600 dark:text-gray-400">
              No worries! Enter your email and we'll send you reset instructions.
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
              {/* Email */}
              <div>
                <Label>
                  Email <span className="text-error-500">*</span>
                </Label>
                <Input
                  type="email"
                  placeholder="info@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
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
                  {loading ? "Sending..." : "Send Reset Link"}
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
              Contact your administrator if you continue having trouble.
            </p>
          </div>

          <DeveloperFooter />
        </div>
      </div>
    </div>
  );
}
