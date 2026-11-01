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
      {/* Specifications */}
      <Accordion.Item value="specs" className="py-4">
        <Accordion.ItemTrigger className="flex w-full items-center justify-between text-left group cursor-pointer">
          <span className="font-serif text-lg tracking-wide text-stone-900 group-hover:text-amber-800 transition-colors flex items-center gap-2">
            <Clock className="w-4 h-4 text-stone-500" />
            Thông số kỹ thuật & Chi tiết
          </span>
          <Accordion.ItemIndicator>
            <ChevronDown className="w-4 h-4 text-stone-500 transition-transform duration-300 data-[state=open]:rotate-180" />
          </Accordion.ItemIndicator>
        </Accordion.ItemTrigger>
        <Accordion.ItemContent className="pt-4 text-sm text-stone-700 leading-relaxed font-sans">
          {sku && (
            <p className="mb-3 text-xs uppercase tracking-widest text-stone-500">
              Mã sản phẩm (SKU): <span className="font-mono text-stone-800">{sku}</span>
            </p>
          )}
          {/* Render the WordPress spec table cleanly */}
          <div
            className="prose prose-stone prose-sm max-w-none [&_table]:w-full [&_table]:border-collapse [&_td]:py-2 [&_td]:border-b [&_td]:border-stone-100 [&_td:first-child]:font-medium [&_td:first-child]:text-stone-900 [&_td:first-child]:w-1/3"
            dangerouslySetInnerHTML={{ __html: descriptionHtml }}
          />
        </Accordion.ItemContent>
      </Accordion.Item>

      {/* Authenticity Guarantee */}
      <Accordion.Item value="authenticity" className="py-4">
        <Accordion.ItemTrigger className="flex w-full items-center justify-between text-left group cursor-pointer">
          <span className="font-serif text-lg tracking-wide text-stone-900 group-hover:text-amber-800 transition-colors flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-stone-500" />
            Cam kết chính hãng & Bảo hành
          </span>
          <Accordion.ItemIndicator>
            <ChevronDown className="w-4 h-4 text-stone-500 transition-transform duration-300 data-[state=open]:rotate-180" />
          </Accordion.ItemIndicator>
        </Accordion.ItemTrigger>
        <Accordion.ItemContent className="pt-3 text-sm text-stone-600 leading-relaxed space-y-2">
          <p>
            Mỗi chiếc đồng hồ tại <strong>Đồng Hồ Cổ Điển</strong> đều được tuyển chọn kỹ lưỡng, kiểm định cơ cấu máy móc và tính nguyên bản trước khi đến tay nhà sưu tầm.
          </p>
          <ul className="list-disc pl-5 space-y-1 text-xs text-stone-600">
            <li>Cam kết 100% nguyên bản chính hãng trọn đời.</li>
            <li>Bảo dưỡng, căn chỉnh sai số trước khi giao hàng.</li>
            <li>Bảo hành kỹ thuật từ 6 đến 12 tháng tùy dòng máy.</li>
          </ul>
        </Accordion.ItemContent>
      </Accordion.Item>

      {/* Shipping & Returns */}
      <Accordion.Item value="shipping" className="py-4">
        <Accordion.ItemTrigger className="flex w-full items-center justify-between text-left group cursor-pointer">
          <span className="font-serif text-lg tracking-wide text-stone-900 group-hover:text-amber-800 transition-colors flex items-center gap-2">
            <RefreshCw className="w-4 h-4 text-stone-500" />
            Giao hàng & Đổi trả
          </span>
          <Accordion.ItemIndicator>
            <ChevronDown className="w-4 h-4 text-stone-500 transition-transform duration-300 data-[state=open]:rotate-180" />
          </Accordion.ItemIndicator>
        </Accordion.ItemTrigger>
        <Accordion.ItemContent className="pt-3 text-sm text-stone-600 leading-relaxed">
          <p>
            Giao hàng hỏa tốc bảo hiểm toàn quốc. Quý khách được đồng kiểm tra hàng trước khi nhận. Hỗ trợ quay đầu và giao lưu nâng cấp dòng máy cho các nhà sưu tầm.
          </p>
        </Accordion.ItemContent>
      </Accordion.Item>
    </Accordion.Root>
  );
}
