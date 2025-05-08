
import React, { useEffect } from "react";

interface ScrollVideoSegmentProps {
  progress: number;
  segmentCount: number;
  onTextIndexChange: (idx: number | null) => void;
  onAfterVideoChange: (after: boolean) => void;
}

const ScrollVideoSegment: React.FC<ScrollVideoSegmentProps> = ({
  progress,
  segmentCount,
  onTextIndexChange,
  onAfterVideoChange
}) => {
  // Calculate segment length based on the dynamic segmentCount
  const calculateSegmentLength = (segments: number) => {
    return 1 / (segments + 1);
  };

  useEffect(() => {
    // Calculate which text should be showing based on current progress
    const segLen = calculateSegmentLength(segmentCount);
    let textIdx: number | null = null;
    
    for (let i = 0; i < segmentCount; ++i) {
      if (progress >= segLen * i && progress < segLen * (i + 1)) {
        textIdx = i;
        break;
      }
    }
    
    if (progress >= segLen * segmentCount) {
      textIdx = null;
    }
    
    onTextIndexChange(textIdx);
    onAfterVideoChange(progress >= 1);
  }, [progress, segmentCount, onTextIndexChange, onAfterVideoChange]);

  return null;
};

export default ScrollVideoSegment;
