import type { ConfigType } from "#/components/report-client/report-parent.tsx";

export type SavedReport = {
  name: string;
  config: ConfigType;
};

export type ReportState = {
  isModalOpen: boolean;
  filtersModalIsOpen: boolean;
  reportRows: Array<Record<string, unknown>>;
  activeReportName: string;
  isRunningReport: boolean;
  isExportingReportName: string;
  reportError: string;
  savedReports: SavedReport[];
};

export type ReportAction =
  | { type: "setSavedReports"; payload: SavedReport[] }
  | { type: "setRunning"; payload: boolean }
  | { type: "setExportingReportName"; payload: string }
  | { type: "setReportError"; payload: string }
  | {
      type: "openReportModal";
      payload: {
        reportName: string;
        rows: Array<Record<string, unknown>>;
      };
    }
  | { type: "closeReportModal" }
  | { type: "toggleFiltersModal" };

export function createReportState(savedReports: SavedReport[]): ReportState {
  return {
    isModalOpen: false,
    filtersModalIsOpen: false,
    reportRows: [],
    activeReportName: "",
    isRunningReport: false,
    isExportingReportName: "",
    reportError: "",
    savedReports,
  };
}

export function reportReducer(
  state: ReportState,
  action: ReportAction,
): ReportState {
  switch (action.type) {
    case "setSavedReports":
      return { ...state, savedReports: action.payload };
    case "setRunning":
      return { ...state, isRunningReport: action.payload };
    case "setExportingReportName":
      return { ...state, isExportingReportName: action.payload };
    case "setReportError":
      return { ...state, reportError: action.payload };
    case "openReportModal":
      return {
        ...state,
        isModalOpen: true,
        activeReportName: action.payload.reportName,
        reportRows: action.payload.rows,
      };
    case "closeReportModal":
      return { ...state, isModalOpen: false };
    case "toggleFiltersModal":
      return { ...state, filtersModalIsOpen: !state.filtersModalIsOpen };
    default:
      return state;
  }
}
