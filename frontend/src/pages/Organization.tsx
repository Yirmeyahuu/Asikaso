import { useState, useEffect } from 'react';
import { api } from '../services/api';
import type { Organization, OrganizationMember, Department } from '../types';
import { UsersPageSkeleton } from '../components/Skeleton';

export default function Organization() {
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [hasOrganization, setHasOrganization] = useState<boolean | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [members, setMembers] = useState<OrganizationMember[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'members' | 'departments'>('members');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [orgRes, adminRes, membersRes, deptsRes] = await Promise.all([
        api.getOrganization(),
        api.checkIsAdmin(),
        api.getOrganizationMembers(),
        api.getDepartments(),
      ]);
      
      setOrganization(orgRes?.organization || null);
      setHasOrganization(orgRes.exists);
      setIsAdmin(adminRes.isAdmin);
      setMembers(membersRes?.members || []);
      setDepartments(deptsRes?.departments || []);
    } catch (err) {
      console.error('Error loading organization data:', err);
      setHasOrganization(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateOrganization = async (name: string, description: string) => {
    setIsProcessing(true);
    setError(null);
    setSuccess(null);

    try {
      await api.createOrganization(name, description);
      setSuccess('Organization created successfully!');
      setShowCreateModal(false);
      loadData();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create organization';
      setError(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAddMember = async (email: string) => {
    setIsProcessing(true);
    setError(null);
    setSuccess(null);

    try {
      await api.addOrganizationMember(email);
      setSuccess('Member added successfully!');
      setShowAddModal(false);
      loadData();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add member';
      setError(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRemoveMember = async (id: string) => {
    if (!confirm('Are you sure you want to remove this organization member?')) return;
    
    try {
      await api.removeOrganizationMember(id);
      setMembers(prev => prev.filter(m => m.id !== id));
    } catch (err) {
      console.error('Error removing member:', err);
    }
  };

  if (isLoading) {
    return <UsersPageSkeleton />;
  }

  // Show create organization prompt if no organization exists
  if (!hasOrganization) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Organization</h1>
          <p className="text-text-secondary">Set up your organization's profile</p>
        </div>

        <div className="card p-12 text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-primary/15 flex items-center justify-center">
            <svg className="w-10 h-10 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-text-primary mb-2">Create Your Organization</h2>
          <p className="text-text-muted mb-6 max-w-md mx-auto">
            Start by creating your organization. You'll become the admin and can then invite team members to collaborate.
          </p>
          <button onClick={() => setShowCreateModal(true)} className="btn btn-primary">
            + Create Organization
          </button>
        </div>

        {showCreateModal && (
          <CreateOrganizationModal
            onClose={() => {
              setShowCreateModal(false);
              setError(null);
              setSuccess(null);
            }}
            onCreate={handleCreateOrganization}
            isProcessing={isProcessing}
            error={error}
            success={success}
          />
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">{organization?.name}</h1>
          <p className="text-text-secondary">Manage organization members</p>
        </div>
        {isAdmin && activeTab === 'members' && (
          <button onClick={() => setShowAddModal(true)} className="btn btn-primary">
            + Add Member
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1 bg-bg-tertiary rounded-xl w-fit">
        <button
          onClick={() => setActiveTab('members')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'members'
              ? 'bg-bg-secondary text-text-primary shadow-sm'
              : 'text-text-muted hover:text-text-primary'
          }`}
        >
          Members ({members.length})
        </button>
        <button
          onClick={() => setActiveTab('departments')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'departments'
              ? 'bg-bg-secondary text-text-primary shadow-sm'
              : 'text-text-muted hover:text-text-primary'
          }`}
        >
          Departments ({departments.length})
        </button>
      </div>

      {/* Members Tab */}
      {activeTab === 'members' && (
        <div className="card overflow-hidden">
          {members.length === 0 ? (
            <div className="p-8 text-center text-text-muted">
              No organization members yet. {isAdmin && 'Add members using their Gmail address.'}
            </div>
          ) : (
            <div className="divide-y divide-border">
              {members.map(member => (
                <div key={member.id} className="flex items-center justify-between p-4 hover:bg-bg-tertiary/30 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center">
                      <span className="text-primary font-semibold">
                        {member.displayName?.charAt(0).toUpperCase() || member.email.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold text-text-primary">{member.displayName}</p>
                      <p className="text-sm text-text-muted">{member.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      member.role === 'admin' 
                        ? 'bg-primary/15 text-primary' 
                        : 'bg-bg-tertiary text-text-muted'
                    }`}>
                      {member.role === 'admin' ? 'Admin' : 'Member'}
                    </span>
                    {isAdmin && member.role !== 'admin' && (
                      <button
                        onClick={() => handleRemoveMember(member.id)}
                        className="p-2 text-text-muted hover:text-error hover:bg-error/10 rounded-lg transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Departments Tab */}
      {activeTab === 'departments' && (
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
              </div>
            </div>
          ))}
          {departments.length === 0 && (
            <div className="col-span-full p-8 text-center text-text-muted">
              No departments found.
            </div>
          )}
        </div>
      )}

      {/* Create Organization Modal */}
      {showCreateModal && (
        <CreateOrganizationModal
          onClose={() => {
            setShowCreateModal(false);
            setError(null);
            setSuccess(null);
          }}
          onCreate={handleCreateOrganization}
          isProcessing={isProcessing}
          error={error}
          success={success}
        />
      )}

      {/* Add Member Modal */}
      {showAddModal && (
        <AddMemberModal
          onClose={() => {
            setShowAddModal(false);
            setError(null);
            setSuccess(null);
          }}
          onAdd={handleAddMember}
          isProcessing={isProcessing}
          error={error}
          success={success}
        />
      )}
    </div>
  );
}

function CreateOrganizationModal({ 
  onClose, 
  onCreate, 
  isProcessing, 
  error, 
  success 
}: { 
  onClose: () => void; 
  onCreate: (name: string, description: string) => void;
  isProcessing: boolean;
  error: string | null;
  success: string | null;
}) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name) {
      onCreate(name, description);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center glass-modal-overlay">
      <div className="glass-modal-content w-full max-w-md p-6 m-4">
        <h2 className="text-xl font-bold text-text-primary mb-4">Create Organization</h2>
        
        {success && (
          <div className="mb-4 p-3 bg-success/10 border border-success/20 rounded-xl text-success text-sm">
            {success}
          </div>
        )}
        
        {error && (
          <div className="mb-4 p-3 bg-error/10 border border-error/20 rounded-xl text-error text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">
              Organization Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My Company"
              className="glass-input w-full"
              required
              disabled={isProcessing}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">
              Description (optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of your organization"
              className="glass-input w-full h-24"
              disabled={isProcessing}
            />
          </div>
          
          <div className="flex justify-end gap-3">
            <button 
              type="button" 
              onClick={onClose} 
              className="glass-btn"
              disabled={isProcessing}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="glass-btn bg-primary text-white"
              disabled={isProcessing || !name}
            >
              {isProcessing ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function AddMemberModal({ 
  onClose, 
  onAdd, 
  isProcessing, 
  error, 
  success 
}: { 
  onClose: () => void; 
  onAdd: (email: string) => void;
  isProcessing: boolean;
  error: string | null;
  success: string | null;
}) {
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      onAdd(email.trim());
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center glass-modal-overlay">
      <div className="glass-modal-content w-full max-w-md p-6 m-4">
        <h2 className="text-xl font-bold text-text-primary mb-4">Add Organization Member</h2>
        
        {success && (
          <div className="mb-4 p-3 bg-success/10 border border-success/20 rounded-xl text-success text-sm">
            {success}
          </div>
        )}
        
        {error && (
          <div className="mb-4 p-3 bg-error/10 border border-error/20 rounded-xl text-error text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">
              Gmail Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@gmail.com"
              className="glass-input w-full"
              required
              disabled={isProcessing}
            />
            <p className="text-xs text-text-muted mt-1">
              Only Gmail addresses are allowed. The user must have an ASIK account to be added.
            </p>
          </div>
          
          <div className="flex justify-end gap-3">
            <button 
              type="button" 
              onClick={onClose} 
              className="glass-btn"
              disabled={isProcessing}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="glass-btn bg-primary text-white"
              disabled={isProcessing || !email}
            >
              {isProcessing ? 'Adding...' : 'Add Member'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
