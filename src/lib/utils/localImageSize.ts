import localImageDimensions from '@/lib/data/localImageDimensions.json';

export interface LocalImageSize {
  width: number;
  height: number;
}

export function localImageSize(source: string): LocalImageSize | undefined {
  const sizes: Record<string, LocalImageSize> = localImageDimensions;
  return sizes[source];
}
