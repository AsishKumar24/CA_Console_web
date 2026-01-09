import { ShaderAnimation } from "./shader-animation/shader-animation";

export function LoadingScreen() {
  return (
    <div className="relative flex h-screen w-full items-center justify-center overflow-hidden">
      {/* Shader Animation Background */}
      <ShaderAnimation />
      
      {/* Loading Text Overlay */}
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center pointer-events-none">
        <span className="text-center text-6xl md:text-7xl lg:text-8xl leading-none font-semibold tracking-tighter text-gray-900 drop-shadow-sm">
          CA Console
        </span>
        <div className="mt-8 flex items-center space-x-2">
          <div className="h-3 w-3 bg-brand-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="h-3 w-3 bg-brand-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="h-3 w-3 bg-brand-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
        <p className="mt-4 text-gray-600 text-lg font-medium">Loading your workspace...</p>
      </div>
    </div>
  );
}
