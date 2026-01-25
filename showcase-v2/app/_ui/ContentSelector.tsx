"use client";
import {
  Children,
  Fragment,
  type ReactElement,
  type ReactNode,
  useCallback,
  useState,
} from "react";

let uuid = 0;
export const SelectorContainer: React.FC<{
  children?: ReactElement<ContentProps> | ReactElement<ContentProps>[];
}> = ({ children }) => {
  const containerName = `container-${uuid++}`;
  const [selectedIndex, setSelectedIndex] = useState<number>(0);

  const handleChange = useCallback((index: number) => {
    setSelectedIndex(index);
  }, []);

  const array = Children.toArray(children) as ReactElement<ContentProps>[];
  const selectedChild = array[selectedIndex];
  return (
    <>
      <div className="radio-group-primary radio-group mb-3">
        {array.map((element, itemIndex) => {
          const { selector } = element.props;
          const id = `content-${uuid++}`;
          return (
            <Fragment key={id}>
              <input
                id={id}
                type="radio"
                name={containerName}
                checked={selectedIndex === itemIndex}
                onChange={() => handleChange(itemIndex)}
              />
              <label htmlFor={id}>{selector}</label>
            </Fragment>
          );
        })}
      </div>
      <div>{selectedChild?.props.children}</div>
    </>
  );
};

type ContentProps = {
  selector: ReactNode;
  children: ReactNode;
};

export const SelectorContent: React.FC<ContentProps> = () => null;
