import React from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useQuestions } from "@/hooks/useQuestions";
import { useIsMobile } from "@/hooks/use-mobile";
export interface QuestionData {
  title: string;
  content: string;
}
interface QuestionsProps {
  title: string;
}
const TABS = ["THE COMMUNITY", "THE SPACE", "THE MEMBERSHIPS"] as const;
const Questions: React.FC<QuestionsProps> = ({
  title
}) => {
  const {
    data: questions,
    isLoading,
    error
  } = useQuestions();
  const isMobile = useIsMobile();
  if (isLoading) {
    return <div className="w-full bg-black py-24">
      <div className="max-w-[90%] mx-auto">
        <h2 className="text-white text-2xl mb-12">Loading questions...</h2>
      </div>
    </div>;
  }
  if (error) {
    console.error('Error in Questions component:', error);
    return <div className="w-full bg-black py-24">
      <div className="max-w-[90%] mx-auto">
        <h2 className="text-white text-2xl mb-12">Failed to load questions</h2>
        <p className="text-white/70 text-sm">Please check the console for more details.</p>
      </div>
    </div>;
  }
  if (!questions || Object.keys(questions).length === 0) {
    return <div className="w-full bg-black py-24">
      <div className="max-w-[90%] mx-auto">
        <h2 className="text-white text-2xl mb-12">No questions available</h2>
        <p className="text-white/70 text-sm">Please add questions in Contentful with the content type 'question'.</p>
      </div>
    </div>;
  }

  // Use different column classes based on device size
  const tabsClassName = isMobile ? "col-start-1 col-end-13" : "col-start-5 col-end-13";
  return <div className="w-full py-24 bg-[#203435]">
      <div className="max-w-[90%] mx-auto grid grid-cols-12 gap-4">
        <h2 className="text-white text-2xl mb-12 col-span-12">{title}</h2>
        <Tabs defaultValue="THE COMMUNITY" className={tabsClassName}>
          <TabsList className="mb-12 bg-transparent w-full flex flex-wrap justify-start gap-4">
            {TABS.map(tab => <TabsTrigger key={tab} value={tab} className="px-6 py-3 rounded-full data-[state=active]:bg-[#FFB577] data-[state=active]:text-black text-[#FFB577] border border-[#FFB577] hover:bg-white/10">
                {tab}
              </TabsTrigger>)}
          </TabsList>
          {TABS.map(tab => <TabsContent key={tab} value={tab} className="col-start-5 col-span-8">
              <Accordion type="single" collapsible className="w-full">
                {questions[tab]?.map((question, index) => <AccordionItem key={index} value={`${tab}-${index}`} className="border-t border-white/20 py-4">
                    <AccordionTrigger className="text-white hover:no-underline text-xl text-left">
                      {question.title}
                    </AccordionTrigger>
                    <AccordionContent className="text-white/80 text-sm text-left">
                      {question.content}
                    </AccordionContent>
                  </AccordionItem>) || <p className="text-white/70 text-sm">No questions available for this category.</p>}
              </Accordion>
            </TabsContent>)}
        </Tabs>
      </div>
    </div>;
};
export default Questions;