export type TNavigation = {
  name: string;
  href: string;
  icon?: string;
  children?: TNavigation[];
  roles?: string[]; // omit = visible to every logged-in role
};

export type TOption = {
  label: string;
  value: string;
};
