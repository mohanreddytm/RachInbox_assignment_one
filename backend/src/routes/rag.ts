import express, { Request, Response } from 'express';
import { getEmailById } from '../elasticsearch';
import { 
  findSimilarEmails, 
  generateContextualReply, 
  getEmailInsights,
  storeEmailEmbedding 
} from '../rag';
import { logger } from '../utils/logger';

const router: express.Router = express.Router();

// Find similar emails using RAG
router.post('/similar', async (req: Request, res: Response) => {
  try {
    const { emailId, query, limit = 5, category } = req.body;

    if (!emailId && !query) {
      return res.status(400).json({ error: 'Either emailId or query is required' });
    }

    let searchQuery = query;
    
    // If emailId provided, get the email content for similarity search
    if (emailId && !query) {
      const email = await getEmailById(emailId);
      if (!email) {
        return res.status(404).json({ error: 'Email not found' });
      }
      searchQuery = `${email.subject} ${email.text}`;
    }

    const similarEmails = await findSimilarEmails(searchQuery, limit, category);

    res.json({
      similarEmails,
      query: searchQuery,
      count: similarEmails.length
    });

  } catch (error) {
    logger.error('Failed to find similar emails:', error);
    res.status(500).json({ error: 'Failed to find similar emails' });
  }
});

// Generate contextual reply using RAG
router.post('/contextual-reply', async (req: Request, res: Response) => {
  try {
    const { emailId } = req.body;

    if (!emailId) {
      return res.status(400).json({ error: 'Email ID is required' });
    }

    const email = await getEmailById(emailId);
    if (!email) {
      return res.status(404).json({ error: 'Email not found' });
    }

    // Find similar emails for context
    const similarEmails = await findSimilarEmails(
      `${email.subject} ${email.text}`,
      3,
      email.category
    );

    // Generate contextual reply
    const contextualReply = await generateContextualReply(email, similarEmails);

    res.json({
      contextualReply,
      similarEmailsCount: similarEmails.length,
      contextUsed: similarEmails.map(sim => ({
        subject: sim.email.subject,
        similarity: sim.similarity
      }))
    });

  } catch (error) {
    logger.error('Failed to generate contextual reply:', error);
    res.status(500).json({ error: 'Failed to generate contextual reply' });
  }
});

// Get comprehensive email insights
router.post('/insights', async (req: Request, res: Response) => {
  try {
    const { emailId } = req.body;

    if (!emailId) {
      return res.status(400).json({ error: 'Email ID is required' });
    }

    const email = await getEmailById(emailId);
    if (!email) {
      return res.status(404).json({ error: 'Email not found' });
    }

    const insights = await getEmailInsights(email);

    res.json(insights);

  } catch (error) {
    logger.error('Failed to get email insights:', error);
    res.status(500).json({ error: 'Failed to get email insights' });
  }
});

// Store email embedding (for manual indexing)
router.post('/index-email', async (req: Request, res: Response) => {
  try {
    const { emailId } = req.body;

    if (!emailId) {
      return res.status(400).json({ error: 'Email ID is required' });
    }

    const email = await getEmailById(emailId);
    if (!email) {
      return res.status(404).json({ error: 'Email not found' });
    }

    await storeEmailEmbedding(email);

    res.json({ message: 'Email indexed successfully' });

  } catch (error) {
    logger.error('Failed to index email:', error);
    res.status(500).json({ error: 'Failed to index email' });
  }
});

// Bulk index emails
router.post('/bulk-index', async (req: Request, res: Response) => {
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
          await storeEmailEmbedding(email);
          results.push({ emailId, success: true });
        } else {
          results.push({ emailId, error: 'Email not found', success: false });
        }
      } catch (error) {
        results.push({ emailId, error: 'Failed to index', success: false });
      }
    }

    res.json({ 
      message: 'Bulk indexing completed',
      results,
      successCount: results.filter(r => r.success).length,
      errorCount: results.filter(r => !r.success).length
    });

  } catch (error) {
    logger.error('Failed to bulk index emails:', error);
    res.status(500).json({ error: 'Failed to bulk index emails' });
  }
});

// Get RAG status
router.get('/status', async (req: Request, res: Response) => {
  try {
    const hasPostgres = !!process.env.POSTGRES_URL;
    const hasOpenAI = !!process.env.OPENAI_API_KEY;
    
    res.json({
      rag: {
        enabled: hasPostgres && hasOpenAI,
        postgres: hasPostgres,
        openai: hasOpenAI
      },
      features: {
        similarEmails: hasPostgres && hasOpenAI,
        contextualReplies: hasPostgres && hasOpenAI,
        emailInsights: hasPostgres && hasOpenAI,
        vectorSearch: hasPostgres
      }
    });

  } catch (error) {
    logger.error('Failed to get RAG status:', error);
    res.status(500).json({ error: 'Failed to get RAG status' });
  }
});

export { router as ragRouter };
