import { Accordion } from '@ark-ui/react/accordion';
import { ChevronDown } from 'lucide-react';
import type { CategoryGroup } from '../lib/utils/categories';

interface CategoryAccordionProps {
  groups: CategoryGroup[];
  activeCategoryId?: number;
  search?: string;
}

export function CategoryAccordion({ groups, activeCategoryId, search }: CategoryAccordionProps) {
  const activeValues = groups
    .flatMap((group) => {
      const isActiveParent = activeCategoryId === group.parent.id;
      const isActiveChild = group.children.some((c) => c.id === activeCategoryId);
      if (isActiveParent || isActiveChild) {
        return [
          group.parent.slug,
          ...group.children.filter((c) => c.id === activeCategoryId).map((c) => String(c.id)),
        ];
      }
      return [];
    })
    .filter(Boolean);

  return (
    <Accordion.Root multiple defaultValue={activeValues} className='space-y-1'>
      {groups.map((group) => (
        <Accordion.Item key={group.parent.id} value={group.parent.slug}>
          <div className='flex items-center justify-between'>
            <a
              href={`/shop?category=${group.parent.id}${search ? `&search=${search}` : ''}`}
              className='px-2 py-1.5 text-[11px] font-bold tracking-wider text-black uppercase transition-colors hover:text-black'
            >
              {group.parent.displayName}
            </a>
            <Accordion.ItemTrigger
              className='-ml-2 flex min-h-[44px] min-w-[44px] flex-1 items-center justify-end p-1.5 text-stone-600 transition-colors hover:text-black'
              aria-label={`Toggle ${group.parent.displayName} subcategories`}
            >
              <Accordion.ItemIndicator className='h-4 w-4'>
                <ChevronDown className='h-4 w-4 transition-transform duration-200' />
              </Accordion.ItemIndicator>
            </Accordion.ItemTrigger>
          </div>
          <Accordion.ItemContent className='overflow-hidden'>
            <div className='space-y-1 pt-1 pl-2'>
              {group.children.map((c) => (
                <a
                  key={c.id}
                  href={`/shop?category=${c.id}${search ? `&search=${search}` : ''}`}
                  className={`block border-l-2 border-transparent py-1.5 pl-3 text-[11px] tracking-wider uppercase transition-colors ${
                    activeCategoryId === c.id
                      ? 'border-black bg-stone-50 font-bold text-black'
                      : 'border-transparent bg-transparent text-stone-600 hover:bg-stone-50'
                  }`}
                >
                  {c.displayName}
                </a>
              ))}
            </div>
          </Accordion.ItemContent>
        </Accordion.Item>
      ))}
    </Accordion.Root>
  );
}
