import type { ReportTablesByName } from "#/utils/report-core/types.ts";
// @ts-expect-error - lucide-react types not available
import { Table } from "lucide-react";

type TableProps = {
  handleSetSelectedTable: (tableName: string) => void;
  reportTables: ReportTablesByName;
};

type TableSelectProps = {
  tableName: string;
  onClick: () => void;
};

const TableSelect: React.FC<TableSelectProps> = ({ tableName, onClick }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex item-center gap-x-2 cursor-pointer p-2 hover:bg-zinc-200 ease-in-out duration-200"
    >
      <Table width={15} />
      <p className="text-sm">{tableName}</p>
    </button>
  );
};

const Tables: React.FC<TableProps> = ({
  handleSetSelectedTable,
  reportTables,
}) => {
  const tableNames = Object.keys(reportTables);

  return (
    <div>
      <header className="h-12 border-b font-medium text-sm pl-2 flex items-center">
        TABLES
      </header>
      <div className="py-4 flex flex-col">
        {tableNames.map((tableName) => {
          return (
            <TableSelect
              key={tableName}
              tableName={tableName}
              onClick={() => handleSetSelectedTable(tableName)}
            />
          );
        })}
      </div>
    </div>
  );
};

export default Tables;
