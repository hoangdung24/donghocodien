export interface HeroSlide {
  id: string;
  image: string;
  title: string;
  link: string;
  alt: string;
}

export const HERO_AUTOPLAY_DELAY_MS = 5500;

export const HERO_SLIDES: readonly HeroSlide[] = [
  {
    id: 'patek-philippe',
    image: '/images/hero/hero-patek-3940j',
    title: 'Patek Philippe has always been a legend in the world of watchmaking',
    link: '/watches?category=patek-philippe',
    alt: 'Patek Philippe Perpetual Calendar 3940J',
  },
  {
    id: 'rolex',
    image: '/images/hero/hero-rolex-1601.jpg',
    title: 'Vintage Rolex timepieces always carry a unique allure',
    link: '/watches?category=rolex',
    alt: 'Vintage Rolex Datejust 1601',
  },
  {
    id: 'omega',
    image: '/images/hero/hero-omega-speedmaster.jpg',
    title: 'A trusted place where you can find authentic vintage Omega watches',
    link: '/watches?category=omega',
    alt: 'Omega Speedmaster Professional',
  },
  {
    id: 'cartier',
    image: '/images/hero/hero-cartier-3170.jpg',
    title: 'Cartier has always left a lasting impression in the hearts of collectors',
    link: '/watches?category=cartier',
    alt: 'Cartier Tank Vintage Collection',
  },
];

export const HERO_MEDIA_QUERY = '(max-width: 639px)';

export const HERO_SIZES = '100vw';
