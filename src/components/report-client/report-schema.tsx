const ReportSchema: React.FC<{ config: Record<string, any> }> = ({
  config,
}) => {
  return (
    <div className="rounded-md border bg-stone-950 p-4 text-sm text-stone-100">
      <pre className="whitespace-pre-wrap wrap-break-word">
        {JSON.stringify(config, null, 2)}
      </pre>
    </div>
  );
};

export default ReportSchema;
