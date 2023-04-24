export const LogoSVG = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    version='1.0'
    xmlns='http://www.w3.org/2000/svg'
    viewBox='0 0 120 120'
    width='100%'
    height='100%'
    {...props}
  >
    <defs>
      <g id='anchor'>
        <polygon points='0,120 0,19.019237886466840597 19.019237886466840597,0 90,0 90,8 23.638040039983846713,8 8,23.638040039983846713 8,120 ' />
      </g>
    </defs>

    <use href='#anchor' fill='currentColor' />
    <use href='#anchor' fill='currentColor' transform='rotate(180 60 60)' />

    <g id='n' fill='currentColor'>
      <polygon points='18,108 18,29.411542731880104358 29.411542731880104358,18 90.588457268119895642,84 90,12 101.411542731880104358,12 102,90.588457268119895642 90.588457268119895642,102 29.411542731880104358,36 29.411542731880104358,108' />
    </g>
  </svg>
);
