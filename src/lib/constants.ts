// Site-wide owner / brand constants
export const SITE = {
  name: 'Spacetime',
  tagline: 'Vintage Watch',
  fullName: 'Spacetime - Vintage Watch',
  brand: 'Dong Ho Co Dien',
  description:
    'Curating rare, authentic vintage timepieces from Switzerland and Japan for global collectors.',
} as const;

export const CONTACT = {
  email: 'spacetime.donghocodien@gmail.com',
  whatsapp: '+84 94 162 5653',
  whatsappLink: 'https://wa.me/84941625653',
  phoneLink: 'tel:+84941625653',
  emailLink: 'mailto:spacetime.donghocodien@gmail.com',
  location: 'Ho Chi Minh City, Vietnam',
} as const;

export const SOCIAL = {
  facebook: 'https://www.facebook.com/spacetime.vintagewatch',
  instagram: 'https://www.instagram.com/spacetime.vintagewatch/',
} as const;

export const FOOTER_POLICY_LINKS = [
  {
    href: '/warranty-policy',
    featureTitle: '6 MONTHS WARRANTY',
    label: 'Warranty Policy',
  },
  {
    href: '/payment-shipping-methods',
    featureTitle: 'SHIPPING WORLDWIDE',
    label: 'Payment & Shipping Methods',
  },
  {
    href: '/exchange-policy',
    featureTitle: 'EXCHANGE POLICY',
    label: 'Exchange Policy',
  },
] as const;

export const FOOTER_SOCIAL_LINKS = [
  {
    href: SOCIAL.facebook,
    label: 'Facebook',
    icon: 'facebook',
    external: true,
  },
  {
    href: SOCIAL.instagram,
    label: 'Instagram',
    icon: 'instagram',
    external: true,
  },
  {
    href: CONTACT.emailLink,
    label: 'Send us an email',
    icon: 'email',
    external: false,
  },
  {
    href: CONTACT.phoneLink,
    label: 'Call us',
    icon: 'phone',
    external: true,
  },
] as const;

export const SEO = {
  defaultTitle: 'Spacetime - Vintage Watch | Authentic Swiss & Japanese Timepieces',
  defaultDescription:
    'Dong Ho Co Dien — Curating rare, authentic vintage timepieces from Switzerland and Japan for global collectors.',
  ogImage: 'https://donghocodien.com/wp-content/uploads/2025/09/ref-200246-1-1.jpg',
} as const;

export const COMPANY = {
  name: 'Spacetime Vintage Watch',
  legalName: 'Dong Ho Co Dien',
} as const;

export const BANK = {
  beneficiaryName: 'LY XUAN LOC',
  bankName: 'Vietnam Technological and Commercial Joint-stock Bank – Techcombank',
  bankAddress: '191 Ba Trieu Street, Hai Ba Trung District, Ha Noi, Vietnam',
  swiftCode: 'VTCBVNVX',
  branch: 'Techcombank Sai Gon',
  accountNumber: '8617868888',
  accountAddress: 'Mega Ruby Residence, Long Truong Ward, Ho Chi Minh city, Vietnam, 700000',
} as const;

export const REVOLUT = {
  appUrl: 'https://revolut.com/app/payments/send',
} as const;
