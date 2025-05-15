
import React from 'react';
import { ChladniScrollJack, Section } from '../index';

/**
 * Example usage of the ChladniScrollJack component
 */
const ChladniScrollJackExample: React.FC = () => {
  return (
    <ChladniScrollJack 
      titles={["Welcome", "Features", "Get Started"]}
    >
      {/* Section 1 */}
      <Section>
        <h2 className="text-5xl md:text-7xl font-bold mb-8 text-white">Welcome</h2>
        <div className="bg-black/30 backdrop-blur-sm p-6 rounded-lg max-w-2xl mx-auto">
          <ul className="text-xl md:text-2xl text-white space-y-4">
            <li>• Discover innovative scroll animations</li>
            <li>• Experience seamless section transitions</li>
            <li>• Explore interactive visual elements</li>
          </ul>
        </div>
      </Section>

      {/* Section 2 */}
      <Section>
        <h2 className="text-5xl md:text-7xl font-bold mb-8 text-white">Features</h2>
        <div className="bg-black/30 backdrop-blur-sm p-6 rounded-lg max-w-2xl mx-auto">
          <ul className="text-xl md:text-2xl text-white space-y-4">
            <li>• Titles remain fixed while content scrolls</li>
            <li>• Animated transitions between sections</li>
            <li>• Customizable scroll behavior</li>
          </ul>
        </div>
      </Section>

      {/* Section 3 */}
      <Section>
        <h2 className="text-5xl md:text-7xl font-bold mb-8 text-white">Get Started</h2>
        <div className="bg-black/30 backdrop-blur-sm p-6 rounded-lg max-w-2xl mx-auto">
          <ul className="text-xl md:text-2xl text-white space-y-4">
            <li>• Interactive navigation dots</li>
            <li>• Responsive design for all devices</li>
            <li>• Smooth animation performance</li>
          </ul>
        </div>
      </Section>
    </ChladniScrollJack>
  );
};

export default ChladniScrollJackExample;
