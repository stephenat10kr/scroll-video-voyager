
import React from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface QuestionData {
  title: string;
  content: string;
}

interface QuestionsProps {
  title: string;
}

const TABS = ["THE COMMUNITY", "THE SPACE", "THE MEMBERSHIPS"] as const;

const QUESTIONS: Record<(typeof TABS)[number], QuestionData[]> = {
  "THE COMMUNITY": [
    {
      title: "Title of accordion",
      content: "Content for community question 1",
    },
    {
      title: "Title of accordion",
      content: "Content for community question 2",
    },
    {
      title: "Title of accordion",
      content: "Content for community question 3",
    },
  ],
  "THE SPACE": [
    {
      title: "Title of accordion",
      content: "Content for space question 1",
    },
    {
      title: "Title of accordion",
      content: "Content for space question 2",
    },
    {
      title: "Title of accordion",
      content: "Content for space question 3",
    },
  ],
  "THE MEMBERSHIPS": [
    {
      title: "Title of accordion",
      content: "Content for membership question 1",
    },
    {
      title: "Title of accordion",
      content: "Content for membership question 2",
    },
    {
      title: "Title of accordion",
      content: "Content for membership question 3",
    },
  ],
};

const Questions: React.FC<QuestionsProps> = ({ title }) => {
  return (
    <div className="w-full bg-black py-24">
      <div className="max-w-[90%] mx-auto grid grid-cols-12 gap-4">
        <h2 className="text-white text-2xl mb-12 col-span-12">{title}</h2>
        <Tabs defaultValue="THE COMMUNITY" className="col-span-12">
          <TabsList className="mb-12 bg-transparent w-full flex justify-start gap-4">
            {TABS.map((tab) => (
              <TabsTrigger
                key={tab}
                value={tab}
                className="px-6 py-3 rounded-full data-[state=active]:bg-[#FFE4E4] data-[state=active]:text-black text-white border border-white hover:bg-white/10"
              >
                {tab}
              </TabsTrigger>
            ))}
          </TabsList>
          {TABS.map((tab) => (
            <TabsContent key={tab} value={tab} className="col-start-5 col-span-8">
              <Accordion type="single" collapsible className="w-full">
                {QUESTIONS[tab].map((question, index) => (
                  <AccordionItem
                    key={index}
                    value={`${tab}-${index}`}
                    className="border-t border-white/20 py-4"
                  >
                    <AccordionTrigger className="text-white hover:no-underline text-xl">
                      {question.title}
                    </AccordionTrigger>
                    <AccordionContent className="text-white/80">
                      {question.content}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
};

export default Questions;
