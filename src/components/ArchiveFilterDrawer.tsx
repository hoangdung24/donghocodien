import { Dialog } from '@ark-ui/react/dialog';
import { Portal } from '@ark-ui/react/portal';
import { ChevronDown, Search, SlidersHorizontal, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { categoryHref } from '@/lib/utils/categories';

interface ArchiveFilterGroup {
  parent: { id: number; slug: string; displayName: string };
  children: { id: number; slug: string; displayName: string }[];
}

interface ArchiveFilterDrawerProps {
  resultCount: number;
  resultLabel: string;
  clearHref: string;
  searchId: string;
  searchValue: string;
  searchHref: string;
  activeCategorySlug?: string;
  activeCategoryId?: number;
  groups: ArchiveFilterGroup[];
}

const FILTER_PARAMS = ['category', 'search'];

export function ArchiveFilterDrawer({
  resultCount,
  resultLabel,
  clearHref,
  searchId,
  searchValue,
  searchHref,
  activeCategorySlug,
  activeCategoryId,
  groups,
}: ArchiveFilterDrawerProps) {
  const [filtersApplied, setFiltersApplied] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setFiltersApplied(FILTER_PARAMS.some((key) => params.has(key)));
  }, []);

  return (
    <div className='mb-6 border-y border-stone-200 py-3 sm:mb-8 lg:hidden'>
      <div className='flex items-center justify-between gap-4'>
        <p role='status' className='font-sans text-xs tracking-widest text-stone-500 uppercase'>
          {resultCount} {resultLabel}
        </p>

        <Dialog.Root>
          <Dialog.Trigger className='flex min-h-11 cursor-pointer items-center gap-2 border border-stone-300 px-5 py-2.5 text-xs tracking-widest uppercase transition-colors hover:bg-stone-100'>
            <SlidersHorizontal className='h-4 w-4' aria-hidden='true' />
            Filter
          </Dialog.Trigger>

          <Portal>
            <Dialog.Backdrop className='fixed inset-0 z-50 bg-black/40 backdrop-blur-xs data-[state=open]:animate-fade-in' />

            <Dialog.Positioner className='fixed inset-y-0 right-0 z-50 flex w-full max-w-sm'>
              <Dialog.Content className='relative flex h-full w-full flex-col border-l border-stone-200 bg-white shadow-2xl data-[state=closed]:animate-slide-out-right data-[state=open]:animate-slide-in-right'>
                <div className='flex items-center justify-between border-b border-stone-200 p-6 pb-4'>
                  <Dialog.Title className='font-serif text-xl'>Filter Archive</Dialog.Title>
                  <Dialog.CloseTrigger
                    aria-label='Close filters'
                    className='flex h-11 w-11 cursor-pointer items-center justify-center p-2 text-stone-600 transition-all duration-200 hover:bg-stone-100 hover:text-brand-dark'
                  >
                    <X className='h-5 w-5' aria-hidden='true' />
                  </Dialog.CloseTrigger>
                </div>

                <div className='flex flex-1 flex-col gap-4 overflow-y-auto p-6'>
                  <form action={searchHref} method='GET' role='search' aria-label='Search watches'>
                    {activeCategorySlug && (
                      <input type='hidden' name='category' value={activeCategorySlug} />
                    )}
                    <label htmlFor={searchId} className='sr-only'>
                      Search watches
                    </label>
                    <div className='flex items-stretch border border-brand-dark bg-stone-50 transition-colors focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-brand-dark'>
                      <input
                        type='search'
                        name='search'
                        id={searchId}
                        defaultValue={searchValue}
                        placeholder='Search the archive…'
                        autoComplete='off'
                        className='min-w-0 flex-1 bg-transparent px-3 py-2.5 text-sm text-stone-900 placeholder-stone-400 focus-visible:outline-none'
                      />
                      <button
                        type='submit'
                        aria-label='Search'
                        className='flex w-11 shrink-0 cursor-pointer items-center justify-center bg-brand-dark text-white transition-colors hover:bg-stone-700'
                      >
                        <Search className='h-4 w-4' aria-hidden='true' />
                      </button>
                    </div>
                  </form>

                  <section aria-label='Categories' className='flex flex-col gap-1'>
                    {groups.map((group) => (
                      <div key={group.parent.id}>
                        <details className='group/category'>
                          <summary className='flex min-h-11 cursor-pointer list-none items-center justify-between'>
                            <a
                              href={categoryHref(group.parent.slug, searchValue, searchHref)}
                              aria-current={
                                activeCategoryId === group.parent.id ? 'page' : undefined
                              }
                              className='py-1.5 text-[11px] font-bold tracking-wider uppercase'
                            >
                              {group.parent.displayName}
                            </a>
                            <ChevronDown
                              className='h-4 w-4 text-stone-600 transition-transform duration-200 group-open/category:rotate-180'
                              aria-hidden='true'
                            />
                          </summary>
                          <div className='flex flex-col gap-1 pt-1 pl-2'>
                            {group.children.map((category) => (
                              <a
                                key={category.id}
                                href={categoryHref(category.slug, searchValue, searchHref)}
                                aria-current={activeCategoryId === category.id ? 'page' : undefined}
                                className={`block border-l-2 py-2 pl-3 text-[11px] tracking-wider uppercase transition-colors ${
                                  activeCategoryId === category.id
                                    ? 'border-brand-dark bg-stone-50 font-bold'
                                    : 'border-transparent bg-transparent text-stone-600 hover:bg-stone-50'
                                }`}
                              >
                                {category.displayName}
                              </a>
                            ))}
                          </div>
                        </details>
                      </div>
                    ))}
                  </section>
                </div>

                <div className='flex items-center gap-3 border-t border-stone-200 p-6 pt-4'>
                  {filtersApplied && (
                    <a
                      href={clearHref}
                      className='flex min-h-11 flex-1 items-center justify-center border border-stone-300 px-5 py-3 text-center text-xs tracking-widest uppercase transition-colors hover:bg-stone-100'
                    >
                      Clear
                    </a>
                  )}
                  <Dialog.CloseTrigger className='flex min-h-11 flex-1 cursor-pointer items-center justify-center bg-brand-dark px-5 py-3 text-xs tracking-widest text-white uppercase transition-colors hover:bg-stone-700'>
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
