# ReachInbox Onebox Email Aggregator

A full-stack email aggregation system that syncs multiple IMAP accounts, categorizes emails using AI, and provides real-time notifications for interested emails.

## 🚀 Features

- **Real-time IMAP Sync**: Sync multiple email accounts using IDLE mode
- **AI-Powered Categorization**: Automatically categorize emails into Interested, Meeting Booked, Not Interested, Spam, Out of Office
- **Elasticsearch Search**: Full-text search across all emails with advanced filtering
- **Slack Notifications**: Get notified when interested emails arrive
- **AI-Suggested Replies**: Generate contextual email replies using OpenAI
- **Modern React Frontend**: Clean, responsive UI with real-time updates
- **Webhook Integration**: Support for webhook.site and custom webhooks

## 🏗️ Tech Stack

### Backend
- **Node.js** with TypeScript
- **Express.js** for REST API
- **IMAPFlow** for real-time email sync
- **Elasticsearch** for search and indexing
- **OpenAI API** for AI categorization and reply generation

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development
- **Tailwind CSS** for styling
- **Lucide React** for icons

### Infrastructure
- **Docker Compose** for Elasticsearch
- **Optional PostgreSQL** with pgvector for RAG features
- **Redis** for caching (optional)

## 📋 Prerequisites

- Node.js 18+ and pnpm
- Docker and Docker Compose
- IMAP email accounts (Gmail, Outlook, etc.)
- OpenAI API key
- Slack webhook URL (optional)
- Webhook.site URL (optional)

## 🛠️ Setup Instructions

### 1. Clone and Install Dependencies

```bash
# Install backend dependencies
cd backend
pnpm install

# Install frontend dependencies
cd ../frontend
pnpm install
```

### 2. Environment Configuration

Copy the environment example file and configure your settings:

```bash
cp backend/env.example backend/.env
```

Edit `backend/.env` with your configuration:

```env
# Server Configuration
PORT=3001
NODE_ENV=development

# IMAP Configuration (configure at least 2 accounts)
IMAP_ACCOUNT_1_HOST=imap.gmail.com
IMAP_ACCOUNT_1_PORT=993
IMAP_ACCOUNT_1_USER=your-email1@gmail.com
IMAP_ACCOUNT_1_PASSWORD=your-app-password1
IMAP_ACCOUNT_1_SSL=true

IMAP_ACCOUNT_2_HOST=imap.outlook.com
IMAP_ACCOUNT_2_PORT=993
IMAP_ACCOUNT_2_USER=your-email2@outlook.com
IMAP_ACCOUNT_2_PASSWORD=your-password2
IMAP_ACCOUNT_2_SSL=true

# Elasticsearch Configuration
ELASTICSEARCH_URL=http://localhost:9200
ELASTICSEARCH_INDEX=emails

# OpenAI Configuration
OPENAI_API_KEY=your-openai-api-key

# Slack Webhook Configuration
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK

# Webhook.site Configuration (for testing)
WEBHOOK_SITE_URL=https://webhook.site/your-unique-url
```

### 3. Start Infrastructure Services

Start Elasticsearch and optional services with Docker Compose:

```bash
# Start all services
docker-compose up -d

# Or start only Elasticsearch
docker-compose up -d elasticsearch

# Check service status
docker-compose ps
```

### 4. Initialize Elasticsearch

The backend will automatically create the Elasticsearch index on startup. You can also manually initialize it:

```bash
cd backend
pnpm run dev
```

### 5. Start the Application

#### Backend (Terminal 1)
```bash
cd backend
pnpm run dev
```

#### Frontend (Terminal 2)
```bash
cd frontend
pnpm run dev
```

### 6. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Elasticsearch**: http://localhost:9200
- **Health Check**: http://localhost:3001/health

## 📚 API Documentation

### Email Endpoints

#### Get Emails
```http
GET /api/emails?query=search&category=Interested&page=1&limit=20
```

#### Get Email by ID
```http
GET /api/emails/{id}
```

