export interface MegaMenuLink {
  label: string;
  href: string;
}

export interface MegaMenuGroup {
  title: string;
  href: string;
  items: MegaMenuLink[];
}

export const MEGA_MENU_GROUPS: MegaMenuGroup[] = [
  {
    title: 'MARKET SEGMENT',
    href: '/watches?category=market-segment',
    items: [
      { label: 'Rare & Collectible', href: '/watches?category=rare-collectible' },
      { label: 'Super Premium', href: '/watches?category=super-premium' },
      { label: 'Premium', href: '/watches?category=premium' },
      { label: 'Fashion', href: '/watches?category=fashion' },
      { label: 'Affordable', href: '/watches?category=affordalbe' },
    ],
  },
  {
    title: 'GENDER',
    href: '/watches?category=gender',
    items: [
      { label: 'Unisex', href: '/watches?category=unisex' },
      { label: 'Male', href: '/watches?category=male' },
      { label: 'Female', href: '/watches?category=female' },
    ],
  },
  {
    title: 'BRAND',
    href: '/watches?category=brand',
    items: [
      { label: 'Patek Philippe', href: '/watches?category=patek-philippe' },
      { label: 'Rolex', href: '/watches?category=rolex' },
      { label: 'Omega', href: '/watches?category=omega' },
      { label: 'Cartier', href: '/watches?category=cartier' },
    ],
  },
  {
    title: 'MOVEMENT',
    href: '/watches?category=movement',
    items: [
      { label: 'Automatic', href: '/watches?category=automatic' },
      { label: 'Hand Wind', href: '/watches?category=hand-wound' },
      { label: 'Quartz', href: '/watches?category=quartz' },
    ],
  },
  {
    title: 'SIZE',
    href: '/watches?category=size',
    items: [
      { label: '20 – 30 mm', href: '/watches?category=20-30-mm' },
      { label: '30 – 40 mm', href: '/watches?category=30-40-mm' },
    ],
  },
  {
    title: 'WATCH FEATURES',
    href: '/watches?category=watch-features',
    items: [
      { label: 'Time-Only', href: '/watches?category=time-only' },
      { label: 'Chronograph', href: '/watches?category=chronograph' },
      { label: 'Calendar', href: '/watches?category=calendar' },
      { label: 'Moon Phase', href: '/watches?category=moon-phase' },
      { label: 'Sun & Moon', href: '/watches?category=sun-moon' },
    ],
  },
];

export const megaMenuData = MEGA_MENU_GROUPS;

export const MEGA_MENU_CATEGORY_SLUGS: string[] = [
  ...new Set(
    MEGA_MENU_GROUPS.flatMap((group) => [
      ...group.items.map((item) =>
        new URL(`https://local${item.href}`).searchParams.get('category')
      ),
      new URL(`https://local${group.href}`).searchParams.get('category'),
    ]).filter((slug): slug is string => Boolean(slug))
  ),
];
