import { ResizablePanelGroup } from "@/components/ui/resizable";
import Header from "./header";
import Section from "./section";
import Tables from "./tables";
import { useEffect, useState } from "react";
import ColumnSelect from "./column-select";
import ReportConfigOutput from "./report-config-output";
import type { ReportTablesByName } from "#/utils/report-core/types.ts";

export type ConfigType = {
  table: string;
  columns: string[];
  relations: Record<string, string[]>;
};

type SaveConfig = {
  config: ConfigType;
  name: string;
};

const REPORT_CONFIG_STORAGE_KEY = "report-builder-config";

const ReportBuilder = () => {
  // state for report will live here

  const template: ConfigType = { table: "", columns: [], relations: {} };

  const [selectedTable, setSelectedTable] = useState("");
  const [config, setConfig] = useState<ConfigType>(template);
  const [reportTables, setReportTables] = useState<ReportTablesByName>({});

  useEffect(() => {
    let isSubscribed = true;

    const loadReportTables = async () => {
      try {
        const response = await fetch("/api/report-tables");

        if (!response.ok) {
          return;
        }

        const tables = (await response.json()) as ReportTablesByName;

        if (isSubscribed) {
          setReportTables(tables);
        }
      } catch {
        // Leave an empty state if metadata cannot be loaded.
      }
    };

    void loadReportTables();

    return () => {
      isSubscribed = false;
    };
  }, []);

  const handleSetSelectedTable = (tableName: string) => {
    setSelectedTable(tableName);
    const freshConfig: ConfigType = {
      table: tableName,
      columns: template.columns,
      relations: template.relations,
    };
    setConfig(freshConfig);
  };

  const handleSave = (name: string) => {
    const payload: SaveConfig = {
      config,
      name,
    };

    try {
      const rawValue = localStorage.getItem(REPORT_CONFIG_STORAGE_KEY);
      const parsed = rawValue ? (JSON.parse(rawValue) as SaveConfig[] | SaveConfig) : [];
      const existing = Array.isArray(parsed)
        ? parsed
        : parsed?.name && parsed?.config
          ? [parsed]
          : [];

      localStorage.setItem(
        REPORT_CONFIG_STORAGE_KEY,
        JSON.stringify([...existing, payload]),
      );
      window.alert(`Saved report: ${name || "Untitled"}`);
    } catch {
      localStorage.setItem(REPORT_CONFIG_STORAGE_KEY, JSON.stringify([payload]));
      window.alert(`Saved report: ${name || "Untitled"}`);
    }
  };

  return (
    <div className="w-screen h-screen flex flex-col">
      <Header />
      <main className="flex grow ">
        <ResizablePanelGroup orientation="horizontal" className="grow border">
          <Section defaultWidth={"20%"}>
            <Tables
              handleSetSelectedTable={handleSetSelectedTable}
              reportTables={reportTables}
            />
          </Section>
          <Section defaultWidth={"50%"}>
            <ColumnSelect
              config={config}
              setConfig={setConfig}
              selectedTable={selectedTable}
              reportTables={reportTables}
            />
          </Section>
          <Section defaultWidth={"30%"}>
            <ReportConfigOutput config={config} handleSave={handleSave} />
          </Section>
        </ResizablePanelGroup>
      </main>
      <footer></footer>
    </div>
  );
};

export default ReportBuilder;
