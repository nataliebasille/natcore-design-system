import classNames from 'classnames';
import { FC, ReactNode } from 'react';

type ListContainerProps = {
  className?: string;
  children?: ReactNode;
  color?: 'primary' | 'secondary' | 'tertiary' | 'warning' | 'danger';
};

const Container: FC<ListContainerProps> = ({ className, color, children }) => {
  const colorClass = {
    'list-primary': color === 'primary',
    'list-secondary': color === 'secondary',
    'list-tertiary': color === 'tertiary',
    'list-warning': color === 'warning',
    'list-danger': color === 'danger',
  };
  return (
    <ul role='listbox' className={classNames('list', colorClass, className)}>
      {children}
    </ul>
  );
};

const UL: FC<ListContainerProps> = ({ className, color, children }) => {
  const colorClass = {
    'list-primary': color === 'primary',
    'list-secondary': color === 'secondary',
    'list-tertiary': color === 'tertiary',
    'list-warning': color === 'warning',
    'list-danger': color === 'danger',
  };

  return (
    <ul
      role='listbox'
      className={classNames('list list-disc', colorClass, className)}
    >
      {children}
    </ul>
  );
};

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
  Container,
  UL,
  Item,
};
