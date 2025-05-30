import React from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useQuestions } from "@/hooks/useQuestions";
import { useIsMobile } from "@/hooks/use-mobile";
import { colors } from "@/lib/theme";

export interface QuestionData {
  title: string;
  content: string;
}
interface QuestionsProps {
  title: string;
}
const TABS = ["OUR VALUES", "OUR CAMPUS", "OUR MEMBERSHIPS"] as const;
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
    return <div className="w-full py-24" style={{ backgroundColor: colors.darkGreen }}>
      <div className="max-w-[90%] mx-auto">
        <h2 className="title-sm text-[#FFF4F1] mb-12">Loading questions...</h2>
        <p className="body-text text-[#FFF4F1]/70">Please wait while we fetch the questions.</p>
      </div>
    </div>;
  }
  if (error) {
    console.error('Error in Questions component:', error);
    return <div className="w-full py-24" style={{ backgroundColor: colors.darkGreen }}>
      <div className="max-w-[90%] mx-auto">
        <h2 className="title-sm text-[#FFF4F1] mb-12">Failed to load questions</h2>
        <p className="body-text text-[#FFF4F1]/70">Please check the console for more details.</p>
      </div>
    </div>;
  }
  if (!questions || Object.keys(questions).length === 0) {
    return <div className="w-full py-24" style={{ backgroundColor: colors.darkGreen }}>
      <div className="max-w-[90%] mx-auto">
        <h2 className="title-sm text-[#FFF4F1] mb-12">No questions available</h2>
        <p className="body-text text-[#FFF4F1]/70">Please add questions in Contentful with the content type 'question'.</p>
      </div>
    </div>;
  }

  // Use different column classes based on device size
  const tabsClassName = isMobile ? "col-start-1 col-end-13" : "col-start-5 col-end-13";
  return <div className="w-full py-24" style={{ backgroundColor: colors.darkGreen }}>
      <div className="max-w-[90%] mx-auto grid grid-cols-12 gap-4">
        <h2 className="title-sm text-[#FFF4F1] mb-12 col-span-12">{title}</h2>
        <Tabs defaultValue="OUR VALUES" className={tabsClassName}>
          <TabsList className="mb-12 bg-transparent w-full flex flex-wrap justify-start gap-4 h-auto">
            {TABS.map(tab => <TabsTrigger key={tab} value={tab} className="px-6 py-3 rounded-full data-[state=active]:bg-[#FFB577] data-[state=active]:text-black text-[#FFB577] border border-[#FFB577] hover:bg-white/10">
                {tab}
              </TabsTrigger>)}
          </TabsList>
          {TABS.map(tab => <TabsContent key={tab} value={tab} className="col-start-5 col-span-8">
              <Accordion type="single" collapsible className="w-full bg-transparent">
                {questions[tab]?.map((question, index) => <AccordionItem key={index} value={`${tab}-${index}`} className="border-t border-[#FFF4F1]/20 py-4 bg-transparent">
                    <AccordionTrigger className="body-text text-[#FFF4F1] hover:no-underline text-left">
                      {question.title}
                    </AccordionTrigger>
                    <AccordionContent className="body-text text-[#FFF4F1]/80 text-left">
                      {question.content}
                    </AccordionContent>
                  </AccordionItem>) || <p className="body-text text-[#FFF4F1]/70">No questions available for this category.</p>}
              </Accordion>
            </TabsContent>)}
        </Tabs>
      </div>
    </div>;
};
export default Questions;
