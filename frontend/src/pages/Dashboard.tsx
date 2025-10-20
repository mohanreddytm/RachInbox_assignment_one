import React, { useEffect, useState } from 'react'
import { useEmail } from '../contexts/EmailContext'
import { BarChart3, Mail, Users, TrendingUp, AlertCircle } from 'lucide-react'

const Dashboard: React.FC = () => {
  const { stats, refreshStats, loading } = useEmail()
  const [recentEmails, setRecentEmails] = useState<any[]>([])

  useEffect(() => {
    refreshStats()
    // Load recent emails
    loadRecentEmails()
  }, [])

  const loadRecentEmails = async () => {
    try {
      const response = await fetch('https://rachinbox-assignment-one.onrender.com/api/emails?limit=5&sortBy=date&sortOrder=desc')
      const data = await response.json()
      setRecentEmails(data.emails || [])
    } catch (error) {
      console.error('Failed to load recent emails:', error)
      // Fallback mock data
      setRecentEmails([
        {
          id: '1',
          subject: 'Welcome to ReachInbox!',
          from: 'support@reachinbox.com',
          category: 'Interested',
          date: new Date().toISOString()
        },
        {
          id: '2',
          subject: 'Meeting Request - Project Discussion',
          from: 'john.doe@company.com',
          category: 'Meeting Booked',
          date: new Date(Date.now() - 86400000).toISOString()
        },
        {
          id: '3',
          subject: 'Newsletter - Weekly Updates',
          from: 'newsletter@technews.com',
          category: 'Not Interested',
          date: new Date(Date.now() - 172800000).toISOString()
        }
      ])
    }
  }

  const getCategoryColor = (category: string) => {
    const colors = {
      'Interested': 'text-green-600 bg-green-100',
      'Meeting Booked': 'text-blue-600 bg-blue-100',
      'Not Interested': 'text-gray-600 bg-gray-100',
      'Spam': 'text-red-600 bg-red-100',
      'Out of Office': 'text-yellow-600 bg-yellow-100'
    }
    return colors[category as keyof typeof colors] || 'text-gray-600 bg-gray-100'
  }

  // Helper function to get category count from stats
  const getCategoryCount = (category: string, statsData: any) => {
    if (!statsData?.byCategory) return 0
    const categoryData = statsData.byCategory.find((item: any) => item.key === category)
    return categoryData?.doc_count || 0
  }


  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Fallback data for demonstration
  const fallbackStats = {
    totalEmails: 3,
    byCategory: [
      { key: 'Interested', doc_count: 1 },
      { key: 'Meeting Booked', doc_count: 1 },
      { key: 'Not Interested', doc_count: 1 }
    ],
    byAccount: [
      { key: 'Account 1', doc_count: 2 },
      { key: 'Account 2', doc_count: 1 }
    ],
    byFolder: [
      { key: 'INBOX', doc_count: 3 }
    ]
  }

  const displayStats = stats || fallbackStats

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-300">Overview of your email aggregation</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card p-6">
          <div className="flex items-center">
            <div className="p-2 bg-primary-100 dark:bg-primary-900/40 rounded-lg">
              <Mail className="h-6 w-6 text-primary-600 dark:text-primary-300" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Emails</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {displayStats.totalEmails}
              </p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-300" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Interested</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {getCategoryCount('Interested', displayStats)}
              </p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <BarChart3 className="h-6 w-6 text-blue-600 dark:text-blue-300" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Meetings</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {getCategoryCount('Meeting Booked', displayStats)}
              </p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
              <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-300" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Spam</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {getCategoryCount('Spam', displayStats)}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Distribution */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Email Categories</h3>
          <div className="space-y-3">
            {(displayStats.byCategory && Array.isArray(displayStats.byCategory) ? displayStats.byCategory : []).map((item: any) => (
              <div key={item.key} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(item.key)}`}>
                    {item.key}
                  </span>
                </div>
                <span className="font-semibold text-gray-900">{item.doc_count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Account Distribution */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Distribution</h3>
          <div className="space-y-3">
            {(displayStats.byAccount && Array.isArray(displayStats.byAccount) ? displayStats.byAccount : []).map((item: any) => (
              <div key={item.key} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-700">{item.key}</span>
                </div>
                <span className="font-semibold text-gray-900">{item.doc_count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Emails */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Emails</h3>
        <div className="space-y-3">
          {recentEmails.length > 0 ? (
            recentEmails.map((email) => (
              <div key={email.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="font-medium text-gray-900 dark:text-gray-100">{email.from}</span>
                    {email.category && (
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(email.category)}`}>
                        {email.category}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 truncate">{email.subject}</p>
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-300">
                  {formatDate(email.date)}
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center py-4">No recent emails found</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default Dashboard
