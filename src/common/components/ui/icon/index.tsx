import {
  CaretRightIcon,
  FacebookLogoIcon,
  GearIcon,
  InstagramLogoIcon,
  MagnifyingGlassIcon,
  UserIcon,
  type IconProps,
} from "@phosphor-icons/react";

const REGISTRY = {
  "caret-right": CaretRightIcon,
  "facebook-logo": FacebookLogoIcon,
  gear: GearIcon,
  "instagram-logo": InstagramLogoIcon,
  "magnifying-glass": MagnifyingGlassIcon,
  user: UserIcon,
} as const;

export function Icon({ name, ...props }: Icon.Props) {
  const Component = REGISTRY[name];
  return <Component {...props} />;
}

export namespace Icon {
  export type Name = keyof typeof REGISTRY;
  export type Props = { name: Name } & IconProps;
}
