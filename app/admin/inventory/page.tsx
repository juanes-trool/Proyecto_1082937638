'use client';

import React, { useEffect, useState } from 'react';
import { AppLayout } from '@/components/layout';
import { Button, Card, EmptyState, Modal, Badge, Toast } from '@/components/ui';
import type { Product, Category } from '@/lib/types';

export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    categoryId: '',
    price: 0,
    currentStock: 0,
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [productsRes, categoriesRes] = await Promise.all([
          fetch('/api/products'),
          fetch('/api/categories'),
        ]);

        if (productsRes.ok) {
          const data = await productsRes.json();
          setProducts(data.data ?? []);
        }
        if (categoriesRes.ok) {
          const data = await categoriesRes.json();
          setCategories(data.data ?? []);
        }
      } catch (err) {
        setError('Error al cargar datos');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError('');
      const fd = new FormData();
      fd.append('name', formData.name.trim());
      fd.append('description', formData.description.trim());
      fd.append('category_id', formData.categoryId);
      fd.append('price', formData.price.toString());
      fd.append('current_stock', formData.currentStock.toString());

      const res = await fetch('/api/products', {
        method: 'POST',
        body: fd,
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? 'Error al crear producto');
        return;
      }

      const data = await res.json();
      setProducts([...products, data.data]);
      setSuccess('Producto creado exitosamente');
      setShowModal(false);
      setFormData({ name: '', description: '', categoryId: '', price: 0, currentStock: 0 });
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Error al crear producto');
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="text-center py-12">
          <p className="text-gray-600">Cargando inventario...</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">📦 Inventario</h1>
            <p className="text-gray-600">Gestión de productos y stock</p>
          </div>
          <Button onClick={() => setShowModal(true)}>+ Nuevo Producto</Button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {success && <Toast message={success} type="success" />}

        {products.length === 0 ? (
          <EmptyState title="Sin productos" description="Crea tu primer producto para comenzar" />
        ) : (
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Nombre</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Categoría</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Precio</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Stock</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id} className="border-b hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900">{product.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{product.category_id}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">${product.price.toFixed(2)}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{product.current_stock}</td>
                      <td className="px-6 py-4 text-sm">
                        <Badge 
                          variant={product.current_stock > 0 ? 'success' : 'danger'}
                        >
                          {product.current_stock > 0 ? 'Disponible' : 'Agotado'}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {showModal && (
          <Modal
            isOpen={true}
            title="Crear Nuevo Producto"
            onClose={() => setShowModal(false)}
            footer={
              <div className="flex gap-2">
                <Button 
                  onClick={() => setShowModal(false)}
                  style={{ background: '#e5e7eb', color: '#111827' }}
                >
                  Cancelar
                </Button>
                <Button onClick={handleCreateProduct}>Crear Producto</Button>
              </div>
            }
          >
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Nombre</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ej: Shampoo Premium"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Descripción</label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descripción del producto"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Categoría</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                >
                  <option value="">Selecciona una categoría</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Precio</label>
                <input
                  type="number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Stock Inicial</label>
                <input
                  type="number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                  value={formData.currentStock}
                  onChange={(e) => setFormData({ ...formData, currentStock: parseInt(e.target.value) })}
                  placeholder="0"
                  min="0"
                />
              </div>
            </div>
          </Modal>
        )}
      </div>
    </AppLayout>
  );
}
