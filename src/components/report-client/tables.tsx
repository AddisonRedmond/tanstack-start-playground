import { reportTables } from "#/utils/report-core/schema-core.ts";
import { Table } from "lucide-react";

type TableProps = {
  handleSetSelectedTable: (tableName: string) => void;
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

const Tables: React.FC<TableProps> = ({ handleSetSelectedTable }) => {
  const tableNames = reportTables;
  return (
    <div>
      <header className="h-12 border-b font-medium text-sm pl-2 flex items-center">
        TABLES
      </header>
      <div className=" py-4 flex flex-col">
        {tableNames.map((table) => {
          return <TableSelect key={table.id} tableName={table.name} onClick={()=> handleSetSelectedTable(table.name)} />;
        })}
      </div>
    </div>
  );
};

export default Tables;
