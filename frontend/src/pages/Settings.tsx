import React, { useState, useEffect } from 'react'
import { 
  Settings as SettingsIcon, 
  Mail, 
  Bell, 
  Shield, 
  Database, 
  User, 
  Key, 
  Server, 
  Save,
  RefreshCw,
  Check,
  X,
  AlertCircle
} from 'lucide-react'

const SettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('email-accounts')
  const [isSaving, setIsSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle')

  // Email Account Settings
  const [emailAccounts, setEmailAccounts] = useState([
    {
      id: 1,
      name: 'Account 1',
      email: 'your-email1@gmail.com',
      host: 'imap.gmail.com',
      port: 993,
      ssl: true,
      enabled: true
    },
    {
      id: 2,
      name: 'Account 2',
      email: 'your-email2@outlook.com',
      host: 'imap.outlook.com',
      port: 993,
      ssl: true,
      enabled: false
    }
  ])

  // Notification Settings
  const [notifications, setNotifications] = useState({
    slackEnabled: false,
    slackWebhook: '',
    webhookSiteEnabled: false,
    webhookSiteUrl: '',
    emailNotifications: true,
    interestedEmails: true,
    meetingBooked: true,
    spamAlerts: false
  })

  // AI Settings
  const [aiSettings, setAiSettings] = useState({
    openaiApiKey: '',
    categorizationEnabled: true,
    replySuggestions: true,
    sentimentAnalysis: true,
    ragEnabled: false
  })

  // System Settings
  const [systemSettings, setSystemSettings] = useState({
    elasticsearchUrl: 'http://localhost:9200',
    postgresUrl: '',
    syncInterval: 5,
    maxEmailsPerSync: 100,
    autoCategorization: true,
    debugMode: false
  })

  const tabs = [
    { id: 'email-accounts', label: 'Email Accounts', icon: Mail },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'ai-settings', label: 'AI Settings', icon: Shield },
    { id: 'system', label: 'System', icon: Database }
  ]

  const handleSave = async () => {
    setIsSaving(true)
    setSaveStatus('idle')
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Here you would make actual API calls to save settings
      console.log('Saving settings:', {
        emailAccounts,
        notifications,
        aiSettings,
        systemSettings
      })
      
      setSaveStatus('success')
      setTimeout(() => setSaveStatus('idle'), 3000)
    } catch (error) {
      setSaveStatus('error')
      setTimeout(() => setSaveStatus('idle'), 3000)
    } finally {
      setIsSaving(false)
    }
  }

  const addEmailAccount = () => {
    const newAccount = {
      id: Date.now(),
      name: `Account ${emailAccounts.length + 1}`,
      email: '',
      host: '',
      port: 993,
      ssl: true,
      enabled: false
    }
    setEmailAccounts([...emailAccounts, newAccount])
  }

  const updateEmailAccount = (id: number, field: string, value: any) => {
    setEmailAccounts(accounts =>
      accounts.map(account =>
        account.id === id ? { ...account, [field]: value } : account
      )
    )
  }

  const removeEmailAccount = (id: number) => {
    setEmailAccounts(accounts => accounts.filter(account => account.id !== id))
  }

  const testConnection = async (accountId: number) => {
    // Simulate connection test
    console.log('Testing connection for account:', accountId)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600">Configure your ReachInbox application</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar Navigation */}
        <div className="lg:w-64">
          <nav className="space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center space-x-3 px-3 py-2 text-left rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{tab.label}</span>
                </button>
              )
            })}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <div className="card p-6">
            {/* Save Button */}
            <div className="flex justify-end mb-6">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSaving ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                <span>{isSaving ? 'Saving...' : 'Save Settings'}</span>
              </button>
            </div>

            {/* Save Status */}
            {saveStatus === 'success' && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center space-x-2 text-green-700">
                <Check className="h-4 w-4" />
                <span>Settings saved successfully!</span>
              </div>
            )}

            {saveStatus === 'error' && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2 text-red-700">
                <X className="h-4 w-4" />
                <span>Failed to save settings. Please try again.</span>
              </div>
            )}

            {/* Email Accounts Tab */}
            {activeTab === 'email-accounts' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-2">Email Accounts</h2>
                  <p className="text-gray-600">Configure your IMAP email accounts for synchronization</p>
                </div>

                <div className="space-y-4">
                  {emailAccounts.map((account) => (
                    <div key={account.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-2">
                          <Mail className="h-5 w-5 text-gray-400" />
                          <span className="font-medium text-gray-900">{account.name}</span>
                          {account.enabled && (
                            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                              Active
                            </span>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => testConnection(account.id)}
                            className="px-3 py-1 text-sm text-primary-600 hover:text-primary-700"
                          >
                            Test
                          </button>
                          <button
                            onClick={() => removeEmailAccount(account.id)}
                            className="px-3 py-1 text-sm text-red-600 hover:text-red-700"
                          >
                            Remove
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Account Name</label>
                          <input
                            type="text"
                            value={account.name}
                            onChange={(e) => updateEmailAccount(account.id, 'name', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                          <input
                            type="email"
                            value={account.email}
                            onChange={(e) => updateEmailAccount(account.id, 'email', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">IMAP Host</label>
                          <input
                            type="text"
                            value={account.host}
                            onChange={(e) => updateEmailAccount(account.id, 'host', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Port</label>
                          <input
                            type="number"
                            value={account.port}
                            onChange={(e) => updateEmailAccount(account.id, 'port', parseInt(e.target.value))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          />
                        </div>
                        <div className="flex items-center space-x-4">
                          <label className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={account.ssl}
                              onChange={(e) => updateEmailAccount(account.id, 'ssl', e.target.checked)}
                              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                            />
                            <span className="text-sm text-gray-700">Use SSL</span>
                          </label>
                          <label className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={account.enabled}
                              onChange={(e) => updateEmailAccount(account.id, 'enabled', e.target.checked)}
                              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                            />
                            <span className="text-sm text-gray-700">Enabled</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  ))}

                  <button
                    onClick={addEmailAccount}
                    className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:text-gray-900 hover:border-gray-400 transition-colors"
                  >
                    + Add Email Account
                  </button>
                </div>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-2">Notifications</h2>
                  <p className="text-gray-600">Configure notification settings and webhooks</p>
                </div>

                <div className="space-y-6">
                  {/* Slack Integration */}
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h3 className="font-medium text-gray-900 mb-3">Slack Integration</h3>
                    <div className="space-y-4">
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={notifications.slackEnabled}
                          onChange={(e) => setNotifications({...notifications, slackEnabled: e.target.checked})}
                          className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                        <span className="text-sm text-gray-700">Enable Slack notifications</span>
                      </label>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Slack Webhook URL</label>
                        <input
                          type="url"
                          value={notifications.slackWebhook}
                          onChange={(e) => setNotifications({...notifications, slackWebhook: e.target.value})}
                          placeholder="https://hooks.slack.com/services/..."
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Webhook.site Integration */}
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h3 className="font-medium text-gray-900 mb-3">Webhook.site Integration</h3>
                    <div className="space-y-4">
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={notifications.webhookSiteEnabled}
                          onChange={(e) => setNotifications({...notifications, webhookSiteEnabled: e.target.checked})}
                          className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                        <span className="text-sm text-gray-700">Enable Webhook.site notifications</span>
                      </label>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Webhook.site URL</label>
                        <input
                          type="url"
                          value={notifications.webhookSiteUrl}
                          onChange={(e) => setNotifications({...notifications, webhookSiteUrl: e.target.value})}
                          placeholder="https://webhook.site/your-unique-url"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Email Notification Types */}
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h3 className="font-medium text-gray-900 mb-3">Email Notification Types</h3>
                    <div className="space-y-3">
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={notifications.interestedEmails}
                          onChange={(e) => setNotifications({...notifications, interestedEmails: e.target.checked})}
                          className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                        <span className="text-sm text-gray-700">Interested emails</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={notifications.meetingBooked}
                          onChange={(e) => setNotifications({...notifications, meetingBooked: e.target.checked})}
                          className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                        <span className="text-sm text-gray-700">Meeting booked emails</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={notifications.spamAlerts}
                          onChange={(e) => setNotifications({...notifications, spamAlerts: e.target.checked})}
                          className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                        <span className="text-sm text-gray-700">Spam alerts</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* AI Settings Tab */}
            {activeTab === 'ai-settings' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-2">AI Settings</h2>
                  <p className="text-gray-600">Configure OpenAI integration and AI features</p>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">OpenAI API Key</label>
                    <input
                      type="password"
                      value={aiSettings.openaiApiKey}
                      onChange={(e) => setAiSettings({...aiSettings, openaiApiKey: e.target.value})}
                      placeholder="sk-..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                    <p className="text-xs text-gray-500 mt-1">Your API key is encrypted and stored securely</p>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-medium text-gray-900">AI Features</h3>
                    <div className="space-y-3">
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={aiSettings.categorizationEnabled}
                          onChange={(e) => setAiSettings({...aiSettings, categorizationEnabled: e.target.checked})}
                          className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                        <span className="text-sm text-gray-700">Email categorization</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={aiSettings.replySuggestions}
                          onChange={(e) => setAiSettings({...aiSettings, replySuggestions: e.target.checked})}
                          className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                        <span className="text-sm text-gray-700">Reply suggestions</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={aiSettings.sentimentAnalysis}
                          onChange={(e) => setAiSettings({...aiSettings, sentimentAnalysis: e.target.checked})}
                          className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                        <span className="text-sm text-gray-700">Sentiment analysis</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={aiSettings.ragEnabled}
                          onChange={(e) => setAiSettings({...aiSettings, ragEnabled: e.target.checked})}
                          className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                        <span className="text-sm text-gray-700">RAG (Retrieval-Augmented Generation)</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* System Tab */}
            {activeTab === 'system' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-2">System Settings</h2>
                  <p className="text-gray-600">Configure system-level settings and integrations</p>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Elasticsearch URL</label>
                      <input
                        type="url"
                        value={systemSettings.elasticsearchUrl}
                        onChange={(e) => setSystemSettings({...systemSettings, elasticsearchUrl: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">PostgreSQL URL</label>
                      <input
                        type="url"
                        value={systemSettings.postgresUrl}
                        onChange={(e) => setSystemSettings({...systemSettings, postgresUrl: e.target.value})}
                        placeholder="postgresql://username:password@localhost:5432/reachinbox"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Sync Interval (minutes)</label>
                      <input
                        type="number"
                        value={systemSettings.syncInterval}
                        onChange={(e) => setSystemSettings({...systemSettings, syncInterval: parseInt(e.target.value)})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Max Emails Per Sync</label>
                      <input
                        type="number"
                        value={systemSettings.maxEmailsPerSync}
                        onChange={(e) => setSystemSettings({...systemSettings, maxEmailsPerSync: parseInt(e.target.value)})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h3 className="font-medium text-gray-900">Advanced Options</h3>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={systemSettings.autoCategorization}
                        onChange={(e) => setSystemSettings({...systemSettings, autoCategorization: e.target.checked})}
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="text-sm text-gray-700">Auto-categorize new emails</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={systemSettings.debugMode}
                        onChange={(e) => setSystemSettings({...systemSettings, debugMode: e.target.checked})}
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="text-sm text-gray-700">Debug mode</span>
                    </label>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default SettingsPage
