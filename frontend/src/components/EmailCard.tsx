import React from 'react'
import { format } from 'date-fns'
import { Mail, Paperclip, Eye } from 'lucide-react'
import { Email } from '../types/email'

interface EmailCardProps {
  email: Email
  onClick: () => void
}

const EmailCard: React.FC<EmailCardProps> = ({ email, onClick }) => {
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
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    
    if (diffInHours < 24) {
      return format(date, 'HH:mm')
    } else if (diffInHours < 168) { // 7 days
      return format(date, 'EEE')
    } else {
      return format(date, 'MMM d')
    }
  }

  const truncateText = (text: string, maxLength: number = 150) => {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + '...'
  }

  return (
    <div 
      className="card p-4 hover:shadow-md transition-shadow cursor-pointer border-l-4 border-l-primary-500 dark:border-l-primary-400"
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center space-x-2">
          <Mail className="h-4 w-4 text-gray-400 dark:text-gray-300" />
          <span className="font-medium text-gray-900 dark:text-gray-100">{email.from}</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500 dark:text-gray-300">{formatDate(email.date)}</span>
          {!email.isRead && (
            <div className="w-2 h-2 bg-primary-500 dark:bg-primary-400 rounded-full"></div>
          )}
        </div>
      </div>
      
      <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 line-clamp-1">
        {email.subject}
      </h3>
      
      <p className="text-gray-600 dark:text-gray-300 text-sm mb-3 line-clamp-2">
        {truncateText(email.text)}
      </p>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {getCategoryBadge(email.category)}
          <span className="text-xs text-gray-500 dark:text-gray-300">{email.account}</span>
          <span className="text-xs text-gray-500 dark:text-gray-300">•</span>
          <span className="text-xs text-gray-500 dark:text-gray-300">{email.folder}</span>
        </div>
        
        <div className="flex items-center space-x-1">
          {email.attachments && email.attachments.length > 0 && (
            <Paperclip className="h-4 w-4 text-gray-400 dark:text-gray-300" />
          )}
          <Eye className="h-4 w-4 text-gray-400 dark:text-gray-300" />
        </div>
      </div>
    </div>
  )
}

export default EmailCard
