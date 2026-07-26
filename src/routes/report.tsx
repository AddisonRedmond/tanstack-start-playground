import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import Modal from "#/components/modal.tsx";
import type { ConfigType } from "#/components/report-client/report-parent.tsx";
import GenericTable from "#/components/table/table.tsx";

type SavedReport = {
  name: string;
  config: ConfigType;
};

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

  const headers = Array.from(
    new Set(rows.flatMap((row) => Object.keys(row))),
  );
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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [reportRows, setReportRows] = useState<Array<Record<string, unknown>>>([]);
  const [activeReportName, setActiveReportName] = useState("");
  const [isRunningReport, setIsRunningReport] = useState(false);
  const [isExportingReportName, setIsExportingReportName] = useState("");
  const [reportError, setReportError] = useState("");
  const [savedReports, setSavedReports] = useState<SavedReport[]>(readSavedReports);

  const handleDeleteReport = (reportName: string) => {
    const nextReports = savedReports.filter((report) => report.name !== reportName);
    setSavedReports(nextReports);
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
    setIsRunningReport(true);
    setReportError("");

    try {
      const result = await fetchReportRows(report);
      setReportRows(result);
      setActiveReportName(report.name);
      setIsModalOpen(true);
    } catch {
      setReportError("The report could not be generated right now.");
    } finally {
      setIsRunningReport(false);
    }
  };

  const handleExportReport = async (report: SavedReport) => {
    setIsExportingReportName(report.name);

    try {
      const rows = await fetchReportRows(report);
      const csv = toCsv(rows);
      downloadCsv(csv, report.name);
    } catch {
      window.alert("The report could not be exported right now.");
    } finally {
      setIsExportingReportName("");
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 p-6">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-stone-900">Saved Reports</h1>
            <p className="text-sm text-stone-600">
              Browse the reports you have saved from the builder.
            </p>
          </div>
        </div>

        {savedReports.length === 0 ? (
          <div className="rounded-xl border border-dashed border-stone-300 bg-white p-8 text-center text-sm text-stone-600">
            No saved reports yet.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {savedReports.map((report) => (
              <div
                key={report.name}
                className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm"
              >
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-stone-900">
                    {report.name}
                  </h2>
                  <span className="rounded-full bg-stone-100 px-2 py-1 text-xs font-medium text-stone-700">
                    {report.config.table}
                  </span>
                </div>

                <div className="space-y-2 text-sm text-stone-600">
                  <div>
                    <span className="font-medium text-stone-800">Columns:</span>{" "}
                    {report.config.columns.length > 0
                      ? report.config.columns.join(", ")
                      : "None"}
                  </div>
                  <div>
                    <span className="font-medium text-stone-800">Relations:</span>{" "}
                    {Object.keys(report.config.relations).length > 0
                      ? Object.keys(report.config.relations).join(", ")
                      : "None"}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => void handleRunReport(report)}
                  disabled={isRunningReport}
                  className="mt-4 w-full cursor-pointer rounded-lg border border-stone-300 bg-stone-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-stone-700 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isRunningReport ? "Running..." : "Run Report"}
                </button>
                <button
                  type="button"
                  onClick={() => void handleExportReport(report)}
                  disabled={isExportingReportName === report.name}
                  className="mt-2 w-full cursor-pointer rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isExportingReportName === report.name
                    ? "Exporting..."
                    : "Export CSV"}
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteReport(report.name)}
                  className="mt-2 w-full cursor-pointer rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700 transition hover:bg-red-100"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={activeReportName ? `${activeReportName} Report` : "Report"}
        className="p-0"
      >
        {reportError ? (
          <p className="text-sm text-red-600">{reportError}</p>
        ) : (
          <GenericTable data={reportRows} className="overflow-hidden rounded-xl border border-stone-200" />
        )}
      </Modal>
    </div>
  );
}
