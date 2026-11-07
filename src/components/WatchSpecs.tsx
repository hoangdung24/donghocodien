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
      className='my-8 w-full divide-y divide-stone-200 border-t border-b border-stone-200'
    >
      <Accordion.Item value='specs' className='py-4'>
        <Accordion.ItemTrigger className='group flex w-full cursor-pointer items-center justify-between text-left'>
          <span className='flex items-center gap-2 text-lg tracking-wide text-stone-900 transition-colors group-hover:text-brand-dark'>
            <Clock className='h-4 w-4 text-stone-500' aria-hidden='true' />
            Technical Specifications &amp; Details
          </span>
          <Accordion.ItemIndicator>
            <ChevronDown
              className='h-4 w-4 text-stone-500 transition-transform duration-300 data-[state=open]:rotate-180'
              aria-hidden='true'
            />
          </Accordion.ItemIndicator>
        </Accordion.ItemTrigger>
        <Accordion.ItemContent className='pt-4 font-sans text-sm leading-relaxed text-stone-700'>
          {sku && (
            <p className='mb-3 text-xs tracking-widest text-stone-500 uppercase'>
              Reference / SKU: <span className='font-mono text-stone-800'>{sku}</span>
            </p>
          )}
          <div
            className='prose prose-sm max-w-none prose-stone [&_table]:w-full [&_table]:border-collapse [&_td]:border-b [&_td]:border-stone-100 [&_td]:py-2 [&_td:first-child]:w-1/3 [&_td:first-child]:font-medium [&_td:first-child]:text-stone-900'
            dangerouslySetInnerHTML={{ __html: descriptionHtml }}
          />
        </Accordion.ItemContent>
      </Accordion.Item>

      <Accordion.Item value='authenticity' className='py-4'>
        <Accordion.ItemTrigger className='group flex w-full cursor-pointer items-center justify-between text-left'>
          <span className='flex items-center gap-2 text-lg tracking-wide text-stone-900 transition-colors group-hover:text-brand-dark'>
            <ShieldCheck className='h-4 w-4 text-stone-500' aria-hidden='true' />
            Authenticity &amp; Mechanical Warranty
          </span>
          <Accordion.ItemIndicator>
            <ChevronDown
              className='h-4 w-4 text-stone-500 transition-transform duration-300 data-[state=open]:rotate-180'
              aria-hidden='true'
            />
          </Accordion.ItemIndicator>
        </Accordion.ItemTrigger>
        <Accordion.ItemContent className='flex flex-col gap-2 pt-3 text-sm leading-relaxed text-stone-600'>
          <p>
            Every timepiece at <strong>Dong Ho Co Dien</strong> is rigorously inspected,
            authenticated, and verified for mechanical health prior to being offered to
            international collectors.
          </p>
          <ul className='flex list-disc flex-col gap-1 pl-5 text-xs text-stone-600'>
            <li>Guaranteed 100% authentic and original components for life.</li>
            <li>Fully demagnetized, timed, and serviced by master watchmakers.</li>
            <li>Complimentary mechanical warranty included.</li>
          </ul>
        </Accordion.ItemContent>
      </Accordion.Item>

      <Accordion.Item value='shipping' className='py-4'>
        <Accordion.ItemTrigger className='group flex w-full cursor-pointer items-center justify-between text-left'>
          <span className='flex items-center gap-2 text-lg tracking-wide text-stone-900 transition-colors group-hover:text-brand-dark'>
            <RefreshCw className='h-4 w-4 text-stone-500' aria-hidden='true' />
            Worldwide Express Shipping &amp; Returns
          </span>
          <Accordion.ItemIndicator>
            <ChevronDown
              className='h-4 w-4 text-stone-500 transition-transform duration-300 data-[state=open]:rotate-180'
              aria-hidden='true'
            />
          </Accordion.ItemIndicator>
        </Accordion.ItemTrigger>
        <Accordion.ItemContent className='pt-3 text-sm leading-relaxed text-stone-600'>
          <p>
            We ship globally via FedEx International Priority / DHL Express with full insurance
            coverage. All packages require adult signature upon delivery. We provide a 7-day
            inspection period upon receipt.
          </p>
        </Accordion.ItemContent>
      </Accordion.Item>
    </Accordion.Root>
  );
}