#### Update Email Category
```http
PATCH /api/emails/{id}/category
Content-Type: application/json

{
  "category": "Interested"
}
```

#### Generate Suggested Reply
```http
POST /api/emails/{id}/suggest-reply
```

#### Generate Reply Options
```http
POST /api/emails/{id}/suggest-replies
Content-Type: application/json

{
  "count": 3
}
```

#### Analyze Email Sentiment
```http
POST /api/emails/{id}/analyze-sentiment
```

### AI Endpoints

#### Categorize Email
```http
POST /api/ai/categorize
Content-Type: application/json

{
  "emailId": "email-id"
}
```

#### Bulk Categorize
```http
POST /api/ai/bulk-categorize
Content-Type: application/json

{
  "emailIds": ["id1", "id2", "id3"]
}
```

### Webhook Endpoints

#### Test Webhook Connectivity
```http
GET /api/webhooks/test
```

#### Send Custom Webhook
```http
POST /api/webhooks/send
Content-Type: application/json

{
  "url": "https://webhook.site/your-url",
  "payload": {
    "message": "Test webhook"
  }
}
```

## 🔧 Configuration Guide

### IMAP Account Setup

#### Gmail Setup
1. Enable 2-Factor Authentication
2. Generate an App Password
3. Use these settings:
   ```
   Host: imap.gmail.com
   Port: 993
   SSL: true
   ```

#### Outlook Setup
1. Use these settings:
   ```
   Host: imap-mail.outlook.com
   Port: 993
   SSL: true
   ```

### Slack Webhook Setup
1. Go to your Slack workspace
2. Create a new app at https://api.slack.com/apps
3. Add an Incoming Webhook
4. Copy the webhook URL to your `.env` file

### Webhook.site Setup
1. Go to https://webhook.site
2. Copy your unique URL
3. Add it to your `.env` file

## 🧪 Testing with Postman

### Import Collection
1. Create a new collection in Postman
2. Add the following requests:

#### Health Check
```
GET http://localhost:3001/health
```

#### Search Emails
```
GET http://localhost:3001/api/emails?query=test&limit=10
```

#### Update Category
```
PATCH http://localhost:3001/api/emails/{email-id}/category
Content-Type: application/json

{
  "category": "Interested"
}
```

#### Generate Reply
```
POST http://localhost:3001/api/emails/{email-id}/suggest-reply
```

## 🚀 Production Deployment

### Environment Variables
Set these in your production environment:

```bash
NODE_ENV=production
PORT=3001
ELASTICSEARCH_URL=your-elasticsearch-url
OPENAI_API_KEY=your-openai-key
SLACK_WEBHOOK_URL=your-slack-webhook
```

### Docker Deployment
```bash
# Build and run with Docker
docker-compose -f docker-compose.prod.yml up -d
```

## 🔍 Troubleshooting

### Common Issues

#### Elasticsearch Connection Failed
```bash
# Check if Elasticsearch is running
curl http://localhost:9200/_cluster/health

# Restart Elasticsearch
docker-compose restart elasticsearch
```

#### IMAP Connection Failed
- Verify your email credentials
- Check if IMAP is enabled on your email account
- For Gmail, ensure you're using an App Password

#### OpenAI API Errors
- Verify your API key is correct
- Check your OpenAI account has sufficient credits
- Ensure the API key has the required permissions

### Logs
```bash
# Backend logs
cd backend && pnpm run dev

# Docker logs
docker-compose logs elasticsearch
docker-compose logs postgres
```

## 📈 Performance Optimization

### Elasticsearch Tuning
- Adjust heap size in `docker-compose.yml`
- Configure index settings for your use case
- Use bulk operations for large datasets

### IMAP Optimization
- Limit concurrent connections
- Use appropriate polling intervals
- Implement connection pooling

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the troubleshooting section
- Review the API documentation

---

**Note**: This is a development project. For production use, ensure proper security measures, monitoring, and backup strategies are in place.
