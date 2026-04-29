// ============================================================================
// useNotifications — hook pour récupérer et gérer les notifications
// ============================================================================
import { useState, useEffect, useCallback } from 'react';
import api from '../../lib/api';

export interface Notification {
  id: number;
  type: string;
  title: string;
  message: string;
  link?: string;
  is_read: number;
  created_at: string;
}

export const useNotifications = (pollInterval = 30000) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount]     = useState(0);
  const [loading, setLoading]             = useState(false);

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/notifications');
      if (res.data.success) {
        setNotifications(res.data.data);
        setUnreadCount(res.data.unreadCount ?? res.data.data.filter((n: Notification) => !n.is_read).length);
      }
    } catch (_) {
      // Silencieux si l'utilisateur n'est pas connecté
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, pollInterval);
    return () => clearInterval(interval);
  }, [fetchNotifications, pollInterval]);

  const markAsRead = async (id: number) => {
    await api.put(`/api/notifications/${id}/read`);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: 1 } : n));
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = async () => {
    await api.put('/api/notifications/read-all');
    setNotifications(prev => prev.map(n => ({ ...n, is_read: 1 })));
    setUnreadCount(0);
  };

  const deleteNotification = async (id: number) => {
    await api.delete(`/api/notifications/${id}`);
    setNotifications(prev => prev.filter(n => n.id !== id));
    fetchNotifications();
  };

  return { notifications, unreadCount, loading, fetchNotifications, markAsRead, markAllAsRead, deleteNotification };
};


