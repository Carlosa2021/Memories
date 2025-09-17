'use client';
import { BuyWidget } from 'thirdweb/react';
import { polygon } from 'thirdweb/chains';
import { client } from '@/lib/thirdweb/client';

export default function BuyFundsWidget({
  amount = '0.01',
}: {
  amount?: string;
}) {
  return (
    <BuyWidget
      client={client}
      chain={polygon}
      amount={amount}
      title="Comprar Fondos"
    />
  );
}
