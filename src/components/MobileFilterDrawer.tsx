import { Dialog } from '@ark-ui/react/dialog';
import { Portal } from '@ark-ui/react/portal';
import { ChevronDown, SlidersHorizontal, X } from 'lucide-react';
import { useEffect, useState, type ReactNode } from 'react';

interface MobileFilterDrawerProps {
  resultCount: number;
  resultLabel?: string;
  clearHref?: string;
  searchBox?: ReactNode;
  categoryAccordion?: ReactNode;
  priceRangeSlider?: ReactNode;
}

const FILTER_PARAMS = ['category', 'status', 'search', 'min_price', 'max_price'];

export function MobileFilterDrawer({
  resultCount,
  resultLabel,
  clearHref = '/watches',
  searchBox,
  categoryAccordion,
  priceRangeSlider,
}: MobileFilterDrawerProps) {
  const [filtersApplied, setFiltersApplied] = useState(false);
  const [priceExpanded, setPriceExpanded] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setFiltersApplied(FILTER_PARAMS.some((key) => params.has(key)));
  }, []);

  return (
    <div className='mb-6 border-y border-stone-200 py-3 sm:mb-8 lg:hidden'>
      <div className='flex items-center justify-between gap-4'>
        <span className='font-sans text-xs tracking-widest text-stone-500 uppercase'>
          {resultCount} {resultLabel ?? (resultCount === 1 ? 'timepiece' : 'timepieces')}
        </span>

        <Dialog.Root>
          <Dialog.Trigger className='flex cursor-pointer items-center gap-2 border border-stone-300 px-5 py-2.5 text-xs tracking-widest uppercase transition-colors hover:bg-stone-100'>
            <SlidersHorizontal className='h-4 w-4' />
            Filter
          </Dialog.Trigger>

          <Portal>
            <Dialog.Backdrop className='fixed inset-0 z-50 bg-black/40 backdrop-blur-xs data-[state=open]:animate-fade-in' />

            <Dialog.Positioner className='fixed inset-y-0 right-0 z-50 flex w-full max-w-sm'>
              <Dialog.Content className='relative flex h-full w-full flex-col border-l border-stone-200 bg-white shadow-2xl data-[state=closed]:animate-slide-out-right data-[state=open]:animate-slide-in-right'>
                <div className='flex items-center justify-between border-b border-stone-200 p-6 pb-4'>
                  <Dialog.Title className='font-serif text-xl'>Filter Timepieces</Dialog.Title>
                  <Dialog.CloseTrigger className='cursor-pointer p-2 text-stone-400 transition-all duration-200 hover:bg-stone-100 hover:text-brand-dark'>
                    <X className='h-5 w-5' />
                  </Dialog.CloseTrigger>
                </div>

                <div className='flex flex-1 flex-col gap-4 overflow-y-auto p-6'>
                  {searchBox}

                  <section>{categoryAccordion}</section>

                  {priceRangeSlider && (
                    <div className='flex flex-col gap-5'>
                      <button
                        type='button'
                        onClick={() => setPriceExpanded((expanded) => !expanded)}
                        aria-expanded={priceExpanded}
                        className='m-0 flex w-full cursor-pointer items-center justify-between text-[11px] font-bold tracking-wider uppercase'
                      >
                        Price
                        <ChevronDown
                          className={`h-4 w-4 transition-transform duration-200 ${
                            priceExpanded ? 'rotate-180' : ''
                          }`}
                        />
                      </button>
                      <div className={priceExpanded ? 'block' : 'hidden'}>{priceRangeSlider}</div>
                    </div>
                  )}
                </div>

                <div className='flex items-center gap-3 border-t border-stone-200 p-6 pt-4'>
                  {filtersApplied && (
                    <a
                      href={clearHref}
                      className='flex-1 border border-stone-300 px-5 py-3 text-center text-xs tracking-widest uppercase transition-colors hover:bg-stone-100'
                    >
                      Clear
                    </a>
                  )}
                  <Dialog.CloseTrigger className='flex-1 cursor-pointer bg-brand-dark px-5 py-3 text-xs tracking-widest text-white uppercase transition-colors hover:bg-stone-700'>
                    Done
                  </Dialog.CloseTrigger>
                </div>
              </Dialog.Content>
            </Dialog.Positioner>
          </Portal>
        </Dialog.Root>
      </div>
    </div>
  );
}
