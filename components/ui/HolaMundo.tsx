"use client";

import { useEffect, useState } from "react";

interface HolaMundoProps {
  greeting: string;
  subtitle: string;
}

export default function HolaMundo({ greeting, subtitle }: HolaMundoProps): JSX.Element {
  const [visible, setVisible] = useState<boolean>(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className={`
        relative text-center
        transition-all duration-1000 ease-out
        ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}
      `}
    >
      {/* Glow de fondo */}
      <div
        aria-hidden="true"
        className="absolute inset-0 flex items-center justify-center pointer-events-none -z-10"
      >
        <div className="w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
      </div>

      {/* Texto principal */}
      <h1
        className="
          text-7xl font-bold tracking-tight select-none
          bg-gradient-to-r from-white via-blue-200 to-blue-400
          bg-clip-text text-transparent
          drop-shadow-2xl
        "
      >
        {greeting}
      </h1>

      {/* Línea decorativa animada */}
      <div
        aria-hidden="true"
        className={`
          mx-auto mt-4 h-px
          bg-gradient-to-r from-transparent via-blue-400 to-transparent
          transition-all duration-1000 delay-500
          ${visible ? "w-64" : "w-0"}
        `}
      />

      {/* Subtítulo */}
      <p
        className={`
          mt-6 text-sm font-mono tracking-widest
          text-blue-300/70 uppercase
          transition-all duration-700 delay-700
          ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}
        `}
      >
        {subtitle}
      </p>
    </div>
  );
}
