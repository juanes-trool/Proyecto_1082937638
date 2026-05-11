// app/catalog/page.tsx
// Public catalog page (no auth required) - Placeholder for Phase 3

'use client';

export default function CatalogPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-pink-500 to-fuchsia-600 text-white py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold">Catálogo de Productos</h1>
          <p className="text-pink-100 mt-2">
            Bienvenido a nuestro catálogo de productos de belleza
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto p-4 py-12">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-pink-100 mb-6">
            <span className="text-4xl">💄</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            El catálogo está cargando productos...
          </h2>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            La tienda está siendo configurada. Vuelve pronto para ver nuestros
            productos de belleza de alta calidad. 🎀
          </p>
          <button className="inline-block px-6 py-3 bg-gradient-to-r from-pink-500 to-fuchsia-600 text-white font-semibold rounded-lg hover:from-pink-600 hover:to-fuchsia-700 transition-all">
            Volver a intentar
          </button>
        </div>

        {/* Grid Placeholder */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-gray-100 rounded-lg h-64 animate-pulse"></div>
          ))}
        </div>
      </div>
    </div>
  );
}
