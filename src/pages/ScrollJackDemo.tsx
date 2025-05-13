
import React from 'react';
import { ScrollJackContainer } from '@/components/scroll-jack';

const ScrollJackDemo = () => {
  return (
    <ScrollJackContainer titles={["FIRST SECTION", "SECOND SECTION", "THIRD SECTION"]}>
      <section className="min-h-screen bg-blue-900">
        <div className="container mx-auto px-4 py-16">
          <h1 className="text-4xl font-bold text-white mb-6">First Section</h1>
          <p className="text-xl text-white">This is the content for the first section.</p>
        </div>
      </section>
      <section className="min-h-screen bg-green-900">
        <div className="container mx-auto px-4 py-16">
          <h1 className="text-4xl font-bold text-white mb-6">Second Section</h1>
          <p className="text-xl text-white">This is the content for the second section.</p>
        </div>
      </section>
      <section className="min-h-screen bg-purple-900">
        <div className="container mx-auto px-4 py-16">
          <h1 className="text-4xl font-bold text-white mb-6">Third Section</h1>
          <p className="text-xl text-white">This is the content for the third section.</p>
        </div>
      </section>
    </ScrollJackContainer>
  );
};

export default ScrollJackDemo;
