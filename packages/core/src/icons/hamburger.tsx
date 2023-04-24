export const HamburgerSVG = (props: JSX.IntrinsicElements['svg']) => (
  <svg
    version='1.0'
    xmlns='http://www.w3.org/2000/svg'
    viewBox='0 0 100 80'
    width='100%'
    height='100%'
    {...props}
  >
    <rect width='100' height='15' rx='8' ry='8' fill='currentColor' />
    <rect width='100' height='15' rx='8' ry='8' y='30' fill='currentColor' />
    <rect width='100' height='15' rx='8' ry='8' fill='currentColor' y='60' />
  </svg>
);
