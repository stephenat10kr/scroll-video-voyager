
import React from 'react';

interface ImageErrorProps {
  message: string;
  onRefresh: () => void;
}

export const ImageError: React.FC<ImageErrorProps> = ({ message, onRefresh }) => {
  return (
    <div className="w-full h-full flex items-center justify-center text-white text-center p-4">
      <div className="bg-black/80 p-6 rounded-lg max-w-md">
        <h3 className="text-xl font-bold mb-4">Image Loading Error</h3>
        <p className="mb-4">{message}</p>
        <button 
          className="px-4 py-2 bg-white text-black rounded-md font-medium flex items-center justify-center mx-auto"
          onClick={onRefresh}
        >
          <span className="mr-2">Refresh</span>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M21.168 8A10.003 10.003 0 0 0 12 2C6.477 2 2 6.477 2 12s4.477 10 10 10c4.4 0 8.14-2.833 9.5-6.78" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M16 8h5.4V2.6" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
    </div>
  );
};
