import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useEmail } from '../contexts/EmailContext'
import { EmailSearchParams } from '../types/email'
import EmailCard from '../components/EmailCard'
import SearchFilters from '../components/SearchFilters'
import { ChevronLeft, ChevronRight, RefreshCw, Mail } from 'lucide-react'

const EmailList: React.FC = () => {
  const { emails, loading, error, searchEmails } = useEmail()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useState<EmailSearchParams>({
    page: 1,
    limit: 20,
    sortBy: 'date',
    sortOrder: 'desc'
  })
  const [searchResponse, setSearchResponse] = useState<any>(null)

  useEffect(() => {
    loadEmails()
  }, [])

  const loadEmails = async (params: EmailSearchParams = searchParams) => {
    try {
      const response = await searchEmails(params)
      setSearchResponse(response)
      setSearchParams(params)
    } catch (error) {
      console.error('Failed to load emails:', error)
    }
  }

  const handleSearch = (params: EmailSearchParams) => {
    loadEmails({ ...params, page: 1 })
  }

  const handlePageChange = (page: number) => {
    loadEmails({ ...searchParams, page })
  }

  const handleEmailClick = (emailId: string) => {
    navigate(`/emails/${emailId}`)
  }

  const handleRefresh = () => {
    loadEmails(searchParams)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between text-gray-900 dark:text-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Emails</h1>
          <p className="text-gray-600 dark:text-gray-300">
            {searchResponse ? `${searchResponse.total} emails found` : 'Loading emails...'}
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={loading}
          className="btn btn-outline flex items-center space-x-2"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Search and Filters */}
      <SearchFilters onSearch={handleSearch} loading={loading} />

      {/* Error State */}
      {error && (
        <div className="card p-4 bg-red-50 border-red-200">
          <div className="flex items-center">
            <div className="text-red-600">
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error loading emails</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      )}

      {/* Email List */}
      {!loading && !error && (
        <>
          {emails.length > 0 ? (
            <div className="space-y-4">
              {emails.map((email) => (
                <EmailCard
                  key={email.id}
                  email={email}
                  onClick={() => handleEmailClick(email.id)}
                />
              ))}
            </div>
          ) : (
            <div className="card p-12 text-center">
              <Mail className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No emails found</h3>
              <p className="mt-1 text-sm text-gray-500">
                Try adjusting your search criteria or check your email accounts.
              </p>
            </div>
          )}

          {/* Pagination */}
          {searchResponse && searchResponse.totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
              <div className="flex flex-1 justify-between sm:hidden">
                <button
                  onClick={() => handlePageChange(searchParams.page! - 1)}
                  disabled={searchParams.page === 1}
                  className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => handlePageChange(searchParams.page! + 1)}
                  disabled={searchParams.page === searchResponse.totalPages}
                  className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing{' '}
                    <span className="font-medium">
                      {(searchParams.page! - 1) * searchParams.limit! + 1}
                    </span>{' '}
                    to{' '}
                    <span className="font-medium">
                      {Math.min(searchParams.page! * searchParams.limit!, searchResponse.total)}
                    </span>{' '}
                    of{' '}
                    <span className="font-medium">{searchResponse.total}</span> results
                  </p>
                </div>
                <div>
                  <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                    <button
                      onClick={() => handlePageChange(searchParams.page! - 1)}
                      disabled={searchParams.page === 1}
                      className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    
                    {/* Page numbers */}
                    {Array.from({ length: Math.min(5, searchResponse.totalPages) }, (_, i) => {
                      const pageNum = Math.max(1, searchParams.page! - 2) + i
                      if (pageNum > searchResponse.totalPages) return null
                      
                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                            pageNum === searchParams.page
                              ? 'z-10 bg-primary-600 text-white focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600'
                              : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0'
                          }`}
                        >
                          {pageNum}
                        </button>
                      )
                    })}
                    
                    <button
                      onClick={() => handlePageChange(searchParams.page! + 1)}
                      disabled={searchParams.page === searchResponse.totalPages}
                      className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default EmailList
