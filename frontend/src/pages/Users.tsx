import { useState, useEffect } from 'react';
import { api } from '../services/api';
import type { User } from '../types';
import { UsersPageSkeleton } from '../components/Skeleton';

export default function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const { users: loadedUsers } = await api.getUsers();
      setUsers(loadedUsers);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = async (data: Partial<User>) => {
    if (!editingUser) return;
    try {
      const { user } = await api.updateUser(editingUser.id, data);
      setUsers(prev => prev.map(u => u.id === user.id ? user : u));
      setEditingUser(null);
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    const colors = {
      admin: 'bg-error',
      department_manager: 'bg-warning',
      employee: 'bg-info',
    };
    return colors[role as keyof typeof colors] || 'bg-gray-500';
  };

  if (isLoading) {
    return <UsersPageSkeleton />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Users</h1>
        <p className="text-text-secondary">Manage your organization's users</p>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full">
          <thead className="bg-bg-tertiary">
            <tr>
              <th className="text-left p-4 text-text-secondary font-medium">Name</th>
              <th className="text-left p-4 text-text-secondary font-medium">Email</th>
              <th className="text-left p-4 text-text-secondary font-medium">Role</th>
              <th className="text-left p-4 text-text-secondary font-medium">Status</th>
              <th className="text-left p-4 text-text-secondary font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {users.map(user => (
              <tr key={user.id} className="hover:bg-bg-tertiary">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-medium">
                      {user.displayName?.charAt(0) || user.email.charAt(0)}
                    </div>
                    <span className="font-medium text-text-primary">{user.displayName}</span>
                  </div>
                </td>
                <td className="p-4 text-text-secondary">{user.email}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-full text-xs text-white ${getRoleBadgeColor(user.role)}`}>
                    {user.role.replace('_', ' ')}
                  </span>
                </td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-full text-xs ${user.isActive ? 'bg-success/20 text-success' : 'bg-error/20 text-error'}`}>
                    {user.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="p-4">
                  <button
                    onClick={() => setEditingUser(user)}
                    className="p-2 text-text-muted hover:text-text-primary"
                  >
                    ✏️
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {users.length === 0 && (
          <div className="p-8 text-center text-text-muted">
            No users found.
          </div>
        )}
      </div>

      {editingUser && (
        <UserModal
          user={editingUser}
          onSave={handleUpdate}
          onClose={() => setEditingUser(null)}
        />
      )}
    </div>
  );
}

function UserModal({ user, onSave, onClose }: {
  user: User;
  onSave: (data: Partial<User>) => void;
  onClose: () => void;
}) {
  const [displayName, setDisplayName] = useState(user.displayName || '');
  const [role, setRole] = useState(user.role);
  const [departmentId, setDepartmentId] = useState(user.departmentId || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ displayName, role, departmentId: departmentId || undefined });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center glass-modal-overlay">
      <div className="glass-modal-content w-full max-w-md p-6 m-4">
        <h2 className="text-xl font-bold text-text-primary mb-4">Edit User</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">Display Name</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="glass-input w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as User['role'])}
              className="glass-input w-full"
            >
              <option value="employee">Employee</option>
              <option value="department_manager">Department Manager</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">Department ID</label>
            <input
              type="text"
              value={departmentId}
              onChange={(e) => setDepartmentId(e.target.value)}
              className="glass-input w-full"
              placeholder="Leave empty for no department"
            />
          </div>
          <div className="flex justify-end gap-3">
            <button type="button" onClick={onClose} className="glass-btn">Cancel</button>
            <button type="submit" className="glass-btn glass-btn-primary">Save</button>
          </div>
        </form>
      </div>
    </div>
  );
}
