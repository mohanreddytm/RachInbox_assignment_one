import React, { useState } from 'react'
import { Search, Filter, X } from 'lucide-react'
import { EmailSearchParams } from '../types/email'

interface SearchFiltersProps {
  onSearch: (params: EmailSearchParams) => void
  loading?: boolean
}

const SearchFilters: React.FC<SearchFiltersProps> = ({ onSearch, loading = false }) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState<Partial<EmailSearchParams>>({
    account: '',
    folder: '',
    category: '',
    from: '',
    to: '',
    dateFrom: '',
    dateTo: ''
  })

  const handleSearch = () => {
    const searchParams: EmailSearchParams = {
      query: searchQuery || undefined,
      ...filters,
      page: 1
    }
    onSearch(searchParams)
  }

  const handleFilterChange = (key: keyof EmailSearchParams, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value || undefined
    }))
  }

  const clearFilters = () => {
    setFilters({
      account: '',
      folder: '',
      category: '',
      from: '',
      to: '',
      dateFrom: '',
      dateTo: ''
    })
    setSearchQuery('')
  }

  const hasActiveFilters = Object.values(filters).some(value => value) || searchQuery

  return (
    <div className="card p-4 mb-6">
      {/* Search Bar */}
      <div className="flex items-center space-x-4 mb-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search emails..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            className="input pl-10"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="btn btn-outline flex items-center space-x-2"
        >
          <Filter className="h-4 w-4" />
          <span>Filters</span>
        </button>
        <button
          onClick={handleSearch}
          disabled={loading}
          className="btn btn-primary"
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <div className="border-t border-gray-200 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Account Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Account
              </label>
              <select
                value={filters.account || ''}
                onChange={(e) => handleFilterChange('account', e.target.value)}
                className="input"
              >
                <option value="">All Accounts</option>
                <option value="Account 1">Account 1</option>
                <option value="Account 2">Account 2</option>
              </select>
            </div>

            {/* Folder Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Folder
              </label>
              <select
                value={filters.folder || ''}
                onChange={(e) => handleFilterChange('folder', e.target.value)}
                className="input"
              >
                <option value="">All Folders</option>
                <option value="INBOX">Inbox</option>
                <option value="Sent">Sent</option>
                <option value="Drafts">Drafts</option>
              </select>
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                value={filters.category || ''}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="input"
              >
                <option value="">All Categories</option>
                <option value="Interested">Interested</option>
                <option value="Meeting Booked">Meeting Booked</option>
                <option value="Not Interested">Not Interested</option>
                <option value="Spam">Spam</option>
                <option value="Out of Office">Out of Office</option>
              </select>
            </div>

            {/* From Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                From
              </label>
              <input
                type="text"
                placeholder="Sender email"
                value={filters.from || ''}
                onChange={(e) => handleFilterChange('from', e.target.value)}
                className="input"
              />
            </div>

            {/* To Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                To
              </label>
              <input
                type="text"
                placeholder="Recipient email"
                value={filters.to || ''}
                onChange={(e) => handleFilterChange('to', e.target.value)}
                className="input"
              />
            </div>

            {/* Date Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date From
              </label>
              <input
                type="date"
                value={filters.dateFrom || ''}
                onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                className="input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date To
              </label>
              <input
                type="date"
                value={filters.dateTo || ''}
                onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                className="input"
              />
            </div>
          </div>

          {/* Filter Actions */}
          <div className="flex items-center justify-between mt-4">
            <button
              onClick={clearFilters}
              className="btn btn-outline flex items-center space-x-2"
            >
              <X className="h-4 w-4" />
              <span>Clear Filters</span>
            </button>
            
            <div className="flex items-center space-x-2">
              {hasActiveFilters && (
                <span className="text-sm text-gray-500">
                  {Object.values(filters).filter(Boolean).length} filter(s) active
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SearchFilters
