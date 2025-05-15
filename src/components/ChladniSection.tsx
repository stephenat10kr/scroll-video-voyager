
import React from 'react';
import { ChladniScrollJack, Section } from './chladni';

const ChladniSection: React.FC = () => {
  return (
    <div className="relative" style={{ zIndex: 1 }}>
      <ChladniScrollJack
        titles={[
          "WELCOME TO LIGHTNING SOCIETY", 
          "A HOME FOR CREATIVITY", 
          "JOIN OUR COMMUNITY"
        ]}
      >
        {/* Section 1 */}
        <Section>
          <div className="max-w-4xl mx-auto px-4">
            <h2 className="text-5xl md:text-6xl font-bold mb-8 text-coral">WELCOME TO LIGHTNING SOCIETY</h2>
            <div className="bg-black/30 backdrop-blur-sm p-6 rounded-lg max-w-2xl mx-auto">
              <p className="text-xl md:text-2xl text-roseWhite mb-4">
                A vibrant collective of creators, innovators, and visionaries.
              </p>
              <p className="text-xl md:text-2xl text-roseWhite">
                We are building a community where ideas flow freely and creativity knows no bounds.
              </p>
            </div>
          </div>
        </Section>

        {/* Section 2 */}
        <Section>
          <div className="max-w-4xl mx-auto px-4">
            <h2 className="text-5xl md:text-6xl font-bold mb-8 text-coral">A HOME FOR CREATIVITY</h2>
            <div className="bg-black/30 backdrop-blur-sm p-6 rounded-lg max-w-2xl mx-auto">
              <p className="text-xl md:text-2xl text-roseWhite mb-4">
                Our space is designed to inspire and foster connections between diverse minds.
              </p>
              <p className="text-xl md:text-2xl text-roseWhite">
                Here, every conversation sparks potential, and every gathering ignites new possibilities.
              </p>
            </div>
          </div>
        </Section>

        {/* Section 3 */}
        <Section>
          <div className="max-w-4xl mx-auto px-4">
            <h2 className="text-5xl md:text-6xl font-bold mb-8 text-coral">JOIN OUR COMMUNITY</h2>
            <div className="bg-black/30 backdrop-blur-sm p-6 rounded-lg max-w-2xl mx-auto">
              <p className="text-xl md:text-2xl text-roseWhite mb-4">
                Become part of our growing network of forward-thinkers and change-makers.
              </p>
              <p className="text-xl md:text-2xl text-roseWhite">
                Lightning Society offers more than just a space—it provides a platform for your ideas to flourish.
              </p>
            </div>
          </div>
        </Section>
      </ChladniScrollJack>
    </div>
  );
};

export default ChladniSection;
