# 🚀 ReachInbox Quick Start Guide

## Prerequisites
- Node.js 18+ and pnpm
- Docker and Docker Compose
- IMAP email accounts (Gmail, Outlook, etc.)
- OpenAI API key
- Slack webhook URL (optional)

## 🏃‍♂️ Quick Setup (5 minutes)

### Option 1: Automated Setup (Recommended)
```bash
# Linux/Mac
./setup.sh

# Windows
setup.bat
```

### Option 2: Manual Setup

#### 1. Install Dependencies
```bash
# Backend
cd backend
pnpm install

# Frontend
cd ../frontend
pnpm install
```

#### 2. Configure Environment
```bash
# Copy environment template
cp backend/env.example backend/.env

# Edit with your credentials
nano backend/.env  # or use your preferred editor
```

#### 3. Start Infrastructure
```bash
# Start Elasticsearch
docker-compose up -d elasticsearch

# Wait for Elasticsearch (30 seconds)
curl http://localhost:9200/_cluster/health
```

#### 4. Start Application
```bash
# Terminal 1: Backend
cd backend
pnpm run dev

# Terminal 2: Frontend
cd frontend
pnpm run dev
```

## 🔧 Configuration

### Required Environment Variables
Edit `backend/.env`:

```env
# IMAP Accounts (configure at least 2)
IMAP_ACCOUNT_1_HOST=imap.gmail.com
IMAP_ACCOUNT_1_USER=your-email1@gmail.com
IMAP_ACCOUNT_1_PASSWORD=your-app-password1

IMAP_ACCOUNT_2_HOST=imap.outlook.com
IMAP_ACCOUNT_2_USER=your-email2@outlook.com
IMAP_ACCOUNT_2_PASSWORD=your-password2

# OpenAI API Key
OPENAI_API_KEY=your-openai-api-key

# Optional: Slack Webhook
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK
```

### Gmail Setup
1. Enable 2-Factor Authentication
2. Generate App Password: https://myaccount.google.com/apppasswords
3. Use App Password in `IMAP_ACCOUNT_1_PASSWORD`

### Slack Webhook Setup
1. Go to https://api.slack.com/apps
2. Create new app → Incoming Webhooks
3. Copy webhook URL to `.env`

## 🌐 Access Points

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Elasticsearch**: http://localhost:9200
- **Health Check**: http://localhost:3001/health

## 🧪 Testing with Postman

### Health Check
```
GET http://localhost:3001/health
```

### Search Emails
```
GET http://localhost:3001/api/emails?query=test&limit=10
```

### Update Category
```
PATCH http://localhost:3001/api/emails/{email-id}/category
Content-Type: application/json

{
  "category": "Interested"
}
```

### Generate AI Reply
```
POST http://localhost:3001/api/emails/{email-id}/suggest-reply
```

### Test Webhooks
```
GET http://localhost:3001/api/webhooks/test
```

## 🐳 Docker Deployment

### Development
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f
```

### Production
```bash
# Build and run production
docker-compose -f docker-compose.prod.yml up -d

# Scale services
docker-compose -f docker-compose.prod.yml up -d --scale backend=3
```

## 🔍 Troubleshooting

### Elasticsearch Issues
```bash
# Check status
curl http://localhost:9200/_cluster/health

# Restart
docker-compose restart elasticsearch

# View logs
docker-compose logs elasticsearch
```

### IMAP Connection Issues
- Verify email credentials
- Check IMAP is enabled
- For Gmail: Use App Password, not regular password
- Check firewall/network restrictions

### OpenAI API Issues
- Verify API key is correct
- Check account has sufficient credits
- Ensure API key has required permissions

### Frontend Not Loading
- Check backend is running on port 3001
- Verify proxy configuration in `vite.config.ts`
- Check browser console for errors

## 📊 Monitoring

### Health Checks
```bash
# Backend health
curl http://localhost:3001/health

# Elasticsearch health
curl http://localhost:9200/_cluster/health

# Docker services
docker-compose ps
```

### Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f elasticsearch
docker-compose logs -f backend
```

## 🚀 Production Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Configure proper IMAP credentials
- [ ] Set up OpenAI API key
- [ ] Configure Slack webhook
- [ ] Set up monitoring and logging
- [ ] Configure backup strategy
- [ ] Set up SSL/TLS certificates
- [ ] Configure firewall rules
- [ ] Set up log rotation
- [ ] Configure email rate limits

## 📈 Performance Tips

### Elasticsearch
- Increase heap size for large datasets
- Configure index settings
- Use bulk operations

### IMAP
- Limit concurrent connections
- Use appropriate polling intervals
- Implement connection pooling

### Database
- Configure connection pooling
- Set up proper indexing
- Monitor query performance

## 🆘 Support

- Check logs: `docker-compose logs -f`
- Verify configuration: `backend/.env`
- Test connectivity: `curl http://localhost:3001/health`
- Check Docker: `docker-compose ps`

## 📚 Additional Resources

- [Elasticsearch Documentation](https://www.elastic.co/guide/)
- [OpenAI API Documentation](https://platform.openai.com/docs)
- [IMAPFlow Documentation](https://imapflow.com/)
- [React Documentation](https://react.dev/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

---

**Need help?** Check the main README.md for detailed documentation and troubleshooting guides.
