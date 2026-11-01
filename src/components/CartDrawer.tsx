import React, { useState } from 'react';
import { Dialog } from '@ark-ui/react/dialog';
import { ShoppingBag, X, MessageCircle, Phone, ArrowRight } from 'lucide-react';
import type { Product } from '../schema/product';

interface CartDrawerProps {
  product?: Product;
}

export function CartDrawer({ product }: CartDrawerProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog.Root open={open} onOpenChange={(e) => setOpen(e.open)}>
      <Dialog.Trigger className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-stone-900 text-stone-50 font-serif text-sm tracking-widest uppercase hover:bg-stone-800 transition-colors shadow-sm cursor-pointer">
        <ShoppingBag className="w-4 h-4" />
        Liên hệ sở hữu / Đặt hàng
      </Dialog.Trigger>

      <Dialog.Backdrop className="fixed inset-0 bg-stone-950/40 backdrop-blur-xs z-50 transition-opacity" />

      <Dialog.Positioner className="fixed inset-y-0 right-0 z-50 w-full max-w-md flex">
        <Dialog.Content className="w-full bg-white h-full shadow-2xl flex flex-col border-l border-stone-200 p-6 overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-stone-200">
            <Dialog.Title className="font-serif text-xl text-stone-900">
              Yêu cầu tư vấn & Đặt hàng
            </Dialog.Title>
            <Dialog.CloseTrigger className="p-2 text-stone-400 hover:text-stone-800 rounded-full transition-colors">
              <X className="w-5 h-5" />
            </Dialog.CloseTrigger>
          </div>

          <Dialog.Description className="text-xs text-stone-500 mt-2">
            Đồng Hồ Cổ Điển — Chuyên gia sưu tập đồng hồ cổ Thụy Sỹ & Nhật Bản.
          </Dialog.Description>

          {/* Product Summary */}
          {product && (
            <div className="my-6 p-4 bg-stone-50 border border-stone-200 flex gap-4 items-center">
              {product.images[0] && (
                <img
                  src={product.images[0].thumbnail || product.images[0].src}
                  alt={product.name}
                  className="w-16 h-20 object-cover border border-stone-200"
                />
              )}
              <div className="flex-1 min-w-0">
                <p className="font-serif text-sm font-medium text-stone-900 truncate">
                  {product.name}
                </p>
                <p className="text-sm font-semibold text-amber-900 mt-1">
                  {product.prices.price} {product.prices.currency_symbol}
                </p>
                {product.sku && (
                  <p className="text-xs text-stone-400 mt-0.5">SKU: {product.sku}</p>
                )}
              </div>
            </div>
          )}

          {/* Direct channels */}
          <div className="space-y-3 my-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-stone-500">
              Kênh liên hệ trực tiếp nhanh:
            </p>
            <a
              href={`https://zalo.me/0901234567?text=${encodeURIComponent(
                product ? `Tôi quan tâm đến: ${product.name} (${product.permalink})` : 'Tôi muốn được tư vấn đồng hồ cổ điển'
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between w-full px-4 py-3 bg-blue-600 text-white font-medium text-sm rounded-none hover:bg-blue-700 transition-colors"
            >
              <span className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4" />
                Chat nhanh qua Zalo
              </span>
              <ArrowRight className="w-4 h-4" />
            </a>

            <a
              href="tel:0901234567"
              className="flex items-center justify-between w-full px-4 py-3 border border-stone-300 text-stone-800 font-medium text-sm hover:bg-stone-50 transition-colors"
            >
              <span className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                Gọi Hotline tư vấn
              </span>
              <span className="font-mono text-xs text-stone-500">090 123 4567</span>
            </a>
          </div>

          {/* Quick inquiry form */}
          <form className="mt-4 pt-4 border-t border-stone-200 space-y-3 flex-1" onSubmit={(e) => e.preventDefault()}>
            <p className="text-xs font-semibold uppercase tracking-wider text-stone-500">
              Hoặc để lại số điện thoại:
            </p>
            <div>
              <label className="block text-xs text-stone-600 mb-1">Họ tên của bạn</label>
              <input
                type="text"
                placeholder="Nguyễn Văn A"
                className="w-full px-3 py-2 text-sm border border-stone-300 focus:outline-none focus:border-stone-900"
              />
            </div>
            <div>
              <label className="block text-xs text-stone-600 mb-1">Số điện thoại</label>
              <input
                type="tel"
                placeholder="0912 345 678"
                className="w-full px-3 py-2 text-sm border border-stone-300 focus:outline-none focus:border-stone-900"
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 bg-stone-900 text-white font-serif text-sm tracking-wider uppercase hover:bg-stone-800 transition-colors"
            >
              Gửi thông tin tư vấn
            </button>
          </form>
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  );
}
