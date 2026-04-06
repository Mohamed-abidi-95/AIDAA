// ============================================================================
// ADMIN PANEL PAGE
// ============================================================================
// Dashboard for admin users to manage system

import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { ContentItem, ContentFormData, User } from '../types/content.types';
import { ContentCard } from '../components/ContentCard';
import { EditContentModal } from '../components/EditContentModal';
import { DeleteContentModal } from '../components/DeleteContentModal';
import '../styles/DashboardEnhanced.css';
import '../styles/AdminPanelPremium.css';

// ...existing code...

type UserRole = 'admin' | 'parent' | 'professional';

interface UserFormState {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

export const AdminPanel = (): JSX.Element => {
  const { logout } = useAuth();
  const [view, setView] = useState('content'); // 'content', 'upload', 'users'
  const [content, setContent] = useState<ContentItem[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [userActionLoading, setUserActionLoading] = useState(false);

  const [createUserForm, setCreateUserForm] = useState<UserFormState>({
    name: '',
    email: '',
    password: '',
    role: 'parent',
  });

  const [editingUserId, setEditingUserId] = useState<number | null>(null);
  const [editingUserForm, setEditingUserForm] = useState<Omit<UserFormState, 'password'> | null>(null);

  // Modal states
  const [editingContent, setEditingContent] = useState<ContentItem | null>(null);
  const [deletingContentId, setDeletingContentId] = useState<number | null>(null);
  const [deletingContentTitle, setDeletingContentTitle] = useState<string>('');

  // Upload form state
  const [uploadForm, setUploadForm] = useState<ContentFormData>({
    title: '',
    type: 'video',
    description: '',
    category: '',
    categoryColor: '#f97316',
    emoji: '📹',
    duration: '',
    steps: 5,
    minutes: 15,
    emojiColor: '#d1fae5',
    ageGroup: '4-6',
    level: '1',
    file: null
  });

  const getAuthHeaders = (): HeadersInit => {
    const token = localStorage.getItem('aidaa_token');
    return { Authorization: `Bearer ${token}` };
  };

  const fetchUsers = async () => {
    const res = await fetch('http://localhost:5000/api/users', {
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (!data.success) {
      throw new Error(data.message || 'Failed to fetch users');
    }
    setUsers(data.data);
  };

  // Fetch content
  useEffect(() => {
    const fetchContent = async () => {
      try {
        setLoading(true);
        const res = await fetch('http://localhost:5000/api/content');
        const data = await res.json();
        console.log('[AdminPanel] Fetched content:', data);
        if (data.success) setContent(data.data);
      } catch (err) {
        console.error('Error fetching content:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchContent();
  }, []);

  // Fetch users
  useEffect(() => {
    const loadUsers = async () => {
      try {
        setLoading(true);
        await fetchUsers();
      } catch (err) {
        console.error('Error fetching users:', err);
      } finally {
        setLoading(false);
      }
    };
    loadUsers();
  }, []);

  const handleCreateUserChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setCreateUserForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!createUserForm.name.trim() || !createUserForm.email.trim() || !createUserForm.password.trim()) {
      alert('Name, email and password are required');
      return;
    }

    try {
      setUserActionLoading(true);

      const res = await fetch('http://localhost:5000/api/users', {
        method: 'POST',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: createUserForm.name.trim(),
          email: createUserForm.email.trim().toLowerCase(),
          password: createUserForm.password,
          role: createUserForm.role,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        alert(data.message || 'Failed to create user');
        return;
      }

      setCreateUserForm({ name: '', email: '', password: '', role: 'parent' });
      await fetchUsers();
      alert('User created successfully');
    } catch (err) {
      console.error('Error creating user:', err);
      alert('Error creating user');
    } finally {
      setUserActionLoading(false);
    }
  };

  const handleEditUserStart = (user: User) => {
    setEditingUserId(user.id);
    setEditingUserForm({
      name: user.name,
      email: user.email,
      role: user.role,
    });
  };

  const handleEditUserChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditingUserForm((prev) => {
      if (!prev) return prev;
      return { ...prev, [name]: value as UserRole };
    });
  };

  const handleEditUserSave = async (user: User) => {
    if (!editingUserForm) return;

    if (!editingUserForm.name.trim() || !editingUserForm.email.trim()) {
      alert('Name and email are required');
      return;
    }

    try {
      setUserActionLoading(true);

      const res = await fetch(`http://localhost:5000/api/users/${user.id}`, {
        method: 'PUT',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: editingUserForm.name.trim(),
          email: editingUserForm.email.trim().toLowerCase(),
          role: editingUserForm.role,
          is_active: user.is_active,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        alert(data.message || 'Failed to update user');
        return;
      }

      setEditingUserId(null);
      setEditingUserForm(null);
      await fetchUsers();
      alert('User updated successfully');
    } catch (err) {
      console.error('Error updating user:', err);
      alert('Error updating user');
    } finally {
      setUserActionLoading(false);
    }
  };

  const handleUserDelete = async (user: User) => {
    const confirmed = window.confirm(`Retirer l'utilisateur ${user.name} ?`);
    if (!confirmed) return;

    try {
      setUserActionLoading(true);

      const res = await fetch(`http://localhost:5000/api/users/${user.id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      const data = await res.json();
      if (!data.success) {
        alert(data.message || 'Failed to remove user');
        return;
      }

      await fetchUsers();
      alert('User removed successfully');
    } catch (err) {
      console.error('Error deleting user:', err);
      alert('Error removing user');
    } finally {
      setUserActionLoading(false);
    }
  };

  const handleUserReactivate = async (user: User) => {
    try {
      setUserActionLoading(true);

      const res = await fetch(`http://localhost:5000/api/users/${user.id}`, {
        method: 'PUT',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: user.name,
          email: user.email,
          role: user.role,
          is_active: 1,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        alert(data.message || 'Failed to reactivate user');
        return;
      }

      await fetchUsers();
      alert('User reactivated successfully');
    } catch (err) {
      console.error('Error reactivating user:', err);
      alert('Error reactivating user');
    } finally {
      setUserActionLoading(false);
    }
  };

  const handleUploadChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;

    // Convert number fields to numbers
    let finalValue: any = value;
    if (type === 'number') {
      finalValue = value ? parseInt(value) : undefined;
    }

    setUploadForm(prev => ({ ...prev, [name]: finalValue }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadForm(prev => ({ ...prev, file: e.target.files![0] }));
    }
  };

  // ========================================================================
  // EDIT HANDLERS
  // ========================================================================
  const handleEdit = (contentItem: ContentItem) => {
    setEditingContent(contentItem);
  };

  const handleEditSave = async (contentId: number, formData: ContentFormData) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('aidaa_token');

      const res = await fetch(`http://localhost:5000/api/content/${contentId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title,
          type: formData.type,
          category: formData.category,
          category_color: formData.categoryColor,
          emoji: formData.emoji,
          duration: formData.duration,
          steps: formData.steps,
          minutes: formData.minutes,
          emoji_color: formData.emojiColor,
          description: formData.description,
          age_group: formData.ageGroup,
          level: formData.level,
        }),
      });

      const data = await res.json();
      if (data.success) {
        alert('Content updated successfully!');
        setEditingContent(null);

        // Refresh content list
        const listRes = await fetch('http://localhost:5000/api/content');
        const listData = await listRes.json();
        if (listData.success) setContent(listData.data);
      } else {
        alert('Update failed: ' + data.message);
      }
    } catch (err) {
      console.error('Error updating content:', err);
      alert('Error updating content');
    } finally {
      setLoading(false);
    }
  };

  // ========================================================================
  // DELETE HANDLERS
  // ========================================================================
  const handleDeleteClick = (contentItem: ContentItem) => {
    setDeletingContentId(contentItem.id);
    setDeletingContentTitle(contentItem.title);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingContentId) return;

    try {
      setLoading(true);
      const token = localStorage.getItem('aidaa_token');

      console.log('[AdminPanel] Deleting content ID:', deletingContentId);
      console.log('[AdminPanel] Token:', token ? 'present' : 'missing');

      const res = await fetch(`http://localhost:5000/api/content/${deletingContentId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      console.log('[AdminPanel] Delete response status:', res.status);

      const data = await res.json();
      console.log('[AdminPanel] Delete response:', data);

      if (data.success) {
        alert('Content deleted successfully!');
        setDeletingContentId(null);
        setDeletingContentTitle('');

        // Refresh content list
        const listRes = await fetch('http://localhost:5000/api/content');
        const listData = await listRes.json();
        if (listData.success) setContent(listData.data);
      } else {
        alert('Delete failed: ' + data.message);
      }
    } catch (err) {
      console.error('Error deleting content:', err);
      alert('Error deleting content');
    } finally {
      setLoading(false);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadForm.file || !uploadForm.title) {
      alert('Please select a file and enter a title');
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('aidaa_token');
      const formData = new FormData();
      formData.append('file', uploadForm.file);
      formData.append('title', uploadForm.title);
      formData.append('type', uploadForm.type);
      formData.append('description', uploadForm.description || '');
      formData.append('category', uploadForm.category || '');
      formData.append('category_color', uploadForm.categoryColor || '#f97316');
      formData.append('emoji', uploadForm.emoji || '');
      formData.append('age_group', uploadForm.ageGroup || '4-6');
      formData.append('level', uploadForm.level?.toString() || '1');

      // Add type-specific fields
      if (uploadForm.type === 'video' && uploadForm.duration) {
        formData.append('duration', uploadForm.duration);
      }

      if (uploadForm.type === 'activity') {
        formData.append('steps', (uploadForm.steps || 5).toString());
        formData.append('minutes', (uploadForm.minutes || 15).toString());
        formData.append('emoji_color', uploadForm.emojiColor || '#d1fae5');
      }

      const res = await fetch('http://localhost:5000/api/content/upload', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });

      const data = await res.json();
      if (data.success) {
        alert('Content uploaded successfully!');
        setUploadForm({
          title: '',
          type: 'video',
          description: '',
          category: '',
          categoryColor: '#f97316',
          emoji: '📹',
          duration: '',
          steps: 5,
          minutes: 15,
          emojiColor: '#d1fae5',
          ageGroup: '4-6',
          level: '1',
          file: null
        });
        // Refresh content list
        const listRes = await fetch('http://localhost:5000/api/content');
        const listData = await listRes.json();
        if (listData.success) setContent(listData.data);
      } else {
        alert(`Upload failed (${res.status}): ${data.message || 'Unknown server error'}`);
      }
    } catch (err) {
      console.error('Error uploading:', err);
      if (err instanceof Error) {
        alert(`Error uploading content: ${err.message}`);
      } else {
        alert('Error uploading content');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-container admin-premium">
      <div className="dashboard-header admin-premium__header">
        <div>
          <p className="admin-premium__eyebrow">Administration</p>
          <h1>🛡️ Admin Dashboard</h1>
        </div>
        <button onClick={logout} className="logout-button admin-premium__logout">Logout</button>
      </div>

      <div className="dashboard-content admin-premium__content">
        <div className="admin-premium__kpis">
          <div className="admin-premium__kpi-card">
            <span>📚</span>
            <div>
              <strong>{content.length}</strong>
              <small>Contenus</small>
            </div>
          </div>
          <div className="admin-premium__kpi-card">
            <span>👥</span>
            <div>
              <strong>{users.length}</strong>
              <small>Utilisateurs</small>
            </div>
          </div>
          <div className="admin-premium__kpi-card">
            <span>✅</span>
            <div>
              <strong>{users.filter((u) => !!u.is_active).length}</strong>
              <small>Actifs</small>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="tabs admin-premium__tabs">
          <button
            className={view === 'content' ? 'tab active admin-premium__tab' : 'tab admin-premium__tab'}
            onClick={() => setView('content')}
          >
            📚 Content List
          </button>
          <button
            className={view === 'upload' ? 'tab active admin-premium__tab' : 'tab admin-premium__tab'}
            onClick={() => setView('upload')}
          >
            ⬆️ Upload Content
          </button>
          <button
            className={view === 'users' ? 'tab active admin-premium__tab' : 'tab admin-premium__tab'}
            onClick={() => setView('users')}
          >
            👥 Users
          </button>
        </div>

        {/* Content List View */}
        {view === 'content' && (
          <div className="content-management admin-premium__section">
            <h2>All Content ({content.length} items)</h2>
            <div className="content-list admin-premium__content-grid">
              {content.length > 0 ? (
                content.map(item => {
                  console.log('[ContentList] Mapping item:', item);
                  return (
                    <ContentCard
                      key={item.id}
                      content={item}
                      onEdit={handleEdit}
                      onDelete={handleDeleteClick}
                    />
                  );
                })
              ) : (
                <p>No content uploaded yet.</p>
              )}
            </div>
          </div>
        )}

        {/* Upload View */}
        {view === 'upload' && (
          <div className="upload-section admin-premium__section">
            <h2>Upload New Content</h2>
            <form onSubmit={handleUploadSubmit} className="upload-form admin-premium__form">
              <div className="form-group">
                <label>File (Video/Audio/Image)*</label>
                <input
                  type="file"
                  onChange={handleFileChange}
                  accept="video/*,audio/*,image/*"
                  required
                />
              </div>

              <div className="form-group">
                <label>Title*</label>
                <input
                  type="text"
                  name="title"
                  value={uploadForm.title}
                  onChange={handleUploadChange}
                  placeholder="Content title"
                  required
                />
              </div>

              <div className="form-group">
                <label>Type*</label>
                <select
                  name="type"
                  value={uploadForm.type}
                  onChange={handleUploadChange}
                >
                  <option value="video">Video</option>
                  <option value="audio">Audio</option>
                  <option value="activity">Activity</option>
                </select>
              </div>

              <div className="form-group">
                <label>Category</label>
                <input
                  type="text"
                  name="category"
                  value={uploadForm.category}
                  onChange={handleUploadChange}
                  placeholder="e.g., Language, Motor Skills"
                />
              </div>

              <div className="form-group">
                <label>Category Color</label>
                <input
                  type="color"
                  name="categoryColor"
                  value={uploadForm.categoryColor || '#f97316'}
                  onChange={handleUploadChange}
                />
              </div>

              <div className="form-group">
                <label>Emoji (e.g., 🎬, 🎵, 🎮)</label>
                <input
                  type="text"
                  name="emoji"
                  value={uploadForm.emoji || ''}
                  onChange={handleUploadChange}
                  placeholder="Select emoji"
                  maxLength={2}
                />
              </div>

              {/* Conditional fields for Videos */}
              {uploadForm.type === 'video' && (
                <div className="form-group">
                  <label>Duration (e.g., 3 min, 5 min)</label>
                  <input
                    type="text"
                    name="duration"
                    value={uploadForm.duration || ''}
                    onChange={handleUploadChange}
                    placeholder="e.g., 5 min"
                  />
                </div>
              )}

              {/* Conditional fields for Activities */}
              {uploadForm.type === 'activity' && (
                <>
                  <div className="form-group">
                    <label>Emoji Color</label>
                    <input
                      type="color"
                      name="emojiColor"
                      value={uploadForm.emojiColor || '#d1fae5'}
                      onChange={handleUploadChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>Number of Steps</label>
                    <input
                      type="number"
                      name="steps"
                      value={uploadForm.steps || 5}
                      onChange={handleUploadChange}
                      min="1"
                      max="20"
                    />
                  </div>
                  <div className="form-group">
                    <label>Duration (minutes)</label>
                    <input
                      type="number"
                      name="minutes"
                      value={uploadForm.minutes || 15}
                      onChange={handleUploadChange}
                      min="1"
                      max="120"
                    />
                  </div>
                </>
              )}

              <div className="form-group">
                <label>Age Group</label>
                <select
                  name="ageGroup"
                  value={uploadForm.ageGroup}
                  onChange={handleUploadChange}
                >
                  <option value="3-5">3-5 years</option>
                  <option value="4-6">4-6 years</option>
                  <option value="5-8">5-8 years</option>
                  <option value="6-8">6-8 years</option>
                </select>
              </div>

              <div className="form-group">
                <label>Difficulty Level</label>
                <select
                  name="level"
                  value={uploadForm.level}
                  onChange={handleUploadChange}
                >
                  <option value="1">1 - Easy</option>
                  <option value="2">2 - Medium</option>
                  <option value="3">3 - Hard</option>
                </select>
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  value={uploadForm.description}
                  onChange={handleUploadChange}
                  placeholder="Content description"
                  rows={4}
                />
              </div>

              <button className="admin-premium__primary-btn" type="submit" disabled={loading}>
                {loading ? 'Uploading...' : 'Upload Content'}
              </button>
            </form>
          </div>
        )}

        {/* Users View */}
        {view === 'users' && (
          <div className="users-management admin-premium__section">
            <h2>User Management</h2>

            <form onSubmit={handleCreateUser} className="upload-form admin-premium__form" style={{ marginBottom: 20 }}>
              <h3>Create User</h3>
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  name="name"
                  value={createUserForm.name}
                  onChange={handleCreateUserChange}
                  placeholder="Full name"
                  required
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={createUserForm.email}
                  onChange={handleCreateUserChange}
                  placeholder="email@example.com"
                  required
                />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  name="password"
                  value={createUserForm.password}
                  onChange={handleCreateUserChange}
                  placeholder="At least 6 characters"
                  minLength={6}
                  required
                />
              </div>
              <div className="form-group">
                <label>Role</label>
                <select
                  name="role"
                  value={createUserForm.role}
                  onChange={handleCreateUserChange}
                >
                  <option value="parent">parent</option>
                  <option value="professional">professional</option>
                  <option value="admin">admin</option>
                </select>
              </div>
              <button className="admin-premium__primary-btn" type="submit" disabled={userActionLoading}>
                {userActionLoading ? 'Creating...' : 'Create User'}
              </button>
            </form>

            <div className="users-list admin-premium__table-wrap">
              {users.length > 0 ? (
                <table className="users-table admin-premium__table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(u => (
                      <tr key={u.id}>
                        <td>
                          {editingUserId === u.id && editingUserForm ? (
                            <input
                              type="text"
                              name="name"
                              value={editingUserForm.name}
                              onChange={handleEditUserChange}
                            />
                          ) : (
                            u.name
                          )}
                        </td>
                        <td>
                          {editingUserId === u.id && editingUserForm ? (
                            <input
                              type="email"
                              name="email"
                              value={editingUserForm.email}
                              onChange={handleEditUserChange}
                            />
                          ) : (
                            u.email
                          )}
                        </td>
                        <td>
                          {editingUserId === u.id && editingUserForm ? (
                            <select
                              name="role"
                              value={editingUserForm.role}
                              onChange={handleEditUserChange}
                            >
                              <option value="parent">parent</option>
                              <option value="professional">professional</option>
                              <option value="admin">admin</option>
                            </select>
                          ) : (
                            u.role
                          )}
                        </td>
                        <td>{u.is_active ? '✅ Active' : '❌ Inactive'}</td>
                        <td style={{ display: 'flex', gap: 8 }}>
                          {editingUserId === u.id ? (
                            <>
                              <button
                                className="admin-premium__small-btn admin-premium__small-btn--primary"
                                type="button"
                                onClick={() => handleEditUserSave(u)}
                                disabled={userActionLoading}
                              >
                                Save
                              </button>
                              <button
                                className="admin-premium__small-btn"
                                type="button"
                                onClick={() => {
                                  setEditingUserId(null);
                                  setEditingUserForm(null);
                                }}
                                disabled={userActionLoading}
                              >
                                Cancel
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                className="admin-premium__small-btn admin-premium__small-btn--primary"
                                type="button"
                                onClick={() => handleEditUserStart(u)}
                                disabled={userActionLoading}
                              >
                                Modifier
                              </button>
                              {u.is_active ? (
                                <button
                                  className="admin-premium__small-btn admin-premium__small-btn--danger"
                                  type="button"
                                  onClick={() => handleUserDelete(u)}
                                  disabled={userActionLoading}
                                >
                                  Retirer
                                </button>
                              ) : (
                                <button
                                  className="admin-premium__small-btn admin-premium__small-btn--success"
                                  type="button"
                                  onClick={() => handleUserReactivate(u)}
                                  disabled={userActionLoading}
                                >
                                  Reactiver
                                </button>
                              )}
                            </>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p>No users found.</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      <EditContentModal
        content={editingContent}
        isOpen={!!editingContent}
        onClose={() => setEditingContent(null)}
        onSave={handleEditSave}
        isLoading={loading}
      />

      {/* Delete Modal */}
      <DeleteContentModal
        contentId={deletingContentId}
        contentTitle={deletingContentTitle}
        isOpen={!!deletingContentId}
        onClose={() => {
          setDeletingContentId(null);
          setDeletingContentTitle('');
        }}
        onConfirm={handleDeleteConfirm}
        isLoading={loading}
      />
    </div>
  );
};
