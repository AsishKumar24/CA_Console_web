import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronLeftIcon, EyeCloseIcon, EyeIcon } from "../../icons";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Checkbox from "../form/input/Checkbox";
import { BASE_URL } from "../../utils/constants";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Button from "../ui/button/Button";

export default function SignUpForm() {
  const navigate = useNavigate();

  // ✅ State
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ✅ Submit handler
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await axios.post(
        BASE_URL + "/auth/register",
        {
          firstName,
          lastName,
          email,
          password,
          phone,
        },
        {
          withCredentials: true, // 🔐 send admin cookie
        }
      );

      navigate("/");
    } catch (err: any) {
      setError(err?.response?.data?.error || "Failed to register staff");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="flex flex-col flex-1 w-full overflow-y-auto lg:w-1/2 no-scrollbar bg-white dark:bg-gray-900">
      <div className="w-full max-w-md px-6 mx-auto mb-5 sm:px-8 lg:px-12 sm:pt-10">
        <Link
          to="/"
          className="inline-flex items-center text-sm font-medium text-gray-600 transition-all duration-200 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 hover:gap-2 gap-1"
        >
          <ChevronLeftIcon className="size-5" />
          Back to dashboard
        </Link>
      </div>

      <div className="flex flex-col justify-center flex-1 w-full max-w-md px-6 mx-auto sm:px-8 lg:px-12">
        <div className="w-full">
          {/* Header Section */}
          <div className="mb-8 sm:mb-10">
            <div className="inline-block px-4 py-1.5 mb-4 text-xs font-medium rounded-full bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400">
              Admin Only
            </div>
            <h1 className="mb-3 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl dark:text-white">
              Register Staff
            </h1>
            <p className="text-base text-gray-600 dark:text-gray-400">
              Create a new staff account with secure credentials
            </p>
          </div>

          {/* Divider */}
          <div className="relative mb-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200 dark:border-gray-800"></div>
            </div>
          </div>

          {/* FORM */}
          <form onSubmit={handleSignup}>
            <div className="space-y-5">
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <Label>
                    First Name<span className="text-error-500">*</span>
                  </Label>
                  <Input
                    type="text"
                    placeholder="Enter your first name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <Label>
                    Last Name<span className="text-error-500">*</span>
                  </Label>
                  <Input
                    type="text"
                    placeholder="Enter your last name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <Label>
                  Email<span className="text-error-500">*</span>
                </Label>
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div>
                <Label>
                  Password<span className="text-error-500">*</span>
                </Label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
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
              </div>

              <div>
                <Label>
                  Phone Number<span className="text-error-500">*</span>
                </Label>
                <Input
                  type="tel"
                  placeholder="Enter 10-digit phone number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  hint="Only numbers, no spaces"
                />
              </div>

              {error && (
                <div className="p-4 rounded-lg bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20">
                  <p className="text-sm font-medium text-red-600 dark:text-red-400">
                    {error}
                  </p>
                </div>
              )}

              <div className="pt-2">
                <Button
                  type="submit"
                  className="w-full transition-all duration-200 hover:scale-[1.02]"
                  size="sm"
                  disabled={loading}
                >
                  {loading ? "Registering..." : "Create Staff Account"}
                </Button>
              </div>
            </div>
          </form>

          {/* Footer Note */}
          <div className="mt-8 mb-6 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-500">
              Only administrators can create staff accounts. Ensure all details are accurate.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
