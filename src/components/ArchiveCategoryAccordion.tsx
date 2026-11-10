import { Accordion } from '@ark-ui/react/accordion';
import { ChevronDown } from 'lucide-react';
import { categoryHref } from '@/lib/utils/categories';

interface ArchiveCategoryGroup {
  parent: { id: number; slug: string; displayName: string };
  children: { id: number; slug: string; displayName: string }[];
}

interface ArchiveCategoryAccordionProps {
  groups: ArchiveCategoryGroup[];
  activeCategoryId?: number;
  search?: string;
  basePath: string;
}

export function ArchiveCategoryAccordion({
  groups,
  activeCategoryId,
  search,
  basePath,
}: ArchiveCategoryAccordionProps) {
  const activeValues = groups
    .flatMap((group) => {
      const isActiveParent = activeCategoryId === group.parent.id;
      const isActiveChild = group.children.some((category) => category.id === activeCategoryId);
      if (isActiveParent || isActiveChild) {
        return [
          group.parent.slug,
          ...group.children
            .filter((category) => category.id === activeCategoryId)
            .map((category) => String(category.id)),
        ];
      }
      return [];
    })
    .filter(Boolean);

  return (
    <Accordion.Root
      multiple
      defaultValue={activeValues}
      className='flex flex-col gap-1'
      aria-label='Filter by category'
    >
      {groups.map((group) => (
        <Accordion.Item key={group.parent.id} value={group.parent.slug}>
          <div className='flex items-center justify-between'>
            <a
              href={categoryHref(group.parent.slug, search, basePath)}
              aria-current={activeCategoryId === group.parent.id ? 'page' : undefined}
              className='py-1.5 text-[11px] font-bold tracking-wider uppercase'
            >
              {group.parent.displayName}
            </a>
            <Accordion.ItemTrigger
              className='flex min-h-11 min-w-11 flex-1 items-center justify-end text-stone-600 transition-colors hover:text-brand-dark'
              aria-label={`Show ${group.parent.displayName} categories`}
            >
              <Accordion.ItemIndicator className='h-4 w-4'>
                <ChevronDown
                  className='h-4 w-4 transition-transform duration-200'
                  aria-hidden='true'
                />
              </Accordion.ItemIndicator>
            </Accordion.ItemTrigger>
          </div>
          <Accordion.ItemContent className='overflow-hidden'>
            <div className='flex flex-col gap-1 pt-1 pl-2'>
              {group.children.map((category) => (
                <a
                  key={category.id}
                  href={categoryHref(category.slug, search, basePath)}
                  aria-current={activeCategoryId === category.id ? 'page' : undefined}
                  className={`block border-l-2 border-transparent py-2 pl-3 text-[11px] tracking-wider uppercase transition-colors ${
                    activeCategoryId === category.id
                      ? 'border-brand-dark bg-stone-50 font-bold'
                      : 'border-transparent bg-transparent text-stone-600 hover:bg-stone-50'
                  }`}
                >
                  {category.displayName}
                </a>
              ))}
            </div>
          </Accordion.ItemContent>
        </Accordion.Item>
      ))}
    </Accordion.Root>
  );
}
