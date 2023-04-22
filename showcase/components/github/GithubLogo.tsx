'use client';

import GithubSVG from './github-logo.svg';
import { FC } from 'react';

export const GithubLogo: FC<{ className: string }> = ({ className }) => {
  const navigateToGithub = () => {
    window.open(
      'https://github.com/nataliebasille/natcore-design-system',
      '_blank'
    );
  };

  return <GithubSVG className={className} onClick={navigateToGithub} />;
};
