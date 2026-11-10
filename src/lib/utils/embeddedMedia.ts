import { parse, renderSync, type Node } from 'ultrahtml';

interface MediaElement {
  name?: string;
  attributes?: Record<string, string | boolean>;
  children?: MediaElement[];
}

const NONE = '';
const ASPECT_RATIO_ATTRIBUTE = 'data-aspect-ratio';

function dimensionAttribute(value: string | boolean | undefined): number | null {
  if (typeof value !== 'string') return null;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

function reserveImageSpace(element: MediaElement): void {
  const attributes = element.attributes ?? {};

  const width = dimensionAttribute(attributes.width);
  const height = dimensionAttribute(attributes.height);

  if (width && height) {
    attributes[ASPECT_RATIO_ATTRIBUTE] = `${width}/${height}`;
  }

  if (attributes.loading === undefined) {
    attributes.loading = 'lazy';
  }

  if (attributes.decoding === undefined) {
    attributes.decoding = 'async';
  }

  element.attributes = attributes;
}

function reserveFrameSpace(element: MediaElement): void {
  const attributes = element.attributes ?? {};

  const width = dimensionAttribute(attributes.width) ?? 16;
  const height = dimensionAttribute(attributes.height) ?? 9;
  attributes[ASPECT_RATIO_ATTRIBUTE] = `${width}/${height}`;

  if (attributes.loading === undefined) {
    attributes.loading = 'lazy';
  }

  element.attributes = attributes;
}

function reserveMediaSpace(node: MediaElement): void {
  const children = node.children ?? [];
  for (const child of children) {
    if (child.name === 'img') reserveImageSpace(child);
    if (child.name === 'iframe') reserveFrameSpace(child);
    reserveMediaSpace(child);
  }
}

export function reserveEmbeddedMediaSpace(rawHtml: string): string {
  if (!rawHtml || typeof rawHtml !== 'string') {
    return NONE;
  }

  if (!/<(?:img|iframe)[\s>]/i.test(rawHtml)) {
    return rawHtml;
  }

  const document = parse(rawHtml) as Node;
  reserveMediaSpace(document as MediaElement);
  return renderSync(document);
}
