import { useState } from "react";
import type { ConfigType } from "./report-parent";
import { convertToLegacyConfig } from "#/utils/report-core/util.ts";

const ReportConfigOutput: React.FC<{
  config: ConfigType;
  handleSave: (name: string) => void;
}> = ({ config, handleSave }) => {
  const [name, setName] = useState("");
  return (
    <div className="flex flex-col h-full">
      <header className="h-12 border-b font-medium text-sm pl-2 flex items-center">
        REPORT SCHEMA
      </header>
      <input
        value={name}
        onChange={(event) => setName(event.target.value)}
        placeholder="Report Name"
        className="border rounded-md mt-1 mx-1"
      />
      <pre className="p-2 grow text-xs whitespace-pre-wrap">
        {JSON.stringify(convertToLegacyConfig(config), null, 2)}
      </pre>

      <button
        onClick={() => handleSave(name)}
        className="border-t rounded-l-md rounded-r-md py-1 font-semibold cursor-hover"
      >
        Save
      </button>
    </div>
  );
};

export default ReportConfigOutput;
