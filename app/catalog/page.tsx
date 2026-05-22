import Link from 'next/link';

import { CategoryFilter, ProductCard } from '@/components/catalog';
import { PublicLayout } from '@/components/layout';
import { getPublicCatalog } from '@/lib/dataService';

type CatalogPageProps = {
  searchParams?: Promise<{
    categoryId?: string;
  }>;
};

export default async function CatalogPage({ searchParams }: CatalogPageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const products = await getPublicCatalog(resolvedSearchParams.categoryId);

  const categories = Array.from(
    new Map(products.map((product) => [product.category_id, product.category_name])).entries(),
  ).map(([id, name]) => ({ id, name }));

  return (
    <PublicLayout>
      <section className="border-b border-rose-100 bg-[radial-gradient(circle_at_top_left,_rgba(244,63,94,0.14),_transparent_38%),linear-gradient(135deg,_#fff8fa_0%,_#fff1f2_100%)]">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          <div>
            <span className="inline-flex rounded-full border border-rose-200 bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-rose-700">
              SGIB Tienda de Belleza
            </span>
            <h1 className="mt-5 max-w-3xl text-4xl font-black tracking-tight text-slate-900 sm:text-5xl">
              Inventario de belleza visible, ordenado y listo para vender.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
              Este ya es el proyecto real: catálogo público de SGIB con productos,
              disponibilidad y acceso al panel administrativo.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="#catalogo"
                className="rounded-full bg-rose-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-rose-600"
              >
                Ver catálogo
              </Link>
              <Link
                href="/login"
                className="rounded-full border border-rose-200 bg-white px-5 py-3 text-sm font-semibold text-rose-700 transition hover:border-rose-300 hover:bg-rose-50"
              >
                Entrar al panel
              </Link>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
            <div className="rounded-3xl border border-rose-100 bg-white/90 p-6 shadow-sm shadow-rose-100/60">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Productos visibles</p>
              <p className="mt-3 text-4xl font-black text-slate-900">{products.length}</p>
            </div>
            <div className="rounded-3xl border border-rose-100 bg-white/90 p-6 shadow-sm shadow-rose-100/60">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Categorías activas</p>
              <p className="mt-3 text-4xl font-black text-slate-900">{categories.length}</p>
            </div>
            <div className="rounded-3xl border border-rose-100 bg-white/90 p-6 shadow-sm shadow-rose-100/60">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Estado</p>
              <p className="mt-3 text-xl font-bold text-rose-600">Proyecto SGIB en operación visual</p>
            </div>
          </div>
        </div>
      </section>

      <section id="catalogo" className="mx-auto max-w-6xl px-4 py-10">
        <div className="flex flex-col gap-4 border-b border-rose-100 pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-rose-600">Catálogo público</p>
            <h2 className="mt-2 text-3xl font-bold text-slate-900">Productos disponibles</h2>
          </div>

          <CategoryFilter
            categories={categories}
            activeCategoryId={resolvedSearchParams.categoryId}
          />
        </div>

        {products.length === 0 ? (
          <div className="mt-8 rounded-3xl border border-dashed border-rose-200 bg-white p-10 text-center shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-rose-600">Sin productos aún</p>
            <h3 className="mt-3 text-2xl font-bold text-slate-900">La interfaz nueva ya está publicada</h3>
            <p className="mx-auto mt-3 max-w-xl text-slate-600">
              El catálogo ya no es una demo ni una pantalla temporal. Cuando cargues productos,
              aparecerán aquí automáticamente.
            </p>
          </div>
        ) : (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {products.map((product) => <ProductCard key={product.id} product={product} />)}
          </div>
        )}
      </section>
    </PublicLayout>
  );
}
