import classNames from 'classnames';
import { FC, ReactNode } from 'react';

type ListContainerProps = {
  className?: string;
  children?: ReactNode;
  color?: 'primary' | 'secondary' | 'tertiary' | 'warning' | 'danger';
};

function createContainerComponent(
  Component: 'ul' | 'ol' | 'div',
  displayName: string,
  additionalClasses?: string
) {
  const ContainerComponent: FC<ListContainerProps> = ({
    className,
    color,
    children,
  }) => {
    const colorClass = {
      'list-primary': color === 'primary',
      'list-secondary': color === 'secondary',
      'list-tertiary': color === 'tertiary',
      'list-warning': color === 'warning',
      'list-danger': color === 'danger',
    };

    return (
      <Component
        role='listbox'
        className={classNames('list', colorClass, additionalClasses, className)}
      >
        {children}
      </Component>
    );
  };

  ContainerComponent.displayName = displayName;

  return ContainerComponent;
}

type ListItemProps = {
  className?: string;
  active?: boolean;
  onClick?: () => void;
  children?: ReactNode;
};

const Item: FC<ListItemProps> = ({ className, active, onClick, children }) => {
  return (
    <li
      role='listitem'
      tabIndex={0}
      className={classNames('list-item', { active: active }, className)}
      onClick={onClick}
    >
      {children}
    </li>
  );
};

export const List = {
  Container: createContainerComponent('ul', 'List.Container'),
  UL: createContainerComponent('ul', 'List.UL', 'list-disc'),
  OL: createContainerComponent('ol', 'List.OL', 'list-decimal'),
  Item,
};
