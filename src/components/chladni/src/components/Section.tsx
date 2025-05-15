
import React from 'react';
import { SectionProps } from '../types';

/**
 * A section component for use within ChladniScrollJack
 */
const Section: React.FC<SectionProps> = ({ children, className = "" }) => {
  return (
    <section className={`container mx-auto px-4 min-h-screen flex flex-col items-center justify-center ${className}`}>
      <div className="text-center w-full">
        {children}
      </div>
    </section>
  );
};

export { Section };
