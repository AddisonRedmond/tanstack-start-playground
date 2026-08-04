import { useMemo } from "react";
import {
  type ReportColumn,
  type ReportTablesByName,
} from "#/utils/report-core/types.ts";
import { Key, Link } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import type { ConfigType } from "./report-parent";
import RelatedColumnSelect from "./related-column-select";

type ColumnSelectProps = {
  selectedTable: string;
  reportTables: ReportTablesByName;
  config: ConfigType;
  setConfig: React.Dispatch<React.SetStateAction<ConfigType>>;
};

type MainSelectProps = {
  columns: ReportColumn[];
  selectedTable: string;
  config: ConfigType;
  toggleMainConfig: (
    columnName: string,
    columnDataType: string,
    isChecked: boolean,
  ) => void;
};

const MainSelect: React.FC<MainSelectProps> = ({
  columns,
  config,
  toggleMainConfig,
}) => {
  return (
    <div className="w-full border-b">
      {columns.map((col) => {
        return (
          <div key={col.id} className="flex justify-between px-2 my-2">
            <div className="space-x-2 flex items-center">
              <Checkbox
                checked={config.columns.some((selected) => selected.name === col.name)}
                onCheckedChange={(isChecked) =>
                  toggleMainConfig(col.name, col.dataType, isChecked === true)
                }
              />
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

const ColumnSelect: React.FC<ColumnSelectProps> = ({
  selectedTable,
  reportTables,
  setConfig,
  config,
}) => {
  const addColumn = (
    list: ConfigType["columns"],
    name: string,
    dataType: string,
  ) => {
    if (list.some((column) => column.name === name)) {
      return list;
    }

    return [...list, { name, dataType }];
  };

  const removeColumn = (list: ConfigType["columns"], name: string) => {
    return list.filter((column) => column.name !== name);
  };

  const columns = useMemo(
    () => reportTables[selectedTable]?.columns ?? [],
    [selectedTable],
  );
  const relatedTables = useMemo(
    () => reportTables[selectedTable]?.relations ?? [],
    [selectedTable],
  );

  const toggleRelatedConfig = (
    tableName: string,
    columnName: string,
    columnDataType: string,
    isChecked: boolean,
  ) => {
    const reflectedConfig: ConfigType = {
      ...config,
      columns: [...(config.columns ?? [])],
      relations: Object.fromEntries(
        Object.entries(config.relations ?? {}).map(([name, relationColumns]) => [
          name,
          [...relationColumns],
        ]),
      ),
    };

    const nextRelations = reflectedConfig.relations;
    const currentColumns = nextRelations[tableName] ?? [];
    const nextRelationColumns = isChecked
      ? addColumn(currentColumns, columnName, columnDataType)
      : removeColumn(currentColumns, columnName);

    nextRelations[tableName] = nextRelationColumns;

    const matchingRelation = (
      reportTables[selectedTable]?.relations ?? []
    ).find((relation) => relation.table === tableName);
    const fkColumnName =
      matchingRelation?.field ?? columns.find((col) => col.isForeignKey)?.name;

    let nextColumns = [...(reflectedConfig.columns ?? [])];

    if (fkColumnName) {
      const fkColumn = columns.find((col) => col.name === fkColumnName);

      if (isChecked) {
        nextColumns = addColumn(
          nextColumns,
          fkColumnName,
          fkColumn?.dataType ?? "text",
        );
      } else if (nextRelationColumns.length === 0) {
        nextColumns = removeColumn(nextColumns, fkColumnName);
      }
    }

    if (matchingRelation?.path && matchingRelation.path.length > 2) {
      const intermediateTableName =
        matchingRelation.path[matchingRelation.path.length - 2];
      const intermediateColumnName = reportTables[
        intermediateTableName
      ]?.columns.find((col) => col.isPrimaryKey)?.name;

      if (intermediateColumnName) {
        const currentIntermediateColumns =
          nextRelations[intermediateTableName] ?? [];
        const nextIntermediateRelationColumns = isChecked
          ? addColumn(
              currentIntermediateColumns,
              intermediateColumnName,
              reportTables[intermediateTableName]?.columns.find(
                (col) => col.name === intermediateColumnName,
              )?.dataType ?? "text",
            )
          : removeColumn(currentIntermediateColumns, intermediateColumnName);

        nextRelations[intermediateTableName] = nextIntermediateRelationColumns;
      }
    }

    const prunedRelations = Object.fromEntries(
      Object.entries(nextRelations).filter(([relationTable]) => {
        const relation = (reportTables[selectedTable]?.relations ?? []).find(
          (candidate) => candidate.table === relationTable,
        );

        if (!relation) {
          return false;
        }

        return (
          !relation.field ||
          nextColumns.some((selectedColumn) => selectedColumn.name === relation.field)
        );
      }),
    );

    reflectedConfig.columns = nextColumns;
    reflectedConfig.relations = prunedRelations;

    setConfig(reflectedConfig);
  };

  const toggleMainConfig = (
    columnName: string,
    columnDataType: string,
    isChecked: boolean,
  ) => {
    let nextColumns = [...(config.columns ?? [])];
    const nextRelations = Object.fromEntries(
      Object.entries(config.relations ?? {}).map(([name, relationColumns]) => [
        name,
        [...relationColumns],
      ]),
    );
    const isForeignKeyColumn = columns.some(
      (col) => col.name === columnName && col.isForeignKey,
    );

    if (isChecked) {
      nextColumns = addColumn(nextColumns, columnName, columnDataType);
    } else {
      nextColumns = removeColumn(nextColumns, columnName);

      if (isForeignKeyColumn) {
        Object.keys(nextRelations).forEach((relationTable) => {
          delete nextRelations[relationTable];
        });
      }
    }

    const updatedConfig: ConfigType = {
      ...config,
      columns: nextColumns,
      relations: nextRelations,
    };

    setConfig(updatedConfig);
  };

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
      <div>
        <MainSelect
          columns={columns}
          selectedTable={selectedTable}
          config={config}
          toggleMainConfig={toggleMainConfig}
        />
        {relatedTables.length > 0 && (
          <>
            <div className="h-12 border-b font-medium text-sm pl-2 flex items-center px-2">
              RELATED TABLES
            </div>
            <RelatedColumnSelect
              relations={relatedTables}
              reportTables={reportTables}
              config={config}
              toggleRelatedConfig={toggleRelatedConfig}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default ColumnSelect;
