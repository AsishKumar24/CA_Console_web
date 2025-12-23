import React from "react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative w-full h-screen overflow-hidden bg-white dark:bg-gray-900">
      <div className="relative flex flex-col w-full h-full lg:flex-row">
        {/* Left Side - Form */}
        {children}

        {/* Right Side - Branding Panel */}
        <div className="hidden lg:flex lg:w-1/2 h-full bg-slate-950 dark:bg-slate-950 relative overflow-hidden">
          {/* Animated gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950"></div>
          
          {/* Blue brand glow */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(59,130,246,0.25),transparent_60%)]"></div>
          
          {/* Secondary glow */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_70%,rgba(96,165,250,0.15),transparent_50%)]"></div>

          {/* Subtle border on the left edge */}
          <div className="absolute top-0 left-0 w-px h-full bg-gradient-to-b from-transparent via-blue-500/20 to-transparent"></div>

          {/* Content - Perfectly Centered */}
          <div className="absolute inset-0 flex items-center justify-center p-12">
            <div className="relative z-10 flex flex-col items-center text-center max-w-lg">
              {/* Logo with subtle animation */}
              <div className="mb-10 transform transition-transform duration-300 hover:scale-105">
                <img
                  src="/ca-india-seeklogo.png"
                  alt="CA Console Logo"
                  className="h-44 w-auto drop-shadow-2xl"
                />
              </div>

              {/* Title */}
              <h2 className="text-5xl font-bold text-white tracking-tight mb-4">
                CA Console
              </h2>

              {/* Subtitle */}
              <p className="text-white/70 text-lg leading-relaxed max-w-md">
                Professional dashboard for Chartered Accountants
              </p>

              {/* Decorative line */}
              <div className="mt-8 w-24 h-1 bg-gradient-to-r from-transparent via-blue-500/50 to-transparent rounded-full"></div>

              {/* Features */}
              <div className="mt-12 space-y-4 text-left">
                <div className="flex items-center gap-3 text-white/60">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <span className="text-sm">Secure authentication</span>
                </div>
                <div className="flex items-center gap-3 text-white/60">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <span className="text-sm">Role-based access control</span>
                </div>
                <div className="flex items-center gap-3 text-white/60">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <span className="text-sm">Comprehensive task management</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
