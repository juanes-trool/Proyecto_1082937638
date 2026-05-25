import { redirect } from 'next/navigation';
import { getPublicProductById } from '@/lib/dataService';
import { OrderForm } from '@/components/catalog';
import { PublicLayout } from '@/components/layout';

type OrderPageProps = {
  params: Promise<{ productId: string }>;
};

export default async function OrderPage({ params }: OrderPageProps) {
  const { productId } = await params;

  // Obtener el producto
  const product = await getPublicProductById(productId);

  // Si el producto no existe o no está disponible, redirigir al catálogo
  if (!product || product.current_stock === 0) {
    redirect('/catalog?unavailable=1');
  }

  return (
    <PublicLayout>
      <section className="mx-auto max-w-2xl px-4 py-10">
        <div className="mb-10">
          <a href="/catalog" className="inline-flex items-center gap-2 text-rose-600 hover:text-rose-700">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Volver al catálogo
          </a>
        </div>

        <div className="grid gap-10 sm:grid-cols-2">
          {/* Imagen del producto */}
          <div className="rounded-3xl border border-rose-100 bg-rose-50 p-4 sm:sticky sm:top-4 sm:h-fit">
            {product.image_url ? (
              <img src={product.image_url} alt={product.name} className="h-full w-full rounded-2xl object-cover" />
            ) : (
              <div className="flex h-80 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-100 via-pink-50 to-white">
                <svg width="88" height="88" viewBox="0 0 88 88" fill="none" aria-hidden="true">
                  <rect x="24" y="28" width="40" height="44" rx="10" fill="#F43F5E" />
                  <rect x="31" y="18" width="26" height="12" rx="4" fill="#E11D48" />
                  <rect x="34" y="34" width="8" height="24" rx="4" fill="white" fillOpacity="0.32" />
                  <circle cx="58" cy="25" r="8" fill="#FDB4C0" />
                </svg>
              </div>
            )}
          </div>

          {/* Formulario */}
          <div>
            <div className="mb-8">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-rose-600">Completa tu pedido</p>
              <h1 className="mt-2 text-3xl font-black text-slate-900">Detalles del pedido</h1>
              <p className="mt-3 text-slate-600">
                Ingresa tus datos y confirma tu compra. Recibirás confirmación por teléfono.
              </p>
            </div>

            <OrderForm product={product} />
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
