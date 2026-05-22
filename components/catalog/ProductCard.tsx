import { PublicProduct } from '@/lib/types';

const priceFormatter = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
});

type ProductCardProps = {
  product: PublicProduct;
};

function ProductImagePlaceholder() {
  return (
    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-rose-100 via-pink-50 to-white">
      <svg width="88" height="88" viewBox="0 0 88 88" fill="none" aria-hidden="true">
        <rect x="24" y="28" width="40" height="44" rx="10" fill="#F43F5E" />
        <rect x="31" y="18" width="26" height="12" rx="4" fill="#E11D48" />
        <rect x="34" y="34" width="8" height="24" rx="4" fill="white" fillOpacity="0.32" />
        <circle cx="58" cy="25" r="8" fill="#FDB4C0" />
      </svg>
    </div>
  );
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <article className="overflow-hidden rounded-[28px] border border-rose-100 bg-white shadow-sm shadow-rose-100/60 transition hover:-translate-y-1 hover:shadow-lg hover:shadow-rose-100">
      <div className="relative h-64 overflow-hidden border-b border-rose-100 bg-rose-50">
        {product.image_url ? (
          <img src={product.image_url} alt={product.name} className="h-full w-full object-cover" />
        ) : (
          <ProductImagePlaceholder />
        )}

        <span
          className={product.is_available
            ? 'absolute right-4 top-4 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-emerald-700'
            : 'absolute right-4 top-4 rounded-full bg-rose-100 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-rose-700'}
        >
          {product.is_available ? 'En stock' : 'Sin stock'}
        </span>
      </div>

      <div className="p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-rose-600">
          {product.category_name}
        </p>
        <h3 className="mt-2 text-xl font-bold text-slate-900">{product.name}</h3>
        {product.brand ? <p className="mt-1 text-sm text-slate-500">Marca: {product.brand}</p> : null}
        <p className="mt-3 min-h-12 text-sm leading-6 text-slate-600">
          {product.description || 'Producto de belleza disponible en el catálogo SGIB.'}
        </p>

        <div className="mt-5 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Precio</p>
            <p className="mt-1 text-2xl font-black text-slate-900">
              {priceFormatter.format(product.price)}
            </p>
          </div>
          <button
            type="button"
            disabled={!product.is_available}
            className="rounded-full bg-rose-500 px-4 py-2 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500"
          >
            Pedir ahora
          </button>
        </div>
      </div>
    </article>
  );
}
