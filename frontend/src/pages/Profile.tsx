import { useAuth } from '../contexts/AuthContext';

export default function Profile() {
  const { user, firebaseUser } = useAuth();

  if (!user) {
    return null;
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="page-title mb-2">Profile</h1>
      <p className="page-subtitle mb-8">Manage your account settings</p>

      <div className="glass-card p-6">
        <div className="flex items-center gap-6 mb-8">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center text-white text-3xl font-bold">
            {user.displayName?.charAt(0) || user.email.charAt(0)}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-text-primary">{user.displayName || 'User'}</h2>
            <p className="text-text-secondary">{user.email}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center py-3 border-b border-border">
            <span className="text-text-secondary">Role</span>
            <span className="text-text-primary font-medium capitalize">{user.role.replace('_', ' ')}</span>
          </div>
          
          <div className="flex justify-between items-center py-3 border-b border-border">
            <span className="text-text-secondary">Email Verified</span>
            <span className="text-text-primary font-medium">
              {firebaseUser?.emailVerified ? 'Yes' : 'No'}
            </span>
          </div>

          <div className="flex justify-between items-center py-3">
            <span className="text-text-secondary">User ID</span>
            <span className="text-text-muted text-sm font-mono truncate max-w-[200px]">
              {firebaseUser?.uid}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
