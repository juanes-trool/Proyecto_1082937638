'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { SafeUser } from '@/lib/types';
import { AlertTriangle } from 'lucide-react';
import { AppLayout } from '@/components/layout';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Table } from '@/components/ui/Table';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';

interface CreateUserForm {
  name: string;
  email: string;
  role: 'admin' | 'empleado';
}

interface EditUserForm {
  name: string;
  role: 'admin' | 'empleado';
}

export default function UsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<SafeUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<SafeUser | null>(null);
  const [tempPassword, setTempPassword] = useState<string | null>(null);

  const [createForm, setCreateForm] = useState<CreateUserForm>({
    name: '',
    email: '',
    role: 'empleado',
  });

  const [editForm, setEditForm] = useState<EditUserForm>({
    name: '',
    role: 'empleado',
  });

  // Cargar usuarios
  const loadUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/users', { method: 'GET' });
      if (res.status === 401) {
        router.push('/login');
        return;
      }
      if (!res.ok) throw new Error('Error al cargar usuarios');
      const json = await res.json();
      setUsers(json.data || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  // Crear usuario
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createForm),
      });

      if (!res.ok) {
        const json = await res.json();
        setError(json.error || 'Error al crear usuario');
        return;
      }

      const json = await res.json();
      setTempPassword(json.temporaryPassword);
      setCreateForm({ name: '', email: '', role: 'empleado' });
      
      // Cerrar modal después de un tiempo
      setTimeout(() => {
        setShowCreateModal(false);
        setTempPassword(null);
        loadUsers();
      }, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    }
  };

  // Actualizar usuario
  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    try {
      const res = await fetch(`/api/users/${selectedUser.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });

      if (!res.ok) {
        const json = await res.json();
        setError(json.error || 'Error al actualizar usuario');
        return;
      }

      setShowEditModal(false);
      setSelectedUser(null);
      loadUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    }
  };

  // Eliminar usuario
  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    try {
      const res = await fetch(`/api/users/${selectedUser.id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const json = await res.json();
        setError(json.error || 'Error al eliminar usuario');
        return;
      }

      setShowDeleteModal(false);
      setSelectedUser(null);
      loadUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    }
  };

  const openEditModal = (user: SafeUser) => {
    setSelectedUser(user);
    setEditForm({ name: user.name, role: user.role as 'admin' | 'empleado' });
    setShowEditModal(true);
  };

  const openDeleteModal = (user: SafeUser) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="text-center py-12">
          <div className="text-gray-500">Cargando usuarios...</div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Gestión de Usuarios</h1>
        <p className="text-gray-600">
          Crea, edita y gestiona los usuarios del sistema.
        </p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      <div className="mb-6">
        <Button onClick={() => setShowCreateModal(true)}>+ Nuevo Usuario</Button>
      </div>

      {users.length === 0 ? (
        <Card>
          <div className="p-12 text-center">
            <div className="text-gray-400 text-lg">No hay usuarios</div>
          </div>
        </Card>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b-2 border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left font-semibold text-gray-700">Nombre</th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-700">Email</th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-700">Rol</th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-700">Estado</th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-700">Cambiar PWD</th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-700">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-3">{user.name}</td>
                    <td className="px-6 py-3">{user.email}</td>
                    <td className="px-6 py-3">
                      {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </td>
                    <td className="px-6 py-3">
                      <Badge variant={user.is_active ? 'success' : 'danger'}>
                        {user.is_active ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </td>
                    <td className="px-6 py-3">
                      <Badge variant={user.must_change_password ? 'warning' : 'info'}>
                        {user.must_change_password ? 'Sí' : 'No'}
                      </Badge>
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex gap-2">
                        <Button
                          onClick={() => openEditModal(user)}
                          className="px-3 py-1 text-sm bg-blue-500 hover:bg-blue-600"
                        >
                          Editar
                        </Button>
                        {user.email !== 'admin@sgib.com' && (
                          <Button
                            onClick={() => openDeleteModal(user)}
                            className="px-3 py-1 text-sm bg-red-500 hover:bg-red-600"
                          >
                            Eliminar
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Modal Crear Usuario */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setTempPassword(null);
        }}
        title={tempPassword ? 'Usuario creado' : 'Crear nuevo usuario'}
      >
        {tempPassword ? (
          <div className="space-y-4">
            <p className="text-gray-700">
              El usuario ha sido creado exitosamente. La contraseña temporal es:
            </p>
            <div className="bg-gray-100 p-4 rounded border-l-4 border-green-500 font-mono text-lg break-all">
              {tempPassword}
            </div>
            <p className="flex items-center gap-1.5 text-gray-600 text-sm">
              <AlertTriangle size={14} /> Comparte esta contraseña con el usuario. Deberá cambiarla en su primer ingreso.
            </p>
          </div>
        ) : (
          <form onSubmit={handleCreateUser} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre
              </label>
              <input
                type="text"
                value={createForm.name}
                onChange={(e) =>
                  setCreateForm({ ...createForm, name: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={createForm.email}
                onChange={(e) =>
                  setCreateForm({ ...createForm, email: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rol
              </label>
              <select
                value={createForm.role}
                onChange={(e) =>
                  setCreateForm({
                    ...createForm,
                    role: e.target.value as 'admin' | 'empleado',
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
              >
                <option value="empleado">Empleado</option>
                <option value="admin">Administrador</option>
              </select>
            </div>

            <div className="flex gap-2 pt-4">
              <Button type="submit" className="flex-1">
                Crear Usuario
              </Button>
              <Button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="flex-1 bg-gray-300 hover:bg-gray-400"
              >
                Cancelar
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* Modal Editar Usuario */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title={`Editar: ${selectedUser?.name}`}
      >
        <form onSubmit={handleUpdateUser} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre
            </label>
            <input
              type="text"
              value={editForm.name}
              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Rol
            </label>
            <select
              value={editForm.role}
              onChange={(e) =>
                setEditForm({
                  ...editForm,
                  role: e.target.value as 'admin' | 'empleado',
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
            >
              <option value="empleado">Empleado</option>
              <option value="admin">Administrador</option>
            </select>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" className="flex-1">
              Guardar Cambios
            </Button>
            <Button
              type="button"
              onClick={() => setShowEditModal(false)}
              className="flex-1 bg-gray-300 hover:bg-gray-400"
            >
              Cancelar
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal Eliminar Usuario */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Eliminar Usuario"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            ¿Estás seguro de que deseas eliminar a{' '}
            <strong>{selectedUser?.name}</strong>?
          </p>
          <p className="text-gray-600 text-sm">
            Esta acción es irreversible. El usuario no podrá acceder al sistema.
          </p>

          <div className="flex gap-2 pt-4">
            <Button
              onClick={handleDeleteUser}
              className="flex-1 bg-red-500 hover:bg-red-600"
            >
              Eliminar
            </Button>
            <Button
              onClick={() => setShowDeleteModal(false)}
              className="flex-1 bg-gray-300 hover:bg-gray-400"
            >
              Cancelar
            </Button>
          </div>
        </div>
      </Modal>
      </div>
    </AppLayout>
  );
}
