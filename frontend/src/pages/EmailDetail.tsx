import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useEmail } from '../contexts/EmailContext'
import { Email } from '../types/email'
import { ArrowLeft, Mail, Paperclip, Bot, MessageSquare, BarChart3, RefreshCw } from 'lucide-react'

const EmailDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { getEmailById, updateEmailCategory, generateSuggestedReply, generateReplyOptions, analyzeSentiment } = useEmail()
  
  const [email, setEmail] = useState<Email | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [suggestedReply, setSuggestedReply] = useState<string>('')
  const [replyOptions, setReplyOptions] = useState<string[]>([])
  const [sentiment, setSentiment] = useState<any>(null)
  const [aiLoading, setAiLoading] = useState(false)

  useEffect(() => {
    if (id) {
      loadEmail()
    }
  }, [id])

  const loadEmail = async () => {
    if (!id) return
    
    setLoading(true)
    setError(null)
    
    try {
      const emailData = await getEmailById(id)
      if (emailData) {
        setEmail(emailData)
      } else {
        setError('Email not found')
      }
    } catch (err) {
      setError('Failed to load email')
    } finally {
      setLoading(false)
    }
  }

  const handleCategoryChange = async (category: string) => {
    if (!email || !id) return
    
    try {
      await updateEmailCategory(id, category)
      setEmail({ ...email, category: category as any })
    } catch (err) {
      console.error('Failed to update category:', err)
    }
  }

  const handleGenerateReply = async () => {
    if (!id) return
    
    setAiLoading(true)
    try {
      const reply = await generateSuggestedReply(id)
      setSuggestedReply(reply)
    } catch (err) {
      console.error('Failed to generate reply:', err)
    } finally {
      setAiLoading(false)
    }
  }

  const handleGenerateReplyOptions = async () => {
    if (!id) return
    
    setAiLoading(true)
    try {
      const options = await generateReplyOptions(id, 3)
      setReplyOptions(options)
    } catch (err) {
      console.error('Failed to generate reply options:', err)
    } finally {
      setAiLoading(false)
    }
  }

  const handleAnalyzeSentiment = async () => {
    if (!id) return
    
    setAiLoading(true)
    try {
      const sentimentData = await analyzeSentiment(id)
      setSentiment(sentimentData)
    } catch (err) {
      console.error('Failed to analyze sentiment:', err)
    } finally {
      setAiLoading(false)
    }
  }

  const getCategoryBadge = (category?: string) => {
    if (!category) return null
    
    const badgeClasses = {
      'Interested': 'badge badge-interested',
      'Meeting Booked': 'badge badge-meeting',
      'Not Interested': 'badge badge-not-interested',
      'Spam': 'badge badge-spam',
      'Out of Office': 'badge badge-out-of-office'
    }
    
    return (
      <span className={badgeClasses[category as keyof typeof badgeClasses] || 'badge badge-not-interested'}>
        {category}
      </span>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (error || !email) {
    return (
      <div className="card p-8 text-center">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Email Not Found</h2>
        <p className="text-gray-600 mb-4">{error || 'The requested email could not be found.'}</p>
        <button
          onClick={() => navigate('/emails')}
          className="btn btn-primary"
        >
          Back to Emails
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/emails')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{email.subject}</h1>
            <p className="text-gray-600">
              From {email.from} • {formatDate(email.date)}
            </p>
          </div>
        </div>
        <button
          onClick={loadEmail}
          className="btn btn-outline flex items-center space-x-2"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Refresh</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Email Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Email Header */}
          <div className="card p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-primary-100 rounded-lg">
                  <Mail className="h-5 w-5 text-primary-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{email.from}</p>
                  <p className="text-sm text-gray-600">to {email.to}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {getCategoryBadge(email.category)}
                <span className="text-sm text-gray-500">{email.account}</span>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <div className="prose max-w-none">
                {email.html ? (
                  <div dangerouslySetInnerHTML={{ __html: email.html }} />
                ) : (
                  <div className="whitespace-pre-wrap text-gray-900">
                    {email.text}
                  </div>
                )}
              </div>
            </div>

            {/* Attachments */}
            {email.attachments && email.attachments.length > 0 && (
              <div className="border-t border-gray-200 pt-4 mt-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Attachments</h4>
                <div className="space-y-2">
                  {email.attachments.map((attachment, index) => (
                    <div key={index} className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg">
                      <Paperclip className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-700">{attachment.filename}</span>
                      <span className="text-xs text-gray-500">
                        ({(attachment.size / 1024).toFixed(1)} KB)
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* AI Features */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Bot className="h-5 w-5 mr-2" />
              AI Assistant
            </h3>
            
            <div className="space-y-4">
              {/* Sentiment Analysis */}
              <div>
                <button
                  onClick={handleAnalyzeSentiment}
                  disabled={aiLoading}
                  className="btn btn-outline flex items-center space-x-2"
                >
                  <BarChart3 className="h-4 w-4" />
                  <span>Analyze Sentiment</span>
                </button>
                {sentiment && (
                  <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm">
                      <span className="font-medium">Sentiment:</span> {sentiment.sentiment} 
                      <span className="ml-2 text-gray-600">(Confidence: {(sentiment.confidence * 100).toFixed(1)}%)</span>
                    </p>
                    <p className="text-sm text-gray-600 mt-1">{sentiment.summary}</p>
                  </div>
                )}
              </div>

              {/* Suggested Reply */}
              <div>
                <button
                  onClick={handleGenerateReply}
                  disabled={aiLoading}
                  className="btn btn-outline flex items-center space-x-2"
                >
                  <MessageSquare className="h-4 w-4" />
                  <span>Generate Reply</span>
                </button>
                {suggestedReply && (
                  <div className="mt-2 p-3 bg-blue-50 rounded-lg">
                    <h4 className="text-sm font-medium text-blue-900 mb-2">Suggested Reply:</h4>
                    <p className="text-sm text-blue-800 whitespace-pre-wrap">{suggestedReply}</p>
                  </div>
                )}
              </div>

              {/* Reply Options */}
              <div>
                <button
                  onClick={handleGenerateReplyOptions}
                  disabled={aiLoading}
                  className="btn btn-outline flex items-center space-x-2"
                >
                  <MessageSquare className="h-4 w-4" />
                  <span>Generate Reply Options</span>
                </button>
                {replyOptions.length > 0 && (
                  <div className="mt-2 space-y-2">
                    {replyOptions.map((option, index) => (
                      <div key={index} className="p-3 bg-green-50 rounded-lg">
                        <h4 className="text-sm font-medium text-green-900 mb-1">Option {index + 1}:</h4>
                        <p className="text-sm text-green-800 whitespace-pre-wrap">{option}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {aiLoading && (
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
                  <span>AI is working...</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Category Management */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Category</h3>
            <div className="space-y-2">
              {['Interested', 'Meeting Booked', 'Not Interested', 'Spam', 'Out of Office'].map((category) => (
                <button
                  key={category}
                  onClick={() => handleCategoryChange(category)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                    email.category === category
                      ? 'bg-primary-100 text-primary-700 font-medium'
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Email Metadata */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Details</h3>
            <div className="space-y-3 text-sm">
              <div>
                <span className="font-medium text-gray-700">Message ID:</span>
                <p className="text-gray-600 break-all">{email.messageId}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Folder:</span>
                <p className="text-gray-600">{email.folder}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Account:</span>
                <p className="text-gray-600">{email.account}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Created:</span>
                <p className="text-gray-600">{formatDate(email.createdAt)}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Updated:</span>
                <p className="text-gray-600">{formatDate(email.updatedAt)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EmailDetail
