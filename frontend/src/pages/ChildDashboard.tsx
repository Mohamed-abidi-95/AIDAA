// ============================================================================
// CHILD DASHBOARD / CHILD SPACE - PROTOTYPE DESIGN
// ============================================================================
// Main space for autistic children to play games and watch content
// Beautiful, child-friendly interface with videos and activities

import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Video, Activity } from '../types/content.types';
import '../styles/ChildDashboard.css';

const BACKEND_BASE_URL = 'http://localhost:5000';

const getMediaUrl = (url?: string): string | null => {
  if (!url) return null;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `${BACKEND_BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
};

// ============================================================================
// TYPES
// ============================================================================
// ...existing code...

// ============================================================================
// VIDEO CARD COMPONENT
// ============================================================================

function VideoCard({ video }: { video: Video }): JSX.Element {
  const [hovered, setHovered] = useState(false);
  const mediaUrl = getMediaUrl(video.url);

  const handleWatch = () => {
    if (!mediaUrl) return;
    window.open(mediaUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: '#fff',
        borderRadius: 20,
        overflow: 'hidden',
        boxShadow: hovered
          ? '0 8px 32px rgba(56,178,172,0.18)'
          : '0 2px 12px rgba(0,0,0,0.06)',
        transition: 'box-shadow 0.25s, transform 0.25s',
        transform: hovered ? 'translateY(-4px)' : 'none',
        display: 'flex',
        flexDirection: 'column',
        minWidth: 0,
        cursor: 'pointer',
      } as React.CSSProperties}
    >
      {/* Thumbnail / Video preview */}
      <div
        style={{
          background: 'linear-gradient(135deg, #e0f7fa 0%, #b2ebf2 100%)',
          height: 160,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 64,
          overflow: 'hidden',
        }}
      >
        {mediaUrl ? (
          <video
            src={mediaUrl}
            controls
            preload="metadata"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          video.emoji
        )}
      </div>

      {/* Info */}
      <div style={{ padding: '14px 16px 16px' }}>
        <p
          style={{
            margin: '0 0 10px',
            fontWeight: 700,
            fontSize: 15,
            color: '#1e3a5f',
            lineHeight: 1.3,
            minHeight: 40,
          }}
        >
          {video.title}
        </p>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            marginBottom: 14,
          }}
        >
          <span
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              fontSize: 12,
              color: '#64748b',
            }}
          >
            <span style={{ fontSize: 13 }}>🎯</span>
            {video.category}
          </span>
          <span
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              fontSize: 12,
              color: '#64748b',
            }}
          >
            <span style={{ fontSize: 13 }}>⏱️</span>
            {video.duration}
          </span>
        </div>

        <button
          type="button"
          onClick={handleWatch}
          disabled={!mediaUrl}
          style={{
            width: '100%',
            padding: '11px 0',
            borderRadius: 10,
            border: 'none',
            background: 'linear-gradient(90deg, #38b2ac 0%, #2dd4bf 100%)',
            color: '#fff',
            fontWeight: 700,
            fontSize: 15,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            letterSpacing: 0.3,
            opacity: mediaUrl ? 1 : 0.6,
          }}
        >
          {mediaUrl ? '▶ Regarder' : '⏳ Vidéo indisponible'}
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// ACTIVITY CARD COMPONENT
// ============================================================================

function ActivityCard({ activity }: { activity: Activity }): JSX.Element {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: '#fff',
        borderRadius: 20,
        padding: '18px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        boxShadow: hovered
          ? '0 8px 28px rgba(56,178,172,0.15)'
          : '0 2px 10px rgba(0,0,0,0.06)',
        transition: 'box-shadow 0.25s, transform 0.25s',
        transform: hovered ? 'translateY(-3px)' : 'none',
        cursor: 'pointer',
      } as React.CSSProperties}
    >
      {/* Icon */}
      <div
        style={{
          width: 54,
          height: 54,
          borderRadius: 14,
          background: activity.emojiColor,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 28,
          flexShrink: 0,
        }}
      >
        {activity.emoji}
      </div>

      {/* Text */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p
          style={{
            margin: '0 0 4px',
            fontWeight: 700,
            fontSize: 15,
            color: '#1e3a5f',
          }}
        >
          {activity.title}
        </p>
        <p style={{ margin: 0, fontSize: 13, color: '#94a3b8' }}>
          {activity.steps} étapes • {activity.minutes} minutes
        </p>
      </div>

      {/* CTA */}
      <button
        style={{
          padding: '10px 20px',
          borderRadius: 10,
          border: 'none',
          background: 'linear-gradient(90deg, #38b2ac 0%, #2dd4bf 100%)',
          color: '#fff',
          fontWeight: 700,
          fontSize: 14,
          cursor: 'pointer',
          whiteSpace: 'nowrap',
          flexShrink: 0,
        }}
      >
        Commencer
      </button>
    </div>
  );
}

// ============================================================================
// MAIN CHILD DASHBOARD
// ============================================================================

export const ChildDashboard = (): JSX.Element => {
  const { logout } = useAuth();
  const [videos, setVideos] = useState<Video[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch content on mount
  useEffect(() => {
    const fetchContent = async () => {
      try {
        setLoading(true);

        // Fetch videos
        const videosRes = await fetch('http://localhost:5000/api/content?type=video');
        const videosData = await videosRes.json();
        if (videosData.success && videosData.data) {
          setVideos(videosData.data);
        }

        // Fetch activities
        const activitiesRes = await fetch('http://localhost:5000/api/content?type=activity');
        const activitiesData = await activitiesRes.json();
        if (activitiesData.success && activitiesData.data) {
          setActivities(activitiesData.data);
        }
      } catch (err) {
        console.error('Error loading content:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, []);

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(160deg, #eef6fb 0%, #e8f4f8 60%, #ede9f6 100%)',
        fontFamily: "'Nunito', 'Quicksand', 'Segoe UI', sans-serif",
        padding: '0 0 40px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Decorative blobs */}
      <div
        style={{
          position: 'absolute',
          top: -60,
          left: -60,
          width: 240,
          height: 240,
          borderRadius: '50%',
          background: 'rgba(99,210,220,0.12)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: 80,
          right: -40,
          width: 180,
          height: 180,
          borderRadius: '50%',
          background: 'rgba(167,139,250,0.12)',
          pointerEvents: 'none',
        }}
      />

      {/* ── HEADER ── */}
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '24px 40px 20px',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* Avatar + Greeting */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div
            style={{
              width: 60,
              height: 60,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #fbbf24 0%, #f97316 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 30,
              boxShadow: '0 4px 14px rgba(251,191,36,0.4)',
            }}
          >
            😊
          </div>
          <div>
            <h1
              style={{
                margin: 0,
                fontSize: 24,
                fontWeight: 800,
                color: '#1e3a5f',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              Bonjour Mohamed 👋
            </h1>
            <p style={{ margin: 0, fontSize: 14, color: '#94a3b8', fontWeight: 500 }}>
              Prêt pour de nouvelles aventures ?
            </p>
          </div>
        </div>

        {/* Stats + Logout */}
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: '#fff',
              borderRadius: 50,
              padding: '10px 20px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.07)',
              fontWeight: 700,
              fontSize: 15,
              color: '#1e3a5f',
            }}
          >
            ⭐ 12 étoiles
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: '#fff',
              borderRadius: 50,
              padding: '10px 20px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.07)',
              fontWeight: 700,
              fontSize: 15,
              color: '#1e3a5f',
            }}
          >
            🏅 5 badges
          </div>
          <button
            onClick={logout}
            style={{
              padding: '10px 20px',
              background: 'linear-gradient(90deg, #ef4444 0%, #dc2626 100%)',
              color: '#fff',
              border: 'none',
              borderRadius: 50,
              fontWeight: 700,
              fontSize: 15,
              cursor: 'pointer',
            }}
          >
            Déconnexion
          </button>
        </div>
      </header>

      {/* ── LOADING STATE ── */}
      {loading && (
        <div
          style={{
            padding: '40px',
            textAlign: 'center',
            color: '#1e3a5f',
            fontSize: 18,
            fontWeight: 700,
          }}
        >
          ⏳ Chargement du contenu...
        </div>
      )}

      {/* ── MAIN CONTENT ── */}
      {!loading && (
        <main style={{ padding: '0 40px', position: 'relative', zIndex: 1 }}>
          {/* Videos Section */}
          {videos.length > 0 && (
            <section style={{ marginBottom: 44 }}>
              <h2
                style={{
                  fontSize: 20,
                  fontWeight: 800,
                  color: '#1e3a5f',
                  margin: '0 0 20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                }}
              >
                📺 Vidéos pour toi
              </h2>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: 20,
                }}
              >
                {videos.map((v) => (
                  <VideoCard key={v.id} video={v} />
                ))}
              </div>
            </section>
          )}

          {/* Activities Section */}
          {activities.length > 0 && (
            <section>
              <h2
                style={{
                  fontSize: 20,
                  fontWeight: 800,
                  color: '#1e3a5f',
                  margin: '0 0 20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                }}
              >
                🎯 Mes activités
              </h2>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                  gap: 20,
                }}
              >
                {activities.map((a) => (
                  <ActivityCard key={a.id} activity={a} />
                ))}
              </div>
            </section>
          )}

          {/* Empty State */}
          {!loading && videos.length === 0 && activities.length === 0 && (
            <div
              style={{
                padding: '40px',
                textAlign: 'center',
                color: '#64748b',
                fontSize: 18,
              }}
            >
              <p>Aucun contenu disponible pour le moment. 😢</p>
              <p style={{ fontSize: 14, marginTop: 10 }}>Revenez bientôt pour découvrir de nouvelles vidéos et activités!</p>
            </div>
          )}
        </main>
      )}
    </div>
  );
};


