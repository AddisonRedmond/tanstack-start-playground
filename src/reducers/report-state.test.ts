import type { ConfigType } from "#/components/report-client/report-parent.tsx";
import { describe, expect, it } from "vitest";
import { createReportState, reportReducer } from "./report-state";

describe("reportReducer", () => {
  it("stores the selected report config when opening the filters modal", () => {
    const config: ConfigType = {
      table: "users",
      columns: [{ name: "id", dataType: "int" }],
      relations: {},
    };

    const nextState = reportReducer(createReportState([]), {
      type: "toggleFiltersModal",
      payload: config,
    });

    expect(nextState.filtersModalIsOpen).toBe(true);
    expect(nextState.currentReportConfig).toEqual(config);
  });
});
