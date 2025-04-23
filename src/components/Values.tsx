
import React from "react";
import Value from "./Value";

interface ValuesProps {
  title: string;
}

const Values: React.FC<ValuesProps> = ({ title }) => {
  return (
    <div className="w-full bg-black py-24">
      <div className="grid grid-cols-12 max-w-[90%] mx-auto">
        <div className="col-span-3">
          <h2 className="text-white text-2xl">{title}</h2>
        </div>
        <div className="col-span-9">
          <Value 
            valueTitle="Cultivate uplift."
            valueText={[
              "Shine so that others may shine.",
              "Speak with generosity.",
              "Act with compassion and care."
            ]}
          />
          <Value 
            valueTitle="Lead with curiosity."
            valueText={[
              "Share what lights you up inside.",
              "Celebrate this spark in others.",
              "Make space for voices beyond your own."
            ]}
          />
          <Value 
            valueTitle="Hold complexity."
            valueText={[
              "Honor difference.",
              "Stay grounded, open-hearted, and clear-minded. Assume less.",
              "Listen more."
            ]}
          />
        </div>
      </div>
    </div>
  );
};

export default Values;
