import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { Email, EmailSearchParams, EmailSearchResponse, EmailStats } from '../types/email'
import { emailService } from '../services/emailService'

interface EmailContextType {
  emails: Email[]
  loading: boolean
  error: string | null
  stats: EmailStats | null
  searchEmails: (params: EmailSearchParams) => Promise<EmailSearchResponse>
  getEmailById: (id: string) => Promise<Email | null>
  updateEmailCategory: (id: string, category: string) => Promise<void>
  generateSuggestedReply: (id: string) => Promise<string>
  generateReplyOptions: (id: string, count?: number) => Promise<string[]>
  analyzeSentiment: (id: string) => Promise<any>
  refreshStats: () => Promise<void>
}

const EmailContext = createContext<EmailContextType | undefined>(undefined)

export const useEmail = () => {
  const context = useContext(EmailContext)
  if (!context) {
    throw new Error('useEmail must be used within an EmailProvider')
  }
  return context
}

interface EmailProviderProps {
  children: ReactNode
}

export const EmailProvider: React.FC<EmailProviderProps> = ({ children }) => {
  const [emails, setEmails] = useState<Email[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState<EmailStats | null>(null)

  const searchEmails = async (params: EmailSearchParams): Promise<EmailSearchResponse> => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await emailService.searchEmails(params)
      setEmails(response.emails)
      return response
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to search emails'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const getEmailById = async (id: string): Promise<Email | null> => {
    try {
      return await emailService.getEmailById(id)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get email'
      setError(errorMessage)
      return null
    }
  }

  const updateEmailCategory = async (id: string, category: string): Promise<void> => {
    try {
      await emailService.updateEmailCategory(id, category)
      
      // Update local state
      setEmails(prev => prev.map(email => 
        email.id === id ? { ...email, category: category as any } : email
      ))
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update category'
      setError(errorMessage)
      throw err
    }
  }

  const generateSuggestedReply = async (id: string): Promise<string> => {
    try {
      return await emailService.generateSuggestedReply(id)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate reply'
      setError(errorMessage)
      throw err
    }
  }

  const generateReplyOptions = async (id: string, count: number = 3): Promise<string[]> => {
    try {
      return await emailService.generateReplyOptions(id, count)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate reply options'
      setError(errorMessage)
      throw err
    }
  }

  const analyzeSentiment = async (id: string): Promise<any> => {
    try {
      return await emailService.analyzeSentiment(id)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to analyze sentiment'
      setError(errorMessage)
      throw err
    }
  }

  const refreshStats = async (): Promise<void> => {
    try {
      const statsData = await emailService.getStats()
      setStats(statsData)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get stats'
      setError(errorMessage)
    }
  }

  // Load initial data
  useEffect(() => {
    refreshStats()
  }, [])

  const value: EmailContextType = {
    emails,
    loading,
    error,
    stats,
    searchEmails,
    getEmailById,
    updateEmailCategory,
    generateSuggestedReply,
    generateReplyOptions,
    analyzeSentiment,
    refreshStats
  }

  return (
    <EmailContext.Provider value={value}>
      {children}
    </EmailContext.Provider>
  )
}
