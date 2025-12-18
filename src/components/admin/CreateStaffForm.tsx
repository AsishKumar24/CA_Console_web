import { useState, ChangeEvent, FormEvent } from "react";
import { Link, useNavigate } from "react-router";
import { EyeIcon, EyeCloseIcon, ChevronLeftIcon } from "../../icons";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";

interface Payload {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
}

export default function CreateStaffForm() {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (user?.role !== "ADMIN") return null;

  const [form, setForm] = useState<Payload>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: ""
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await axios.post("/auth/register", form, {
        withCredentials: true
      });

      navigate("/admin/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to create staff");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto w-full">
      <div className="mb-6">
        <Link
          to="/"
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
        >
          <ChevronLeftIcon className="size-5" />
          Back to dashboard
        </Link>
      </div>

      <div className="rounded-xl bg-white dark:bg-gray-900 p-6 shadow">
        <h1 className="text-lg font-semibold">Create Staff Account</h1>
        <p className="text-sm text-gray-500 mb-6">
          Admin-only user creation
        </p>

        {error && (
          <div className="mb-4 text-sm text-red-600 bg-red-50 px-4 py-2 rounded">
            {error}
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <Input name="firstName" placeholder="First name" onChange={onChange} />
            <Input name="lastName" placeholder="Last name" onChange={onChange} />
          </div>

          <Input name="email" type="email" placeholder="Email" onChange={onChange} />
          <Input name="phone" placeholder="Phone" onChange={onChange} />

          <div className="relative">
            <Input
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Temporary password"
              onChange={onChange}
            />
            <span
              className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeIcon /> : <EyeCloseIcon />}
            </span>
          </div>

          <button
            disabled={loading}
            className="w-full bg-brand-500 text-white py-3 rounded-lg disabled:opacity-60"
          >
            {loading ? "Creating..." : "Create Staff"}
          </button>
        </form>
      </div>
    </div>
  );
}
