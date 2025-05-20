
import React, { ReactNode } from "react";
import Spinner from "../Spinner";

interface ImprovedVideoContainerProps {
  children: ReactNode;
  isLoading: boolean;
  isVideoLoaded: boolean;
  isIOS: boolean;
}

const ImprovedVideoContainer: React.FC<ImprovedVideoContainerProps> = ({
  children,
  isLoading,
  isVideoLoaded,
  isIOS
}) => {
  return (
    <div className="video-container fixed top-0 left-0 w-full h-screen z-0">
      {/* Show loading state if video is still loading */}
      {(isLoading || !isVideoLoaded) && !isIOS && (
        <div className="absolute inset-0 flex items-center justify-center bg-black z-10">
          <Spinner />
        </div>
      )}
      {children}
    </div>
  );
};

export default ImprovedVideoContainer;
