export const InlineClass = ({ className }: { className: string }) => {
  return (
    <code
      className="text-tone-950-primary inline-block bg-transparent p-0 font-bold"
      style={{ padding: '0 !important' }}
    >
      `.{className}`
    </code>
  )
}
