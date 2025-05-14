
import React, { useEffect, useState } from "react";

type PreloaderProps = {
  progress: number;
  onComplete: () => void;
};

const Preloader = ({ progress, onComplete }: PreloaderProps) => {
  const [isAnimating, setIsAnimating] = useState(true);

  useEffect(() => {
    if (progress >= 100 && isAnimating) {
      const timer = setTimeout(() => {
        setIsAnimating(false);
        setTimeout(() => {
          onComplete();
        }, 500);
      }, 200);
      
      return () => clearTimeout(timer);
    }
  }, [progress, isAnimating, onComplete]);

  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-center z-50 transition-opacity duration-500 bg-black"
      style={{ opacity: isAnimating ? 1 : 0 }}
    >
      <div className="w-64 h-1 bg-white bg-opacity-30 relative rounded-full overflow-hidden">
        <div
          className="absolute top-0 left-0 h-full bg-white transition-all duration-300 ease-out rounded-full"
          style={{ width: `${Math.min(progress, 100)}%` }}
        />
      </div>
      <div className="mt-4 text-sm font-medium text-white">
        {`Loading ${Math.min(Math.round(progress), 100)}%`}
      </div>
    </div>
  );
};

export default Preloader;
