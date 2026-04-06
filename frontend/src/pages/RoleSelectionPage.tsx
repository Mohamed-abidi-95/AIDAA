// ============================================================================
// ROLE SELECTION PAGE
// ============================================================================
// Page de sélection du rôle après login (Parent vs Child)

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/RoleSelection.css';

export const RoleSelectionPage = (): JSX.Element => {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState<'parent' | 'child' | null>(null);

  const handleRoleSelect = (role: 'parent' | 'child'): void => {
    setSelectedRole(role);

    // Redirect based on selection
    setTimeout(() => {
      if (role === 'parent') {
        navigate('/parent/dashboard');
      } else {
        navigate('/child');
      }
    }, 300);
  };

  return (
    <div className="role-selection-container">
      {/* Left side - Parent */}
      <div
        className={`role-section parent-section ${selectedRole === 'parent' ? 'selected' : ''}`}
        onClick={() => handleRoleSelect('parent')}
      >
        <div className="role-content">
          <div className="role-icon">👨‍👩‍👧</div>
          <h2>Parent Mode</h2>
          <p>Track your child's progress</p>
          <p className="role-description">
            View activities, medical notes, and monitor your child's learning journey
          </p>
          <button className="role-button">
            Continue as Parent
          </button>
        </div>
      </div>

      {/* Divider */}
      <div className="divider"></div>

      {/* Right side - Child */}
      <div
        className={`role-section child-section ${selectedRole === 'child' ? 'selected' : ''}`}
        onClick={() => handleRoleSelect('child')}
      >
        <div className="role-content">
          <div className="role-icon">👧</div>
          <h2>Child Mode</h2>
          <p>Play games and learn</p>
          <p className="role-description">
            Play fun games, watch videos, and enjoy your learning experience
          </p>
          <button className="role-button">
            Continue as Child
          </button>
        </div>
      </div>

      {/* Loading indicator */}
      {selectedRole && (
        <div className="loading-indicator">
          <div className="spinner"></div>
        </div>
      )}
    </div>
  );
};


