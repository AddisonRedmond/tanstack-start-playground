import {
  reportTables,
  type ReportColumn,
} from "#/utils/report-core/schema-core.ts";
import { Key, Link } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

type ColumnSelectProps = {
  selectedTable: string;
};

const ColumnSection: React.FC<{
  columns: ReportColumn[];
}> = ({ columns }) => {
  return (
    <div className="w-full">
      {columns.map((col) => {
        return (
          <div key={col.id} className="flex justify-between px-2 my-2">
            <div className="space-x-2 flex items-center">
              <Checkbox />
              <label>{col.name}</label>
            </div>
            <div className="flex gap-x-1">
              {col.isPrimaryKey && (
                <Key width={15} className="text-yellow-500" />
              )}
              {col.isForeignKey && <Link width={15} />}
              <p className="text-xs px-1 grid place-content-center rounded-sm text-white bg-stone-400">
                {col.dataType}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

const RelatedTables = () => {
  return (
    <div>
      <p>RELATED TABLES</p>
      <div>
        <p>Table name</p>
        <p>{"FK -> PK"}</p>
      </div>
      <div>Select columns</div>
    </div>
  );
};

const ColumnSelect: React.FC<ColumnSelectProps> = ({ selectedTable }) => {
  const columns = reportTables[selectedTable]?.columns ?? [];
  const relatedTables = reportTables[selectedTable]?.relations ?? [];
  console.log(relatedTables);
  return (
    <div>
      <div className="h-12 border-b font-medium text-sm pl-2 flex justify-between items-center px-2">
        <div className="flex">
          <p>COLUMNS</p>
          {selectedTable && (
            <p className="ml-2 px-2 text-xs py-0.5 bg-stone-700 rounded-full text-white">
              {selectedTable}
            </p>
          )}
        </div>

        <button className="text-xs ease-in-out duration-200 hover:text-stone-500 cursor-pointer">
          {columns.length > 0 ? `Select all (${columns.length})` : "Select all"}
        </button>
      </div>
      <ColumnSection columns={columns} />
    </div>
  );
};

export default ColumnSelect;
