import { createFileRoute } from "@tanstack/react-router";
import { useReducer } from "react";
import Modal from "#/components/modal.tsx";
import GenericTable from "#/components/table/table.tsx";
import ReportCard from "#/components/report-card.tsx";
import {
  createReportState,
  reportReducer,
  type SavedReport,
} from "../reducers/report-state";
import BuildFilters from "#/components/report-client/build-filters.tsx";

const REPORT_CONFIG_STORAGE_KEY = "report-builder-config";

function readSavedReports(): SavedReport[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const rawValue = window.localStorage.getItem(REPORT_CONFIG_STORAGE_KEY);

    if (!rawValue) {
      return [];
    }

    const parsed = JSON.parse(rawValue) as SavedReport[] | SavedReport;

    if (Array.isArray(parsed)) {
      return parsed.filter((report) => report?.name && report?.config);
    }

    return parsed?.name && parsed?.config ? [parsed] : [];
  } catch {
    return [];
  }
}
function toCsvCell(value: unknown): string {
  if (value === null || value === undefined) {
    return "";
  }

  const normalized =
    typeof value === "object" ? JSON.stringify(value) : String(value);
  const escaped = normalized.replace(/"/g, '""');
  return `"${escaped}"`;
}
function toCsv(rows: Array<Record<string, unknown>>): string {
  if (rows.length === 0) {
    return "";
  }

  const headers = Array.from(new Set(rows.flatMap((row) => Object.keys(row))));
  const headerLine = headers.map((header) => toCsvCell(header)).join(",");
  const dataLines = rows.map((row) =>
    headers.map((header) => toCsvCell(row[header])).join(","),
  );

  return [headerLine, ...dataLines].join("\n");
}
function downloadCsv(content: string, reportName: string): void {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  const safeName = (reportName || "report")
    .trim()
    .replace(/[^a-zA-Z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "");

  anchor.href = url;
  anchor.download = `${safeName || "report"}.csv`;
  anchor.style.display = "none";
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  window.URL.revokeObjectURL(url);
}

export const Route = createFileRoute("/report")({
  component: RouteComponent,
});

function RouteComponent() {
  const [state, dispatch] = useReducer(
    reportReducer,
    readSavedReports(),
    createReportState,
  );

  const handleDeleteReport = (reportName: string) => {
    const nextReports = state.savedReports.filter(
      (report) => report.name !== reportName,
    );
    dispatch({ type: "setSavedReports", payload: nextReports });
    window.localStorage.setItem(
      REPORT_CONFIG_STORAGE_KEY,
      JSON.stringify(nextReports),
    );
  };

  const fetchReportRows = async (report: SavedReport) => {
    const response = await fetch("/api/test", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ config: report.config }),
    });

    if (!response.ok) {
      throw new Error("Unable to run report");
    }

    return (await response.json()) as Array<Record<string, unknown>>;
  };

  const handleRunReport = async (report: SavedReport) => {
    dispatch({ type: "setRunning", payload: true });
    dispatch({ type: "setReportError", payload: "" });

    try {
      const result = await fetchReportRows(report);
      dispatch({
        type: "openReportModal",
        payload: {
          reportName: report.name,
          rows: result,
        },
      });
    } catch {
      dispatch({
        type: "setReportError",
        payload: "The report could not be generated right now.",
      });
    } finally {
      dispatch({ type: "setRunning", payload: false });
    }
  };

  const handleExportReport = async (report: SavedReport) => {
    dispatch({ type: "setExportingReportName", payload: report.name });

    try {
      const rows = await fetchReportRows(report);
      const csv = toCsv(rows);
      downloadCsv(csv, report.name);
    } catch {
      window.alert("The report could not be exported right now.");
    } finally {
      dispatch({ type: "setExportingReportName", payload: "" });
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 p-6">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-stone-900">
              Saved Reports
            </h1>
            <p className="text-sm text-stone-600">
              Browse the reports you have saved from the builder.
            </p>
          </div>
        </div>

        {state.savedReports.length === 0 ? (
          <div className="rounded-xl border border-dashed border-stone-300 bg-white p-8 text-center text-sm text-stone-600">
            No saved reports yet.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {state.savedReports.map((report) => (
              <ReportCard
                key={report.name}
                report={report}
                isRunningReport={state.isRunningReport}
                isExporting={state.isExportingReportName === report.name}
                onToggleFilters={() => dispatch({ type: "toggleFiltersModal" })}
                onRunReport={(selectedReport) => {
                  void handleRunReport(selectedReport);
                }}
                onExportReport={(selectedReport) => {
                  void handleExportReport(selectedReport);
                }}
                onDeleteReport={handleDeleteReport}
              />
            ))}
          </div>
        )}
      </div>

      <Modal
        isOpen={state.filtersModalIsOpen}
        containerClass="w-xl"
        title="Filters"
        onClose={() => dispatch({ type: "toggleFiltersModal" })}
      >
        <BuildFilters />
      </Modal>

      <Modal
        isOpen={state.isModalOpen}
        onClose={() => dispatch({ type: "closeReportModal" })}
        title={
          state.activeReportName ? `${state.activeReportName} Report` : "Report"
        }
        className="p-0"
      >
        {state.reportError ? (
          <p className="text-sm text-red-600">{state.reportError}</p>
        ) : (
          <GenericTable
            data={state.reportRows}
            className="overflow-hidden rounded-xl border border-stone-200"
          />
        )}
      </Modal>
    </div>
  );
}
