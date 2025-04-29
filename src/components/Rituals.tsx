
import React from "react";
import Ritual from "./Ritual";

interface RitualsProps {
  title: string;
}

const Rituals: React.FC<RitualsProps> = ({ title }) => {
  // Use the same image for all rituals
  const commonImage = "https://images.unsplash.com/photo-1605810230434-7631ac76ec81?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80";

  // Sample data for rituals
  const rituals = [
    {
      id: 1,
      title: "Salons",
      description: [
        "Immersive events for exploration and discovery. Learn, unlearn, and imagine alongside artists, thinkers, and innovators shaping what's next."
      ],
      imageSrc: commonImage,
      imageAlt: "Group of people at a salon event"
    },
    {
      id: 2,
      title: "Art & Culture",
      description: [
        "Gather, ground, and grow. Our rituals offer moments of wellness, intention-setting, and shared presence, designed to connect you more deeply to yourself, to community, and to the city around you."
      ],
      imageSrc: commonImage,
      imageAlt: "People enjoying an art performance"
    },
    {
      id: 3,
      title: "Fêtes",
      description: [
        "Celebration is a way of life. From live music to spontaneous gatherings, our fêtes weave connection, creativity, and conviviality into every corner of the clubhouse, at any hour, whenever the Art & Culture moment calls."
      ],
      imageSrc: commonImage,
      imageAlt: "Colorful celebration event"
    }
  ];

  return (
    <div className="w-full bg-black py-24">
      <div className="max-w-[90%] mx-auto">
        <h2 className="text-white text-2xl mb-12">{title}</h2>
        <div className="space-y-24">
          {rituals.map((ritual, index) => (
            <Ritual
              key={ritual.id}
              title={ritual.title}
              description={ritual.description}
              imageSrc={ritual.imageSrc}
              imageAlt={ritual.imageAlt}
              isReversed={index % 2 !== 0}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Rituals;
