
import React, { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { TextPlugin } from "gsap/TextPlugin";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { contentfulClient } from "@/lib/contentfulClient";
import type { ContentfulRevealText } from "@/types/contentful";
import Form from "@/components/Form";
import { colors } from "@/lib/theme";
gsap.registerPlugin(ScrollTrigger, TextPlugin);

// HubSpot Portal ID and Form ID matching those in Navigation.tsx
const HUBSPOT_PORTAL_ID = "242761887";
const HUBSPOT_FORM_ID = "ed4555d7-c442-473e-8ae1-304ca35edbf0";
const RevealText = () => {
  const textRef = useRef<HTMLDivElement>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  
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
  
  useEffect(() => {
    console.log("Current revealTextContent:", revealTextContent);
    const text = textRef.current;
    if (!text) return;

    // Get the text content
    const originalText = text.textContent || "";
    
    // Create a container for better iOS handling
    text.innerHTML = ""; // Clear the text
    
    // Create a div specifically for iOS text masking
    const textContainer = document.createElement("div");
    textContainer.className = "text-mask-container";
    textContainer.style.position = "relative";
    textContainer.style.display = "inline";
    
    // Split text into words
    const words = originalText.split(" ");

    // Create HTML structure with words and characters wrapped in spans
    words.forEach((word, wordIndex) => {
      const wordEl = document.createElement("div");
      wordEl.className = "word";
      wordEl.style.display = "inline-block";
      wordEl.style.marginRight = "0.25em";
      
      // Create character spans for each word
      word.split("").forEach(char => {
        const charSpan = document.createElement("span");
        charSpan.className = "char";
        charSpan.style.display = "inline-block";
        charSpan.style.paddingBottom = "0.2em";
        charSpan.textContent = char;
        wordEl.appendChild(charSpan);
      });
      
      textContainer.appendChild(wordEl);
      
      // Add a space after each word (except the last one)
      if (wordIndex < words.length - 1) {
        const space = document.createElement("span");
        space.innerHTML = "&nbsp;";
        textContainer.appendChild(space);
      }
    });
    
    text.appendChild(textContainer);
    
    // Get all character spans for animation
    const spans = text.querySelectorAll(".char");
    console.log(`Found ${spans.length} spans to animate`);
    
    // Setup the scroll trigger animation
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: text,
        start: "top bottom-=66.7vh",
        end: "bottom center",
        scrub: 0.5,
        markers: false
      }
    });
    
    // iOS detection
    const isIOS = /(iPad|iPhone|iPod)/g.test(navigator.userAgent);
    
    if (isIOS) {
      console.log("iOS device detected, applying special mask handling");
      
      // For iOS, we need a different approach
      spans.forEach(span => {
        // Set initial styles - white text underneath with coral overlay
        gsap.set(span, {
          color: colors.coral, // Start with coral color
          opacity: 1,
          position: "relative"
        });
      });
      
      // Animate iOS differently - fade from coral to white
      spans.forEach((span, i) => {
        tl.to(span, {
          color: "white",
          ease: "power1.inOut",
          duration: 0.1
        }, i * 0.01);
      });
    } else {
      // For non-iOS devices, use the text mask effect
      spans.forEach(span => {
        gsap.set(span, {
          color: "white", // Set the base color to white
          backgroundImage: `linear-gradient(90deg, ${colors.coral} 0%, ${colors.coral} 100%)`, // Coral overlay
          WebkitBackgroundClip: "text",
          backgroundClip: "text",
          textFillColor: "transparent", // For standard browsers
          WebkitTextFillColor: "transparent" // For webkit browsers
        });
      });
      
      // Animate each character to clear the mask and reveal the white text
      spans.forEach((span, i) => {
        tl.to(span, {
          backgroundImage: "none", // Remove gradient background
          WebkitBackgroundClip: "unset", // Unset background clipping
          backgroundClip: "unset", // Unset background clipping
          color: "white", // Make sure the text remains white
          WebkitTextFillColor: "white", // Ensure text is visible
          ease: "power1.inOut",
          duration: 0.1
        }, i * 0.01);
      });
    }
    
    return () => {
      if (tl.scrollTrigger) {
        tl.scrollTrigger.kill();
      }
      tl.kill();
    };
  }, [revealTextContent]);
  
  if (isLoading) {
    return <div className="w-full py-24" style={{
      backgroundColor: colors.darkGreen
    }}>
        <div className="grid grid-cols-12 max-w-[90%] mx-auto">
          <div className="col-span-12 md:col-span-9 h-32 animate-pulse bg-gray-800/50 rounded" />
        </div>
      </div>;
  }
  
  if (error) {
    console.error("Error loading reveal text:", error);
  }
  
  return <>
      <div className="w-full py-24" style={{
      backgroundColor: colors.darkGreen
    }}>
        <div className="grid grid-cols-12 max-w-[90%] mx-auto">
          <div 
            ref={textRef} 
            className="title-md col-span-12 md:col-span-9 mb-8 py-[12px]" 
            style={{
              color: "white", // Set base color to white
              lineHeight: "1.2",
              whiteSpace: "pre-wrap",
              wordBreak: "normal",
              WebkitFontSmoothing: "antialiased",
              textRendering: "optimizeLegibility"
            }}
          >
            {revealTextContent?.fields.text || "Default reveal text"}
          </div>
          <div className="col-span-12 md:col-span-9">
            <Button variant="default" className="h-[48px] rounded-full bg-coral text-black hover:bg-coral/90" onClick={() => setIsFormOpen(true)}>
              STAY IN THE LOOP
            </Button>
          </div>
        </div>
      </div>
      
      <Form open={isFormOpen} onClose={() => setIsFormOpen(false)} title="Curious?<br>Sign up to hear about upcoming events and membership offerings." hubspotPortalId={HUBSPOT_PORTAL_ID} hubspotFormId={HUBSPOT_FORM_ID} />
    </>;
};
export default RevealText;
