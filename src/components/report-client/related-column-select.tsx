import {
  reportTables,
  type ReportRelation,
} from "#/utils/report-core/schema-core.ts";
import { Key, Link } from "lucide-react";
import type { ConfigType } from "./report-parent";
import { Checkbox } from "../ui/checkbox";

type RelatedTablesProps = {
  relations: ReportRelation[];
  config: ConfigType;
  toggleRelatedConfig: (
    tableName: string,
    columnName: string,
    isChecked: boolean,
  ) => void;
};

const RelatedColumnSelect: React.FC<RelatedTablesProps> = ({
  relations,
  toggleRelatedConfig,
  config,
}) => {
  if (!relations.length) {
    return null;
  }

  return (
    <div className="w-full border-b py-2">
      {relations.map((relation) => {
        const relatedTable = reportTables[relation.table];
        if (!relatedTable) {
          return null;
        }

        return (
          <div
            key={`${relation.table}-${relation.field}`}
            className="px-2 py-2"
          >
            <div className="flex justify-between items-center text-sm font-medium mb-2">
              <div className="flex gap-x-2">
                <Link width={20} />
                <p>{relation.table}</p>
              </div>
              <div className="flex items-center gap-x-2">
                <p className="text-xs text-stone-500">{relation.field}</p>
                <span className="rounded-full bg-stone-100 px-2 py-0.5 text-[11px] font-medium text-stone-700">
                  {relation.path && relation.path.length > 1
                    ? relation.path.join(" → ")
                    : `${relation.sourceColumn}.${relation.targetColumn} → ${relation.table}.${relation.sourceColumn}`}
                </span>
              </div>
            </div>
            <div>
              {relatedTable.columns.map((col) => {
                const columnId = `${relation.table}.${col.name}`;

                return (
                  <div
                    key={columnId}
                    className="flex justify-between px-2 py-2 border-b last:border-b-0"
                  >
                    <div className="flex items-center gap-x-2">
                      <Checkbox
                        checked={(
                          config.relations?.[relation.table] ?? []
                        ).includes(col.name)}
                        onCheckedChange={(isChecked) =>
                          toggleRelatedConfig(
                            relation.table,
                            col.name,
                            isChecked,
                          )
                        }
                      />
                      <label className="text-sm">{col.name}</label>
                    </div>
                    <div className="flex gap-x-1">
                      {col.isPrimaryKey && (
                        <Key width={15} className="text-yellow-500" />
                      )}
                      {col.isForeignKey && <Link width={15} />}
                      <p className="text-xs px-1 rounded-sm text-white bg-stone-400">
                        {col.dataType}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default RelatedColumnSelect;
