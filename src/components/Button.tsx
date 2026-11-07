import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react';

export type ButtonVariant = 'primary' | 'outline' | 'ghost';
export type ButtonSize = 'sm' | 'md';

const base =
  'inline-flex items-center justify-center gap-2 uppercase text-center transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-dark';

const variants: Record<ButtonVariant, string> = {
  primary: 'bg-stone-900 text-white hover:bg-stone-800',
  outline: 'border border-stone-300 text-stone-800 hover:border-stone-900',
  ghost: 'text-stone-600 hover:text-stone-900',
};

const sizes: Record<ButtonSize, string> = {
  sm: 'text-xs tracking-wider px-5 py-2.5',
  md: 'text-sm tracking-wider px-8 py-3.5',
};

export function buttonClass(
  variant: ButtonVariant = 'primary',
  size: ButtonSize = 'md',
  className = ''
): string {
  return [base, variants[variant], sizes[size], className].filter(Boolean).join(' ');
}

interface SharedProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  children?: ReactNode;
}

type ButtonAsButton = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className'> &
  SharedProps & { href?: undefined };

type ButtonAsLink = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'className'> &
  SharedProps & { href: string };

export type ButtonProps = ButtonAsButton | ButtonAsLink;

export function Button(props: ButtonProps) {
  if (props.href !== undefined) {
    const { variant = 'primary', size = 'md', className = '', ...rest } = props;
    return <a {...rest} className={buttonClass(variant, size, className)} />;
  }
  const { variant = 'primary', size = 'md', className = '', ...rest } = props;
  return <button {...rest} className={buttonClass(variant, size, className)} />;
}
