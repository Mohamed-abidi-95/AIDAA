// ============================================================================
// CHILD SELECTION PAGE
// ============================================================================
// Page for parents to select which child they want to manage
// Displayed when parent accesses /parent/dashboard

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import '../styles/ChildSelectionPage.css';

interface Child {
  id: number;
  name: string;
  age: number;
}

export const ChildSelectionPage = (): JSX.Element => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedChildId, setSelectedChildId] = useState<number | null>(null);

  // Fetch children on mount
  useEffect(() => {
    const fetchChildren = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('aidaa_token');
        const res = await fetch('http://localhost:5000/api/child/mychildren', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success && data.data.length > 0) {
          setChildren(data.data);
        }
      } catch (err) {
        console.error('Error fetching children:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchChildren();
  }, []);

  const handleSelectChild = (childId: number) => {
    setSelectedChildId(childId);
    // Store selected child in localStorage for the dashboard to use
    localStorage.setItem('selected_child_id', childId.toString());
    // Navigate to parent dashboard
    navigate('/parent/dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('selected_child_id');
    logout();
  };

  return (
    <div className="child-selection-container">
      {/* Header */}
      <div className="selection-header">
        <h1>👨‍👩‍👧‍👦 Select Your Child</h1>
        <button onClick={handleLogout} className="logout-button">Logout</button>
      </div>

      {/* Content */}
      <div className="selection-content">
        {loading ? (
          <div className="loading-state">
            <p>⏳ Loading your children...</p>
          </div>
        ) : children.length > 0 ? (
          <>
            <p className="selection-instruction">
              Which child would you like to manage today?
            </p>
            <div className="children-grid">
              {children.map((child) => (
                <div
                  key={child.id}
                  className="child-card"
                  onClick={() => handleSelectChild(child.id)}
                  style={{
                    cursor: 'pointer',
                    transform: selectedChildId === child.id ? 'scale(1.05)' : 'scale(1)',
                  }}
                >
                  <div className="child-avatar">
                    👦
                  </div>
                  <div className="child-info">
                    <h2>{child.name}</h2>
                    <p className="child-age">Age: {child.age}</p>
                  </div>
                  <div className="child-action">
                    <button className="select-btn">
                      Select
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="empty-state">
            <p>❌ No children found</p>
            <p className="empty-message">
              You don't have any children registered yet. Please contact an administrator.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChildSelectionPage;

