import React from "react";
import Ritual from "./Ritual";
import RitualReversed from "./RitualReversed";
import { useRituals } from "@/hooks/useRituals";
interface RitualsProps {
  title: string;
}
const Rituals: React.FC<RitualsProps> = ({
  title
}) => {
  // Use our custom hook to fetch rituals from Contentful
  const {
    data: rituals,
    isLoading,
    error
  } = useRituals();

  // Fallback image if Contentful image is missing
  const fallbackImage = "https://images.unsplash.com/photo-1605810230434-7631ac76ec81?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80";

  // Show loading state
  if (isLoading) {
    return <div className="w-full bg-black py-24">
        <div className="max-w-[90%] mx-auto">
          <h2 className="text-white text-2xl mb-12">{title}</h2>
          <div className="space-y-24">
            {[1, 2, 3].map(i => <div key={i} className="grid grid-cols-12 gap-8 mb-16">
                <div className="col-span-12 md:col-span-5 md:col-start-1 h-64 bg-gray-800 animate-pulse" />
                <div className="col-span-12 md:col-span-5 md:col-start-8">
                  <div className="h-12 bg-gray-800 animate-pulse mb-4" />
                  <div className="h-24 bg-gray-800 animate-pulse" />
                </div>
              </div>)}
          </div>
        </div>
      </div>;
  }

  // Show error state
  if (error || !rituals) {
    console.error('Error loading rituals:', error);
    return <div className="w-full bg-black py-24">
        <div className="max-w-[90%] mx-auto">
          <h2 className="text-white text-2xl mb-12">{title}</h2>
          <p className="text-red-500">Unable to load rituals. Please try again later.</p>
        </div>
      </div>;
  }

  // Use fallback data if no rituals are available
  const displayRituals = rituals.length > 0 ? rituals : [{
    id: "1",
    title: "Salons",
    description: ["Immersive events for exploration and discovery. Learn, unlearn, and imagine alongside artists, thinkers, and innovators shaping what's next."],
    imageSrc: fallbackImage,
    imageAlt: "Group of people at a salon event"
  }, {
    id: "2",
    title: "Art & Culture",
    description: ["Gather, ground, and grow. Our rituals offer moments of wellness, intention-setting, and shared presence, designed to connect you more deeply to yourself, to community, and to the city around you."],
    imageSrc: fallbackImage,
    imageAlt: "People enjoying an art performance"
  }, {
    id: "3",
    title: "Fêtes",
    description: ["Celebration is a way of life. From live music to spontaneous gatherings, our fêtes weave connection, creativity, and conviviality into every corner of the clubhouse, at any hour, whenever the Art & Culture moment calls."],
    imageSrc: fallbackImage,
    imageAlt: "Colorful celebration event"
  }];
  return <div className="w-full py-24 bg-[#203435]">
      <div className="mx-auto">
        <h2 className="text-white title-sm mb-12">{title}</h2>
        <div className="space-y-24">
          {displayRituals.map((ritual, index) => {
          // Use the appropriate component based on the ritual's index
          if (index % 2 === 1) {
            return <RitualReversed key={ritual.id} title={ritual.title} description={ritual.description} imageSrc={ritual.imageSrc} imageAlt={ritual.imageAlt} />;
          } else {
            return <Ritual key={ritual.id} title={ritual.title} description={ritual.description} imageSrc={ritual.imageSrc} imageAlt={ritual.imageAlt} />;
          }
        })}
        </div>
      </div>
    </div>;
};
export default Rituals;