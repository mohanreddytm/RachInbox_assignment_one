import express from 'express';
import { testWebhookConnectivity, sendCustomWebhook } from '../webhook';
import { logger } from '../utils/logger';

const router: express.Router = express.Router();

// Test webhook connectivity
router.get('/test', async (req, res) => {
  try {
    const results = await testWebhookConnectivity();
    
    res.json({
      message: 'Webhook connectivity test completed',
      results
    });

  } catch (error) {
    logger.error('Failed to test webhook connectivity:', error);
    res.status(500).json({ error: 'Failed to test webhook connectivity' });
  }
});

// Send custom webhook
router.post('/send', async (req, res) => {
  try {
    const { url, payload } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'Webhook URL is required' });
    }

    if (!payload) {
      return res.status(400).json({ error: 'Payload is required' });
    }

    await sendCustomWebhook(url, payload);

    res.json({ message: 'Webhook sent successfully' });

  } catch (error) {
    logger.error('Failed to send custom webhook:', error);
    res.status(500).json({ error: 'Failed to send webhook' });
  }
});

// Webhook endpoint for receiving notifications (for testing)
router.post('/receive', (req, res) => {
  try {
    logger.info('Received webhook notification:', req.body);
    
    res.json({ 
      message: 'Webhook received successfully',
      timestamp: new Date().toISOString(),
      data: req.body
    });

  } catch (error) {
    logger.error('Failed to process webhook:', error);
    res.status(500).json({ error: 'Failed to process webhook' });
  }
});

export { router as webhookRouter };
