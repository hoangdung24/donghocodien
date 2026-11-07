import { useApproxDisplay } from '@/lib/hooks/useApproxDisplay';
import { formatApproxPrice } from '@/lib/utils/currency';

interface ApproxPriceProps {
  usdPrice: string;
}

export function ApproxPrice({ usdPrice }: ApproxPriceProps) {
  const approx = useApproxDisplay();

  if (!approx) return null;

  return (
    <span className='approximate-vnd' data-usd-price={usdPrice} aria-hidden='true'>
      {formatApproxPrice(usdPrice, approx.currency, approx.rates)}
    </span>
  );
}
