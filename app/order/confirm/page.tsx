import { redirect } from 'next/navigation';
import { supabaseClient } from '@/lib/supabase';
import { OrderConfirmation } from '@/components/catalog';
import { PublicLayout } from '@/components/layout';
import type { Order } from '@/lib/types';

type ConfirmPageProps = {
  searchParams?: Promise<{ orderId?: string }>;
};

export default async function ConfirmPage({ searchParams }: ConfirmPageProps) {
  const params = (await searchParams) ?? {};
  const orderId = params.orderId;

  // Si no hay orderId, redirigir al catálogo
  if (!orderId) {
    redirect('/catalog');
  }

  // Obtener el pedido
  const { data: order, error } = await supabaseClient
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .single();

  if (error || !order) {
    redirect('/catalog?error=order_not_found');
  }

  return (
    <PublicLayout>
      <section className="mx-auto max-w-3xl px-4 py-10">
        <OrderConfirmation order={order as Order} />
      </section>
    </PublicLayout>
  );
}
