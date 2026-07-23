import type React from "react";
import { ResizableHandle, ResizablePanel } from "@/components/ui/resizable";

type SectionProps = {
  defaultWidth?: string;
  children: React.ReactNode;
};

const Section: React.FC<SectionProps> = ({ defaultWidth, children }) => {
  return (
    <>
      <ResizablePanel minSize={150} defaultSize={defaultWidth}>
        {children}
      </ResizablePanel>
      <ResizableHandle withHandle />
    </>
  );
};

export default Section;
