import { useState, useEffect } from 'react';
import { api } from '../services/api';
import type { Department } from '../types';
import { DepartmentsPageSkeleton } from '../components/Skeleton';

export default function Departments() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);

  useEffect(() => {
    loadDepartments();
  }, []);

  const loadDepartments = async () => {
    try {
      const { departments: depts } = await api.getDepartments();
      setDepartments(depts);
    } catch (error) {
      console.error('Error loading departments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async (data: Partial<Department>) => {
    try {
      const { department } = await api.createDepartment(data);
      setDepartments(prev => [...prev, department]);
      setShowModal(false);
    } catch (error) {
      console.error('Error creating department:', error);
    }
  };

  const handleUpdate = async (data: Partial<Department>) => {
    if (!editingDept) return;
    try {
      const { department } = await api.updateDepartment(editingDept.id, data);
      setDepartments(prev => prev.map(d => d.id === department.id ? department : d));
      setEditingDept(null);
    } catch (error) {
      console.error('Error updating department:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this department?')) return;
    try {
      await api.deleteDepartment(id);
      setDepartments(prev => prev.filter(d => d.id !== id));
    } catch (error) {
      console.error('Error deleting department:', error);
    }
  };

  if (isLoading) {
    return <DepartmentsPageSkeleton />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Departments</h1>
          <p className="text-text-secondary">Manage your organization's departments</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn btn-primary">
          + New Department
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {departments.map(dept => (
          <div key={dept.id} className="card p-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-text-primary">{dept.name}</h3>
                {dept.description && (
                  <p className="text-sm text-text-muted mt-1">{dept.description}</p>
                )}
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => setEditingDept(dept)}
                  className="p-1 text-text-muted hover:text-text-primary"
                >
                  ✏️
                </button>
                <button
                  onClick={() => handleDelete(dept.id)}
                  className="p-1 text-text-muted hover:text-error"
                >
                  🗑️
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {departments.length === 0 && (
        <div className="text-center py-12 text-text-muted">
          No departments found. Create your first department!
        </div>
      )}

      {/* Simple Modal */}
      {(showModal || editingDept) && (
        <DepartmentModal
          department={editingDept}
          onSave={editingDept ? handleUpdate : handleCreate}
          onClose={() => {
            setShowModal(false);
            setEditingDept(null);
          }}
        />
      )}
    </div>
  );
}

function DepartmentModal({ department, onSave, onClose }: {
  department: Department | null;
  onSave: (data: Partial<Department>) => void;
  onClose: () => void;
}) {
  const [name, setName] = useState(department?.name || '');
  const [description, setDescription] = useState(department?.description || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ name, description });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center glass-modal-overlay">
      <div className="glass-modal-content w-full max-w-md p-6 m-4">
        <h2 className="text-xl font-bold text-text-primary mb-4">
          {department ? 'Edit Department' : 'New Department'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="glass-input w-full"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="glass-input w-full h-24"
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
