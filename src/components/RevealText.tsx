
import React, { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { TextPlugin } from "gsap/TextPlugin";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { contentfulClient } from "@/lib/contentfulClient";
import type { ContentfulRevealText } from "@/types/contentful";
import Form from "@/components/Form";

gsap.registerPlugin(ScrollTrigger, TextPlugin);

// HubSpot Portal ID and Form ID matching those in Navigation.tsx
const HUBSPOT_PORTAL_ID = "242761887";
const HUBSPOT_FORM_ID = "ed4555d7-c442-473e-8ae1-304ca35edbf0";

const RevealText = () => {
  const textRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const {
    data: revealTextContent,
    isLoading,
    error
  } = useQuery({
    queryKey: ['revealText'],
    queryFn: async () => {
      console.log("Fetching reveal text from Contentful");
      try {
        // Log available content types to see what we have in the space
        const contentTypes = await contentfulClient.getContentTypes();
        console.log("Available content types:", contentTypes.items.map(ct => ({
          id: ct.sys.id,
          name: ct.name
        })));
        const response = await contentfulClient.getEntries({
          content_type: 'revealText',
          limit: 1
        });
        console.log("Contentful response status:", response.sys);
        console.log("Total items found:", response.total);
        console.log("Response items:", response.items.length);
        if (response.items.length === 0) {
          console.log("No entries found for content type 'revealText'");
          return null;
        }
        const entry = response.items[0];
        console.log("First entry sys:", entry.sys);
        console.log("First entry fields:", entry.fields);

        // Check if the entry has the 'revealText' field (which it does according to logs)
        if (entry && entry.fields && 'revealText' in entry.fields) {
          const textContent = entry.fields.revealText as string;
          console.log("Found valid text content:", textContent);
          return {
            sys: entry.sys,
            fields: {
              text: textContent // Map to the expected 'text' field in our type
            }
          } as ContentfulRevealText;
        }
        console.log("Entry found but missing expected field, fields available:", Object.keys(entry.fields));
        return null;
      } catch (err) {
        console.error("Error fetching from Contentful:", err);
        throw err;
      }
    }
  });

  // Intersection Observer to detect when the RevealText is visible
  useEffect(() => {
    const observerOptions = {
      root: null, // viewport
      rootMargin: "0px",
      threshold: 0.1 // trigger when 10% of section is visible
    };
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        setIsVisible(entry.isIntersecting);
      });
    }, observerOptions);
    
    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }
    
    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  useEffect(() => {
    console.log("Current revealTextContent:", revealTextContent);
    const text = textRef.current;
    if (!text) return;

    // Get the text content
    const originalText = text.textContent || "";

    // Split text into words
    const words = originalText.split(" ");

    // Create HTML structure with words and characters wrapped in spans
    const formattedHTML = words.map(word => {
      const charSpans = word.split("").map(char => `<span class="char">${char}</span>`).join("");
      return `<div class="word" style="display: inline-block; margin-right: 0.25em;">${charSpans}</div>`;
    }).join("");
    text.innerHTML = formattedHTML;
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: text,
        start: "top bottom-=100",
        end: "bottom center",
        scrub: 0.5,
        markers: false
      }
    });
    const spans = text.querySelectorAll(".char");
    console.log(`Found ${spans.length} spans to animate`);
    spans.forEach((span, i) => {
      tl.to(span, {
        color: "transparent",
        ease: "power1.inOut",
        duration: 0.1
      }, i * 0.01);
    });
    return () => {
      tl.kill();
    };
  }, [revealTextContent]);

  if (isLoading) {
    return <div className="w-full bg-darkGreen py-24">
        <div className="grid grid-cols-12 max-w-[90%] mx-auto">
          <div className="col-span-12 md:col-span-9 h-32 animate-pulse bg-gray-800 rounded" />
        </div>
      </div>;
  }

  if (error) {
    console.error("Error loading reveal text:", error);
  }

  return (
    <>
      {/* Fixed blue background with pattern - appears when RevealText is in view */}
      {isVisible && (
        <>
          {/* Main blue background with pattern */}
          <div 
            className="fixed top-0 left-0 w-full h-full opacity-90"
            style={{
              backgroundImage: `
                linear-gradient(135deg, rgba(14, 165, 233, 0.8) 0%, rgba(14, 165, 233, 0.75) 100%),
                url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23ffffff' fill-opacity='0.4' fill-rule='evenodd'/%3E%3C/svg%3E")
              `,
              backgroundSize: '150px 150px',
              zIndex: '-1', 
            }}
          ></div>
          
          {/* Noise texture overlay */}
          <div 
            className="fixed top-0 left-0 w-full h-full opacity-20"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
              backgroundSize: '200px 200px',
              mixBlendMode: 'overlay',
              zIndex: '-2',
            }}
          ></div>
        </>
      )}

      <div ref={sectionRef} className="w-full py-24 bg-darkGreen">
        <div className="grid grid-cols-12 max-w-[90%] mx-auto">
          <div ref={textRef} className="title-md text-roseWhite col-span-12 md:col-span-9 mb-8" style={{
            background: "linear-gradient(90deg, #FFB577 0%, #FFB577 100%)",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            lineHeight: "1.2",
            whiteSpace: "pre-wrap",
            wordBreak: "normal"
          }}>
            {revealTextContent?.fields.text || "Default reveal text"}
          </div>
          <div className="col-span-12 md:col-span-9">
            <Button 
              variant="default" 
              className="h-[48px] rounded-full bg-coral text-black hover:bg-coral/90"
              onClick={() => setIsFormOpen(true)}
            >
              STAY IN THE LOOP
            </Button>
          </div>
        </div>
      </div>
      
      <Form 
        open={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title="Curious?<br>Sign up to hear about upcoming events and membership offerings."
        hubspotPortalId={HUBSPOT_PORTAL_ID}
        hubspotFormId={HUBSPOT_FORM_ID}
      />
    </>
  );
};

export default RevealText;
