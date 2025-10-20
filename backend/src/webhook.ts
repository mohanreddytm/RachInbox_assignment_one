import axios from 'axios';
import { logger } from './utils/logger';
import { Email } from './elasticsearch';

// Send Slack notification for Interested emails
export async function sendSlackNotification(email: Email): Promise<void> {
  try {
    const webhookUrl = process.env.SLACK_WEBHOOK_URL;
    
    if (!webhookUrl) {
      logger.warn('Slack webhook URL not configured');
      return;
    }

    const message = {
      text: `🎯 New Interested Email Detected!`,
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: '🎯 New Interested Email'
          }
        },
        {
          type: 'section',
          fields: [
            {
              type: 'mrkdwn',
              text: `*From:* ${email.from}`
            },
            {
              type: 'mrkdwn',
              text: `*Subject:* ${email.subject}`
            },
            {
              type: 'mrkdwn',
              text: `*Account:* ${email.account}`
            },
            {
              type: 'mrkdwn',
              text: `*Date:* ${new Date(email.date).toLocaleString()}`
            }
          ]
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*Preview:* ${email.text.substring(0, 200)}${email.text.length > 200 ? '...' : ''}`
          }
        },
        {
          type: 'actions',
          elements: [
            {
              type: 'button',
              text: {
                type: 'plain_text',
                text: 'View Email'
              },
              url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/emails/${email.id}`,
              style: 'primary'
            }
          ]
        }
      ]
    };

    await axios.post(webhookUrl, message, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    logger.info(`Slack notification sent for email: ${email.id}`);

  } catch (error) {
    logger.error('Failed to send Slack notification:', error);
  }
}

// Send webhook notification to webhook.site
export async function sendWebhookNotification(email: Email): Promise<void> {
  try {
    const webhookUrl = process.env.WEBHOOK_SITE_URL;
    
    if (!webhookUrl) {
      logger.warn('Webhook.site URL not configured');
      return;
    }

    const payload = {
      event: 'interested_email',
      timestamp: new Date().toISOString(),
      email: {
        id: email.id,
        from: email.from,
        subject: email.subject,
        account: email.account,
        date: email.date,
        category: email.category,
        preview: email.text.substring(0, 500)
      }
    };

    await axios.post(webhookUrl, payload, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    logger.info(`Webhook notification sent for email: ${email.id}`);

  } catch (error) {
    logger.error('Failed to send webhook notification:', error);
  }
}

// Send custom webhook notification
export async function sendCustomWebhook(url: string, payload: any): Promise<void> {
  try {
    await axios.post(url, payload, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });

    logger.info(`Custom webhook sent to: ${url}`);

  } catch (error) {
    logger.error(`Failed to send custom webhook to ${url}:`, error);
  }
}

// Test webhook connectivity
export async function testWebhookConnectivity(): Promise<{
  slack: boolean;
  webhookSite: boolean;
}> {
  const results = {
    slack: false,
    webhookSite: false
  };

  // Test Slack webhook
  if (process.env.SLACK_WEBHOOK_URL) {
    try {
      await axios.post(process.env.SLACK_WEBHOOK_URL, {
        text: '🧪 ReachInbox webhook test - connection successful!'
      });
      results.slack = true;
      logger.info('Slack webhook test successful');
    } catch (error) {
      logger.error('Slack webhook test failed:', error);
    }
  }

  // Test webhook.site
  if (process.env.WEBHOOK_SITE_URL) {
    try {
      await axios.post(process.env.WEBHOOK_SITE_URL, {
        event: 'test',
        timestamp: new Date().toISOString(),
        message: 'ReachInbox webhook test - connection successful!'
      });
      results.webhookSite = true;
      logger.info('Webhook.site test successful');
    } catch (error) {
      logger.error('Webhook.site test failed:', error);
    }
  }

  return results;
}
