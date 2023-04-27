'use client';
import {
  Children,
  Fragment,
  ReactElement,
  ReactNode,
  useCallback,
  useState,
} from 'react';

const SYSTEMS = [
  { name: 'Native', value: 'native', disabled: false },
  { name: 'React', value: 'react', disabled: false },
  { name: 'Vue', value: 'vue', disabled: true },
  { name: 'Svelte', value: 'svelte', disabled: true },
] as const;

type System = (typeof SYSTEMS)[number]['value'];

let uuid = 0;
export const SystemSelectorContainer: React.FC<{
  initialSystem?: System;
  children?: ReactElement<ContentProps> | ReactElement<ContentProps>[];
}> = ({ initialSystem = 'native', children }) => {
  const [system, setSystem] = useState<System>(initialSystem);
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSystem(e.target.value as System);
  }, []);

  const array = Children.toArray(children) as ReactElement<ContentProps>[];
  const element = array.find((child) => child.props.system === system);

  return (
    <div className='rounded-lg border border-primary-shades-300 p-3'>
      <div className='radio-group-primary radio-group'>
        {SYSTEMS.map(({ name, value, disabled }) => {
          const id = `system-${value}-${uuid++}`;
          return (
            <Fragment key={id}>
              <input
                id={id}
                type='radio'
                name='system'
                value={value}
                checked={system === value}
                disabled={disabled}
                onChange={handleChange}
              />
              <label htmlFor={id}>{name}</label>
            </Fragment>
          );
        })}
      </div>
      <div className='divider -mx-3' />
      {element}
    </div>
  );
};

type ContentProps = {
  system: System;
  children: ReactNode;
};
export const SystemSelectorContent: React.FC<ContentProps> = ({ children }) => (
  <div className='content'>{children}</div>
);
