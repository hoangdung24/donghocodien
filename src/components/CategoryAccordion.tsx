import { Accordion } from "@ark-ui/react/accordion";
import { ChevronDown } from "lucide-react";
import type { CategoryGroup } from "../lib/utils/categories";

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
    <Accordion.Root multiple defaultValue={activeValues} className="space-y-1">
      {groups.map((group) => (
        <Accordion.Item key={group.parent.id} value={group.parent.slug}>
          <div className="flex items-center justify-between">
            <a
              href={`/shop?category=${group.parent.id}${search ? `&search=${search}` : ""}`}
              className="text-[11px] uppercase tracking-wider font-bold text-black hover:text-black transition-colors py-1.5 px-2"
            >
              {group.parent.displayName}
            </a>
            <Accordion.ItemTrigger
              className="flex-1 justify-end p-1.5 text-stone-600 hover:text-black transition-colors min-w-[44px] min-h-[44px] flex items-center -ml-2"
              aria-label={`Toggle ${group.parent.displayName} subcategories`}
            >
              <Accordion.ItemIndicator className="w-4 h-4">
                <ChevronDown className="w-4 h-4 transition-transform duration-200" />
              </Accordion.ItemIndicator>
            </Accordion.ItemTrigger>
          </div>
          <Accordion.ItemContent className="overflow-hidden">
            <div className="space-y-1 pl-2 pt-1">
              {group.children.map((c) => (
                <a
                  key={c.id}
                  href={`/shop?category=${c.id}${search ? `&search=${search}` : ""}`}
                  className={`block text-[11px] uppercase tracking-wider border-l-2 border-transparent pl-3 py-1.5 transition-colors ${
                    activeCategoryId === c.id
                      ? "border-black bg-stone-50 font-bold text-black"
                      : "border-transparent bg-transparent text-stone-600 hover:bg-stone-50"
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
