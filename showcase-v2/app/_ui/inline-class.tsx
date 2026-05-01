export const InlineClass = ({ className }: { className: string }) => {
  return (
    <code
      className="inline-block bg-transparent p-0 font-bold text-primary-950"
      style={{ padding: "0 !important" }}
    >
      `.{className}`
    </code>
  );
};
