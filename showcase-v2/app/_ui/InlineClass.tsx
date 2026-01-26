export const InlineClass = ({ className }: { className: string }) => {
  return (
    <code
      className="text-secondary-scale-800 inline-block bg-transparent p-0 font-bold"
      style={{ padding: "0 !important" }}
    >
      `.{className}`
    </code>
  );
};
