export default async function ButtonGroupPage() {
  return (
    <div className="flex flex-col gap-4">
      <div className="btn-group-solid/primary">
        <label>
          <input type="radio" name="solid-options" />
          Option 1
        </label>

        <label>
          <input type="radio" name="solid-options" />
          Option 2
        </label>

        <label>
          <input type="radio" name="solid-options" />
          Option 3
        </label>
      </div>

      <div className="btn-group-soft/primary">
        <label>
          <input type="radio" name="soft-options" />
          Option 1
        </label>

        <label>
          <input type="radio" name="soft-options" />
          Option 2
        </label>

        <label>
          <input type="radio" name="soft-options" />
          Option 3
        </label>
      </div>

      <div className="btn-group-outline/primary">
        <label>
          <input type="radio" name="outline-options" />
          Option 1
        </label>

        <label>
          <input type="radio" name="outline-options" />
          Option 2
        </label>

        <label>
          <input type="radio" name="outline-options" />
          Option 3
        </label>
      </div>

      <div className="btn-group-ghost/primary">
        <label>
          <input type="radio" name="ghost-options" />
          Option 1
        </label>

        <label>
          <input type="radio" name="ghost-options" />
          Option 2
        </label>

        <label>
          <input type="radio" name="ghost-options" />
          Option 3
        </label>
      </div>
    </div>
  );
}
