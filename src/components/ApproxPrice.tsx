import { useApproxDisplay } from '@/lib/hooks/useApproxDisplay';
import { formatApproxPrice } from '@/lib/utils/currency';
import { approxPriceReserve } from '@/lib/utils/approxPriceReserve';

interface ApproxPriceProps {
  usdPrice: string;
}

export function ApproxPrice({ usdPrice }: ApproxPriceProps) {
  const approx = useApproxDisplay();
  const reserveText = approxPriceReserve(usdPrice);

  if (!approx) {
    if (!reserveText) return null;
    return (
      <span className='relative approximate-vnd inline-block' aria-hidden='true'>
        <span className='invisible'>{reserveText}</span>
      </span>
    );
  }

  const displayText = formatApproxPrice(usdPrice, approx.currency, approx.rates);
  if (!displayText) {
    if (!reserveText) return null;
    return (
      <span className='relative approximate-vnd inline-block' aria-hidden='true'>
        <span className='invisible'>{reserveText}</span>
      </span>
    );
  }

  return (
    <span className='approximate-vnd' data-usd-price={usdPrice} aria-hidden='true'>
      {displayText}
    </span>
  );
}
