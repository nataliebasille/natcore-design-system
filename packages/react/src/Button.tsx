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
  { className, ...props },
  ref
) {
  return (
    <button
      ref={ref}
      {...props}
      className={classnames('btn btn-primary', className)}
    />
  );
});

export { Button };
