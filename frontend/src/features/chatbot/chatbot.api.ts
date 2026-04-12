// ============================================================================
// CHATBOT API — chatbot.api.ts
// ============================================================================

import api from '../../lib/api';

export interface ChatMessage {
  id?: number;
  sender: 'user' | 'bot';
  message_text: string;
  intent?: 'faq' | 'recommendation' | 'emergency' | 'greeting' | 'unknown';
  created_at?: string;
}

export interface ContentReco {
  id: number;
  title: string;
  type: string;
  emoji?: string;
  description?: string;
  url?: string;
}

export interface ChatResponse {
  success: boolean;
  intent: string;
  response: string;
  suggestions?: string[];
  data?: ContentReco[];
  source?: { category: string; question: string; matchScore: number };
  explainability?: { reason: string; algorithm: string; geminiUsed?: boolean; guardrail?: boolean };
}

export const chatbotApi = {
  getConsentStatus: () =>
    api.get<{ success: boolean; consented: boolean }>('/api/chatbot/consent/status'),

  giveConsent: () =>
    api.post('/api/chatbot/consent', {}),

  startSession: (childId?: number) =>
    api.post<{ success: boolean; data: { sessionId: number } }>('/api/chatbot/session', {
      child_id: childId,
    }),

  sendMessage: (sessionId: number, message: string, lang: 'fr' | 'ar' = 'fr') =>
    api.post<ChatResponse>('/api/chatbot/message', { sessionId, message, lang }),

  getHistory: (sessionId: number) =>
    api.get<{ success: boolean; data: { messages: ChatMessage[] } }>(
      `/api/chatbot/session/${sessionId}/history`
    ),

  endSession: (sessionId: number) =>
    api.delete(`/api/chatbot/session/${sessionId}`),

  getCategories: () =>
    api.get<{ success: boolean; data: string[] }>('/api/chatbot/faq/categories'),
};

