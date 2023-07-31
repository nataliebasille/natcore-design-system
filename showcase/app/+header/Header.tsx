import { GithubLogo } from "./GithubLogo";
import { MenuIcon } from "./MenuIcon";

export const Header = () => {
  return (
    <div className="flex h-12">
      <MenuIcon className="md:hidden" />
      <GithubLogo className="ml-auto" />
    </div>
  );
};
