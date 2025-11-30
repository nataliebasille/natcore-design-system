export default function ButtonPage() {
  return (
    <div className="grid grid-cols-4 gap-4">
      <button className="btn-ghost">ghost/primary</button>
      <button className="btn-ghost/secondary">ghost/secondary</button>
      <button className="btn-ghost/accent">ghost/accent</button>
      <button className="btn-ghost/surface">ghost/surface</button>

      <button className="btn-filled">filled/primary</button>
      <button className="btn-filled/secondary">filled/secondary</button>
      <button className="btn-filled/accent">filled/accent</button>
      <button className="btn-filled/surface">filled/surface</button>
    </div>
  )
}
