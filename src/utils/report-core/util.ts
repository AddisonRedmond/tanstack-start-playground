import type { ConfigType } from "#/components/report-client/report-parent.tsx";

export type LegacyConfigType = {
	table: string;
	columns: string[];
	relations: Record<string, string[]>;
};

function unique(values: string[]) {
	return Array.from(new Set(values));
}

export function convertToLegacyConfig(config: ConfigType): LegacyConfigType {
	const columns = unique(config.columns.map((column) => column.name));

	const relations = Object.fromEntries(
		Object.entries(config.relations ?? {}).map(([tableName, relationColumns]) => [
			tableName,
			unique(relationColumns.map((column) => column.name)),
		]),
	);

	return {
		table: config.table,
		columns,
		relations,
	};
}