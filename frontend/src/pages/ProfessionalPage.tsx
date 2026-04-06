// ============================================================================
// PROFESSIONAL/DOCTOR DASHBOARD PAGE
// ============================================================================
// Dashboard for medical professionals to manage patient notes and activity

import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import '../styles/DashboardEnhanced.css';

interface Child {
  id: number;
  name: string;
  age: number;
  parent_id: number;
}

interface Activity {
  id: number;
  content_title: string;
  score: number;
  duration_seconds: number;
  date: string;
}

interface Note {
  id: number;
  content: string;
  date: string;
  professional_name: string;
}

export const ProfessionalPage = (): JSX.Element => {
  const { logout } = useAuth();
  const [children, setChildren] = useState<Child[]>([]);
  const [selectedChild, setSelectedChild] = useState<Child | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNote, setNewNote] = useState('');
  const [view, setView] = useState('patients'); // 'patients', 'activities', 'notes'

  // Fetch all children (professionals can see all)
  useEffect(() => {
    const fetchChildren = async () => {
      try {
        const token = localStorage.getItem('aidaa_token');
        // Professionals use the dedicated endpoint listing all children
        const res = await fetch('http://localhost:5000/api/child/all', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
          setChildren(data.data);
        }
      } catch (err) {
        console.error('Error fetching patients:', err);
      }
    };
    fetchChildren();
  }, []);

  // Fetch activities and notes when child changes
  useEffect(() => {
    if (!selectedChild) return;

    const fetchData = async () => {
      try {
        const token = localStorage.getItem('aidaa_token');

        // Fetch activities
        const activitiesRes = await fetch(
          `http://localhost:5000/api/activity-log/child/${selectedChild.id}`,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        const activitiesData = await activitiesRes.json();
        if (activitiesData.success) setActivities(activitiesData.data);

        // Fetch notes
        const notesRes = await fetch(
          `http://localhost:5000/api/note/child/${selectedChild.id}`,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        const notesData = await notesRes.json();
        if (notesData.success) setNotes(notesData.data);
      } catch (err) {
        console.error('Error fetching data:', err);
      }
    };

    fetchData();
  }, [selectedChild]);

  const handleAddNote = async () => {
    if (!selectedChild || !newNote.trim()) return;

    try {
      const token = localStorage.getItem('aidaa_token');
      const res = await fetch('http://localhost:5000/api/note', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          childId: selectedChild.id,
          content: newNote
        })
      });

      const data = await res.json();
      if (data.success) {
        setNewNote('');
        // Refresh notes
        const notesRes = await fetch(
          `http://localhost:5000/api/note/child/${selectedChild.id}`,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        const notesData = await notesRes.json();
        if (notesData.success) setNotes(notesData.data);
      }
    } catch (err) {
      console.error('Error adding note:', err);
    }
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>👨‍⚕️ Professional Portal</h1>
        <button onClick={logout} className="logout-button">Logout</button>
      </div>

      <div className="dashboard-content">
        {/* Patient Selector */}
        <div className="child-selector">
          <label>Select Patient:</label>
          <select
            value={selectedChild?.id || ''}
            onChange={(e) => {
              const child = children.find(c => c.id === parseInt(e.target.value));
              setSelectedChild(child || null);
            }}
          >
            <option value="">-- Choose a patient --</option>
            {children.map(child => (
              <option key={child.id} value={child.id}>
                {child.name} (Age {child.age})
              </option>
            ))}
          </select>
        </div>

        {selectedChild && (
          <>
            {/* Navigation Tabs */}
            <div className="tabs">
              <button
                className={view === 'patients' ? 'tab active' : 'tab'}
                onClick={() => setView('patients')}
              >
                👥 Patients
              </button>
              <button
                className={view === 'activities' ? 'tab active' : 'tab'}
                onClick={() => setView('activities')}
              >
                📊 Activities
              </button>
              <button
                className={view === 'notes' ? 'tab active' : 'tab'}
                onClick={() => setView('notes')}
              >
                📝 Notes
              </button>
            </div>

            {/* Patient Info View */}
            {view === 'patients' && (
              <div className="patient-info">
                <h2>{selectedChild.name}</h2>
                <div className="info-grid">
                  <div className="info-item">
                    <label>Age:</label>
                    <span>{selectedChild.age} years</span>
                  </div>
                  <div className="info-item">
                    <label>Patient ID:</label>
                    <span>{selectedChild.id}</span>
                  </div>
                  <div className="info-item">
                    <label>Total Activities:</label>
                    <span>{activities.length}</span>
                  </div>
                  <div className="info-item">
                    <label>Total Notes:</label>
                    <span>{notes.length}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Activities View */}
            {view === 'activities' && (
              <div className="activities-view">
                <h2>Patient Activity Log - {selectedChild.name}</h2>
                <div className="activities-list">
                  {activities.length > 0 ? (
                    activities.map(activity => (
                      <div key={activity.id} className="activity-card">
                        <h3>{activity.content_title}</h3>
                        <p>Date: {new Date(activity.date).toLocaleDateString()}</p>
                        <p>Score: {activity.score} | Duration: {Math.round(activity.duration_seconds / 60)} minutes</p>
                      </div>
                    ))
                  ) : (
                    <p>No activities recorded yet.</p>
                  )}
                </div>
              </div>
            )}

            {/* Notes View */}
            {view === 'notes' && (
              <div className="notes-view">
                <h2>Patient Notes - {selectedChild.name}</h2>

                {/* Add Note Form */}
                <div className="add-note-form">
                  <textarea
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="Write your clinical notes here..."
                    rows={4}
                  />
                  <button onClick={handleAddNote}>Add Note</button>
                </div>

                {/* Notes List */}
                <div className="notes-list">
                  {notes.length > 0 ? (
                    notes.map(note => (
                      <div key={note.id} className="note-card">
                        <div className="note-header">
                          <h3>Your Note</h3>
                          <small>{new Date(note.date).toLocaleDateString()}</small>
                        </div>
                        <p className="note-content">{note.content}</p>
                      </div>
                    ))
                  ) : (
                    <p>No notes written yet.</p>
                  )}
                </div>
              </div>
            )}
          </>
        )}

        {children.length === 0 && (
          <div className="empty-state">
            <p>No patients assigned yet. Contact an administrator.</p>
          </div>
        )}
      </div>
    </div>
  );
};
