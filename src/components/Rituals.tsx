
import React from "react";
import Ritual from "./Ritual";

interface RitualsProps {
  title: string;
}

const Rituals: React.FC<RitualsProps> = ({ title }) => {
  // Sample data for rituals
  const rituals = [
    {
      id: 1,
      title: "Salons",
      description: [
        "Immersive events for exploration and discovery. Learn, unlearn, and imagine alongside artists, thinkers, and innovators shaping what's next."
      ],
      imageSrc: "https://images.unsplash.com/photo-1605810230434-7631ac76ec81?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
      imageAlt: "Group of people at a salon event"
    },
    {
      id: 2,
      title: "Art & Culture",
      description: [
        "Gather, ground, and grow. Our rituals offer moments of wellness, intention-setting, and shared presence, designed to connect you more deeply to yourself, to community, and to the city around you."
      ],
      imageSrc: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
      imageAlt: "People enjoying an art performance"
    },
    {
      id: 3,
      title: "Fêtes",
      description: [
        "Celebration is a way of life. From live music to spontaneous gatherings, our fêtes weave connection, creativity, and conviviality into every corner of the clubhouse, at any hour, whenever the Art & Culture moment calls."
      ],
      imageSrc: "https://images.unsplash.com/photo-1500673922987-e212871fec22?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
      imageAlt: "Colorful celebration event"
    }
  ];

  return (
    <div className="w-full bg-black py-24">
      <div className="grid grid-cols-12 max-w-[90%] mx-auto">
        <div className="col-span-12 md:col-span-3">
          <h2 className="text-white text-2xl mb-8 md:mb-0">{title}</h2>
        </div>
        <div className="col-span-12 md:col-span-9">
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
