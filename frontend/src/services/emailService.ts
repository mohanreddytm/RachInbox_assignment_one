import axios from 'axios'
import { Email, EmailSearchParams, EmailSearchResponse, EmailStats } from '../types/email'

const API_BASE_URL = 'https://rachinbox-assignment-one.onrender.com/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
})

export const emailService = {
  // Search emails
  searchEmails: async (params: EmailSearchParams): Promise<EmailSearchResponse> => {
    const response = await api.get('/emails', { params })
    return response.data
  },

  // Get email by ID
  getEmailById: async (id: string): Promise<Email> => {
    const response = await api.get(`/emails/${id}`)
    return response.data
  },

  // Update email category
  updateEmailCategory: async (id: string, category: string): Promise<void> => {
    await api.patch(`/emails/${id}/category`, { category })
  },

  // Generate suggested reply
  generateSuggestedReply: async (id: string): Promise<string> => {
    const response = await api.post(`/emails/${id}/suggest-reply`)
    return response.data.suggestedReply
  },

  // Generate reply options
  generateReplyOptions: async (id: string, count: number = 3): Promise<string[]> => {
    const response = await api.post(`/emails/${id}/suggest-replies`, { count })
    return response.data.replyOptions
  },

  // Analyze sentiment
  analyzeSentiment: async (id: string): Promise<any> => {
    const response = await api.post(`/emails/${id}/analyze-sentiment`)
    return response.data
  },

  // Get email statistics
  getStats: async (): Promise<EmailStats> => {
    const response = await api.get('/emails/stats/overview')
    return response.data
  },

  // Advanced search
  advancedSearch: async (searchParams: any): Promise<EmailSearchResponse> => {
    const response = await api.post('/emails/search', searchParams)
    return response.data
  }
}
