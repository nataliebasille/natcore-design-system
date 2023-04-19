import { forwardRef, DetailedHTMLProps, ButtonHTMLAttributes } from 'react';
import classnames from 'classnames';

type ButtonProps = DetailedHTMLProps<
  ButtonHTMLAttributes<HTMLButtonElement>,
  HTMLButtonElement
> & {
  variant?: 'solid' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'secondary' | 'tertiary' | 'danger' | 'warning';
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant, size = 'md', color = 'tertiary', ...props },
  ref
) {
  const colors = {
    'btn-primary': color === 'primary',
    'btn-secondary': color === 'secondary',
    'btn-tertiary': color === 'tertiary',
    'btn-danger': color === 'danger',
    'btn-warning': color === 'warning',
  };

  const variants = {
    'btn-solid': variant === 'solid',
    'btn-outline': variant === 'outline',
  };

  const sizes = {
    'btn-sm': size === 'sm',
    'btn-md': size === 'md',
    'btn-lg': size === 'lg',
  };

  return (
    <button
      ref={ref}
      {...props}
      className={classnames('btn', colors, variants, sizes, className)}
    />
  );
});

export { Button };
