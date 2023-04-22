import { GithubLogo } from '../github/GithubLogo';
import { MenuIcon } from './MenuIcon';

export const Header = () => {
  return (
    <div className='flex h-8'>
      <MenuIcon className='md:hidden' />
      <GithubLogo className='ml-auto' />
    </div>
  );
};
