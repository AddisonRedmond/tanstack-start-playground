import type { ConfigType } from "./report-parent";

const ReportConfigOutput: React.FC<{ config: ConfigType }> = ({ config }) => {
  return (
    <div>
      <header className="h-12 border-b font-medium text-sm pl-2 flex items-center">
        REPORT SCHEMA
      </header>
      <pre className="p-2 text-xs whitespace-pre-wrap">
        {JSON.stringify(config, null, 2)}
      </pre>
    </div>
  );
};

export default ReportConfigOutput;
