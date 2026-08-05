import type { SavedReport } from "#/reducers/report-state.ts";
import { Trash } from "lucide-react";

type ReportCardProps = {
  report: SavedReport;
  isRunningReport: boolean;
  isExporting: boolean;
  onToggleFilters: (report: SavedReport) => void;
  onRunReport: (report: SavedReport) => void;
  onExportReport: (report: SavedReport) => void;
  onDeleteReport: (reportName: string) => void;
};

const ReportCard: React.FC<ReportCardProps> = ({
  report,
  isRunningReport,
  isExporting,
  onToggleFilters,
  onRunReport,
  onExportReport,
  onDeleteReport,
}) => {
  return (
    <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-stone-900">{report.name}</h2>
        <div className="flex items-center gap-x-2">
          <span className="rounded-full bg-stone-100 px-2 py-1 text-xs font-medium text-stone-700">
            {report.config.table}
          </span>
          <button
            type="button"
            onClick={() => onDeleteReport(report.name)}
            className="cursor-pointer rounded-lg  border-red-200  px-2 bg-red-50  text-sm font-medium text-red-700 transition hover:bg-red-100"
          >
            <Trash width={10} />
          </button>
        </div>
      </div>

      <div className="space-y-2 text-sm text-stone-600">
        <div>
          <span className="font-medium text-stone-800">Columns:</span>{" "}
          {report.config.columns.length > 0
            ? report.config.columns.map((column) => column.name).join(", ")
            : "None"}
        </div>
        <div>
          <span className="font-medium text-stone-800">Relations:</span>{" "}
          {Object.keys(report.config.relations).length > 0
            ? Object.keys(report.config.relations).join(", ")
            : "None"}
        </div>
      </div>

      <div className="flex justify-between">
        <button
          type="button"
          onClick={() => onRunReport(report)}
          disabled={isRunningReport}
          className="mt-4 w-[49%] cursor-pointer rounded-lg border border-stone-300 bg-stone-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-stone-700 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isRunningReport ? "Running..." : "Run Report"}
        </button>
        <button
          onClick={() => onToggleFilters(report)}
          className="mt-4 w-[49%] cursor-pointer rounded-lg bg-stone-100 px-3 py-2 text-sm font-medium transition hover:bg-stone-300 disabled:cursor-not-allowed disabled:opacity-70"
        >
          Run With Filters
        </button>
      </div>

      <button
        type="button"
        onClick={() => onExportReport(report)}
        disabled={isExporting}
        className="mt-2 w-full cursor-pointer rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isExporting ? "Exporting..." : "Export CSV"}
      </button>
    </div>
  );
};

export default ReportCard;
