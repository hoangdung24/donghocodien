import React from 'react';
import { Accordion } from '@ark-ui/react/accordion';
import { ChevronDown, ShieldCheck, Clock, RefreshCw } from 'lucide-react';

interface WatchSpecsProps {
  descriptionHtml: string;
  sku?: string;
}

export function WatchSpecs({ descriptionHtml, sku }: WatchSpecsProps) {
  return (
    <Accordion.Root
      defaultValue={['specs', 'authenticity']}
      multiple
      className="w-full divide-y divide-stone-200 border-t border-b border-stone-200 my-8"
    >
      <Accordion.Item value="specs" className="py-4">
        <Accordion.ItemTrigger className="flex w-full items-center justify-between text-left group cursor-pointer">
          <span className="font-serif text-lg tracking-wide text-stone-900 group-hover:text-black transition-colors flex items-center gap-2">
            <Clock className="w-4 h-4 text-stone-500" />
            Technical Specifications &amp; Details
          </span>
          <Accordion.ItemIndicator>
            <ChevronDown className="w-4 h-4 text-stone-500 transition-transform duration-300 data-[state=open]:rotate-180" />
          </Accordion.ItemIndicator>
        </Accordion.ItemTrigger>
        <Accordion.ItemContent className="pt-4 text-sm text-stone-700 leading-relaxed font-sans">
          {sku && (
            <p className="mb-3 text-xs uppercase tracking-widest text-stone-500">
              Reference / SKU: <span className="font-mono text-stone-800">{sku}</span>
            </p>
          )}
          <div
            className="prose prose-stone prose-sm max-w-none [&_table]:w-full [&_table]:border-collapse [&_td]:py-2 [&_td]:border-b [&_td]:border-stone-100 [&_td:first-child]:font-medium [&_td:first-child]:text-stone-900 [&_td:first-child]:w-1/3"
            dangerouslySetInnerHTML={{ __html: descriptionHtml }}
          />
        </Accordion.ItemContent>
      </Accordion.Item>

      <Accordion.Item value="authenticity" className="py-4">
        <Accordion.ItemTrigger className="flex w-full items-center justify-between text-left group cursor-pointer">
          <span className="font-serif text-lg tracking-wide text-stone-900 group-hover:text-black transition-colors flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-stone-500" />
            Authenticity &amp; Mechanical Warranty
          </span>
          <Accordion.ItemIndicator>
            <ChevronDown className="w-4 h-4 text-stone-500 transition-transform duration-300 data-[state=open]:rotate-180" />
          </Accordion.ItemIndicator>
        </Accordion.ItemTrigger>
        <Accordion.ItemContent className="pt-3 text-sm text-stone-600 leading-relaxed space-y-2">
          <p>
            Every timepiece at <strong>Dong Ho Co Dien</strong> is rigorously inspected, authenticated, and verified for mechanical health prior to being offered to international collectors.
          </p>
          <ul className="list-disc pl-5 space-y-1 text-xs text-stone-600">
            <li>Guaranteed 100% authentic and original components for life.</li>
            <li>Fully demagnetized, timed, and serviced by master watchmakers.</li>
            <li>Complimentary mechanical warranty included.</li>
          </ul>
        </Accordion.ItemContent>
      </Accordion.Item>

      <Accordion.Item value="shipping" className="py-4">
        <Accordion.ItemTrigger className="flex w-full items-center justify-between text-left group cursor-pointer">
          <span className="font-serif text-lg tracking-wide text-stone-900 group-hover:text-black transition-colors flex items-center gap-2">
            <RefreshCw className="w-4 h-4 text-stone-500" />
            Worldwide Express Shipping &amp; Returns
          </span>
          <Accordion.ItemIndicator>
            <ChevronDown className="w-4 h-4 text-stone-500 transition-transform duration-300 data-[state=open]:rotate-180" />
          </Accordion.ItemIndicator>
        </Accordion.ItemTrigger>
        <Accordion.ItemContent className="pt-3 text-sm text-stone-600 leading-relaxed">
          <p>
            We ship globally via FedEx International Priority / DHL Express with full insurance coverage. All packages require adult signature upon delivery. We provide a 7-day inspection period upon receipt.
          </p>
        </Accordion.ItemContent>
      </Accordion.Item>
    </Accordion.Root>
  );
}
