type ColumnSelectProps = {
  selectedTable: string;
};

const ColumnSelect: React.FC<ColumnSelectProps> = ({ selectedTable }) => {
  return (
    <div className="h-12 border-b font-medium text-sm pl-2 flex justify-between items-center px-2">
      <div className="flex">
        <p>COLUMNS</p>
        {selectedTable && <p className="ml-2 px-2 text-xs py-0.5 bg-stone-700 rounded-full text-white">
          {selectedTable}
        </p>}
      </div>

      <button className="text-xs ease-in-out duration-200 hover:text-stone-500 cursor-pointer">
        Select all
      </button>
    </div>
  );
};

export default ColumnSelect;
