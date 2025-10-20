import express from 'express';
import { categorizeEmail, generateSuggestedReply, generateReplyOptions, analyzeEmailSentiment } from '../ai';
import { getEmailById } from '../elasticsearch';
import { logger } from '../utils/logger';

const router: express.Router = express.Router();

// Categorize email
router.post('/categorize', async (req, res) => {
  try {
    const { emailId } = req.body;

    if (!emailId) {
      return res.status(400).json({ error: 'Email ID is required' });
    }

    const email = await getEmailById(emailId);
    if (!email) {
      return res.status(404).json({ error: 'Email not found' });
    }

    const category = await categorizeEmail(email);

    res.json({ category });

  } catch (error) {
    logger.error('Failed to categorize email:', error);
    res.status(500).json({ error: 'Failed to categorize email' });
  }
});

// Generate suggested reply for email
router.post('/suggest-reply', async (req, res) => {
  try {
    const { emailId } = req.body;

    if (!emailId) {
      return res.status(400).json({ error: 'Email ID is required' });
    }

    const email = await getEmailById(emailId);
    if (!email) {
      return res.status(404).json({ error: 'Email not found' });
    }

    const suggestedReply = await generateSuggestedReply(email);

    res.json({ suggestedReply });

  } catch (error) {
    logger.error('Failed to generate suggested reply:', error);
    res.status(500).json({ error: 'Failed to generate reply' });
  }
});

// Generate multiple reply options
router.post('/suggest-replies', async (req, res) => {
  try {
    const { emailId, count = 3 } = req.body;

    if (!emailId) {
      return res.status(400).json({ error: 'Email ID is required' });
    }

    const email = await getEmailById(emailId);
    if (!email) {
      return res.status(404).json({ error: 'Email not found' });
    }

    const replyOptions = await generateReplyOptions(email, count);

    res.json({ replyOptions });

  } catch (error) {
    logger.error('Failed to generate reply options:', error);
    res.status(500).json({ error: 'Failed to generate reply options' });
  }
});

// Analyze email sentiment
router.post('/analyze-sentiment', async (req, res) => {
  try {
    const { emailId } = req.body;

    if (!emailId) {
      return res.status(400).json({ error: 'Email ID is required' });
    }

    const email = await getEmailById(emailId);
    if (!email) {
      return res.status(404).json({ error: 'Email not found' });
    }

    const sentiment = await analyzeEmailSentiment(email);

    res.json(sentiment);

  } catch (error) {
    logger.error('Failed to analyze sentiment:', error);
    res.status(500).json({ error: 'Failed to analyze sentiment' });
  }
});

// Bulk categorize emails
router.post('/bulk-categorize', async (req, res) => {
  try {
    const { emailIds } = req.body;

    if (!emailIds || !Array.isArray(emailIds)) {
      return res.status(400).json({ error: 'Email IDs array is required' });
    }

    const results = [];

    for (const emailId of emailIds) {
      try {
        const email = await getEmailById(emailId);
        if (email) {
          const category = await categorizeEmail(email);
          results.push({ emailId, category, success: true });
        } else {
          results.push({ emailId, error: 'Email not found', success: false });
        }
      } catch (error) {
        results.push({ emailId, error: 'Failed to categorize', success: false });
      }
    }

    res.json({ results });

  } catch (error) {
    logger.error('Failed to bulk categorize emails:', error);
    res.status(500).json({ error: 'Failed to bulk categorize emails' });
  }
});

// Get AI service status
router.get('/status', async (req, res) => {
  try {
    const hasOpenAIKey = !!process.env.OPENAI_API_KEY;
    
    res.json({
      openai: {
        configured: hasOpenAIKey,
        status: hasOpenAIKey ? 'ready' : 'not_configured'
      },
      features: {
        categorization: hasOpenAIKey,
        replyGeneration: hasOpenAIKey,
        sentimentAnalysis: hasOpenAIKey
      }
    });

  } catch (error) {
    logger.error('Failed to get AI status:', error);
    res.status(500).json({ error: 'Failed to get AI status' });
  }
});

export { router as aiRouter };
