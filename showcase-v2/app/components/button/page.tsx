export default function ButtonPage() {
  return (
    <div className="grid grid-cols-5 gap-3">
      <button className="btn-ghost">ghost</button>
      <button className="btn-ghost/primary">ghost/primary</button>
      <button className="btn-ghost/secondary">ghost/secondary</button>
      <button className="btn-ghost/accent">ghost/accent</button>
      <button className="btn-ghost/surface">ghost/surface</button>

      <button className="btn-solid">solid</button>
      <button className="btn-solid/primary">solid/primary</button>
      <button className="btn-solid/secondary">solid/secondary</button>
      <button className="btn-solid/accent">solid/accent</button>
      <button className="btn-solid/surface">solid/surface</button>

      <button className="btn-outline">outline</button>
      <button className="btn-outline/primary">outline/primary</button>
      <button className="btn-outline/secondary">outline/secondary</button>
      <button className="btn-outline/accent">outline/accent</button>
      <button className="btn-outline/surface">outline/surface</button>

      <button className="btn-ghost-outline">ghost-outline</button>
      <button className="btn-ghost-outline/primary">
        ghost-outline/primary
      </button>
      <button className="btn-ghost-outline/secondary">
        ghost-outline/secondary
      </button>
      <button className="btn-ghost-outline/accent">ghost-outline/accent</button>
      <button className="btn-ghost-outline/surface">
        ghost-outline/surface
      </button>
    </div>
  );
}
