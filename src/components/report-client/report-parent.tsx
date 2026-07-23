import { ResizablePanelGroup } from "@/components/ui/resizable";
import Header from "./header";
import Section from "./section";
import Tables from "./tables";
import { useState } from "react";
import ColumnSelect from "./column-select";
import ReportConfigOutput from "./report-config-output";

const ReportBuilder = () => {
  // state for report will live here
  const [selectedTable, setSelectedTable] = useState("");

  const handleSetSelectedTable = (tableName: string) => {
    setSelectedTable(tableName);
  };

  return (
    <div className="w-screen h-screen flex flex-col">
      <Header />
      <main className="flex grow ">
        <ResizablePanelGroup orientation="horizontal" className="grow border">
          <Section defaultWidth={"20%"}>
            <Tables handleSetSelectedTable={handleSetSelectedTable} />
          </Section>
          <Section defaultWidth={"50%"}>
            <ColumnSelect selectedTable={selectedTable} />
          </Section>
          <Section defaultWidth={"30%"}>
            <ReportConfigOutput />
          </Section>
        </ResizablePanelGroup>
      </main>
      <footer></footer>
    </div>
  );
};

export default ReportBuilder;
