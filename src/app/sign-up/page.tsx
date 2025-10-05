"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Eye, EyeOff, Music } from "lucide-react";
import Link from "next/link";

export default function SignUpPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (formData.password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await authClient.signUp.email({
        email: formData.email,
        name: formData.name,
        password: formData.password,
      });

      if (error?.code) {
        const errorMap: Record<string, string> = {
          USER_ALREADY_EXISTS: "Email already registered",
        };
        toast.error(errorMap[error.code] || "Registration failed");
        setIsLoading(false);
        return;
      }

      toast.success("Welcome to Redtune! Please sign in.");
      router.push("/sign-in?registered=true");
    } catch (error) {
      toast.error("An error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-6 md:mb-8">
          <div className="w-12 h-12 md:w-16 md:h-16 bg-primary rounded-full flex items-center justify-center mb-3 md:mb-4">
            <Music className="w-6 h-6 md:w-8 md:h-8 text-white" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-1 md:mb-2">Join Redtune</h1>
          <p className="text-gray-400 text-sm md:text-base">Create your account to start streaming</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
              Name
            </label>
            <input
              id="name"
              type="text"
              required
              className="w-full px-4 py-2.5 md:py-3 bg-secondary border border-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary text-sm md:text-base"
              placeholder="Your name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              className="w-full px-4 py-2.5 md:py-3 bg-secondary border border-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary text-sm md:text-base"
              placeholder="you@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                required
                autoComplete="off"
                className="w-full px-4 py-2.5 md:py-3 bg-secondary border border-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary text-sm md:text-base"
                placeholder="At least 8 characters"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
              >
                {showPassword ? <EyeOff className="w-4 h-4 md:w-5 md:h-5" /> : <Eye className="w-4 h-4 md:w-5 md:h-5" />}
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
              Confirm Password
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                required
                autoComplete="off"
                className="w-full px-4 py-2.5 md:py-3 bg-secondary border border-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary text-sm md:text-base"
                placeholder="Re-enter your password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4 md:w-5 md:h-5" /> : <Eye className="w-4 h-4 md:w-5 md:h-5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-2.5 md:py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base"
          >
            {isLoading ? "Creating account..." : "Sign Up"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-400 text-sm md:text-base">
            Already have an account?{" "}
            <Link href="/sign-in" className="text-primary hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}