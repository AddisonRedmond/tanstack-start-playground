import { ResizablePanelGroup } from "@/components/ui/resizable";
import Header from "./header";
import Section from "./section";
import Tables from "./tables";
import { useState } from "react";
import ColumnSelect from "./column-select";
import ReportConfigOutput from "./report-config-output";

export type ConfigType = {
  table: string;
  columns: string[];
  relations: Record<string, string[]>;
};

const ReportBuilder = () => {
  // state for report will live here

  const template: ConfigType = { table: "", columns: [], relations: {} };

  const [selectedTable, setSelectedTable] = useState("");
  const [config, setConfig] = useState<ConfigType>(template);

  const handleSetSelectedTable = (tableName: string) => {
    setSelectedTable(tableName);
    const freshConfig: ConfigType = {
      table: tableName,
      columns: template.columns,
      relations: template.relations,
    };
    setConfig(freshConfig);
  };

  console.log(config);

  return (
    <div className="w-screen h-screen flex flex-col">
      <Header />
      <main className="flex grow ">
        <ResizablePanelGroup orientation="horizontal" className="grow border">
          <Section defaultWidth={"20%"}>
            <Tables handleSetSelectedTable={handleSetSelectedTable} />
          </Section>
          <Section defaultWidth={"50%"}>
            <ColumnSelect
              config={config}
              setConfig={setConfig}
              selectedTable={selectedTable}
            />
          </Section>
          <Section defaultWidth={"30%"}>
            <ReportConfigOutput config={config} />
          </Section>
        </ResizablePanelGroup>
      </main>
      <footer></footer>
    </div>
  );
};

export default ReportBuilder;
