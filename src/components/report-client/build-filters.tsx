type FilterInputProps = {
  title: string;
};

const Int: React.FC<FilterInputProps> = ({ title }) => {
  return (
    <div className="flex">
      <p>{title}</p>
      {/* dropdown */}
      {/* text input */}
    </div>
  );
};

const String: React.FC<FilterInputProps> = ({ title }) => {
  return (
    <div>
      <p>{title}</p>
      {/* dropdown */}
      {/* text input */}
    </div>
  );
};

const Date: React.FC<FilterInputProps> = ({ title }) => {};

const DateTime: React.FC<FilterInputProps> = ({ title }) => {};

const BuildFilters = () => {
  return <div></div>;
};

export default BuildFilters;
