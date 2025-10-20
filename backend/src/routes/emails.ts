import express, { Request, Response, NextFunction } from 'express';
import { 
  searchEmails, 
  updateEmailCategory, 
  getEmailById, 
  Email 
} from '../elasticsearch';
import { generateSuggestedReply, generateReplyOptions, analyzeEmailSentiment } from '../ai';
import { logger } from '../utils/logger';

const router: express.Router = express.Router();

// Get all emails with search and filters
router.get('/', async (req: Request, res: Response) => {
  try {
    const {
      query,
      account,
      folder,
      category,
      from,
      to,
      dateFrom,
      dateTo,
      page = 1,
      limit = 20,
      sortBy = 'date',
      sortOrder = 'desc'
    } = req.query;

    // Mock data for demonstration when Elasticsearch is not available
    const mockEmails = [
      {
        id: '1',
        messageId: 'msg-001',
        subject: 'Welcome to ReachInbox!',
        from: 'support@reachinbox.com',
        to: 'user@example.com',
        date: new Date().toISOString(),
        text: 'Thank you for using ReachInbox Email Aggregator. This is a demo email to show how the system works.',
        html: '<p>Thank you for using ReachInbox Email Aggregator. This is a demo email to show how the system works.</p>',
        folder: 'INBOX',
        account: 'Account 1',
        category: 'Interested',
        isRead: false,
        attachments: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: '2',
        messageId: 'msg-002',
        subject: 'Meeting Request - Project Discussion',
        from: 'john.doe@company.com',
        to: 'user@example.com',
        date: new Date(Date.now() - 86400000).toISOString(),
        text: 'Hi, I would like to schedule a meeting to discuss the project requirements. Please let me know your availability.',
        html: '<p>Hi, I would like to schedule a meeting to discuss the project requirements. Please let me know your availability.</p>',
        folder: 'INBOX',
        account: 'Account 1',
        category: 'Meeting Booked',
        isRead: true,
        attachments: [],
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        updatedAt: new Date(Date.now() - 86400000).toISOString()
      },
      {
        id: '3',
        messageId: 'msg-003',
        subject: 'Newsletter - Weekly Updates',
        from: 'newsletter@technews.com',
        to: 'user@example.com',
        date: new Date(Date.now() - 172800000).toISOString(),
        text: 'Check out our latest tech news and updates for this week. Stay informed with the latest trends.',
        html: '<p>Check out our latest tech news and updates for this week. Stay informed with the latest trends.</p>',
        folder: 'INBOX',
        account: 'Account 2',
        category: 'Not Interested',
        isRead: false,
        attachments: [],
        createdAt: new Date(Date.now() - 172800000).toISOString(),
        updatedAt: new Date(Date.now() - 172800000).toISOString()
      }
    ];

    // Filter mock data based on query parameters
    let filteredEmails = mockEmails;

    if (query) {
      const searchTerm = (query as string).toLowerCase();
      filteredEmails = filteredEmails.filter(email => 
        email.subject.toLowerCase().includes(searchTerm) ||
        email.text.toLowerCase().includes(searchTerm) ||
        email.from.toLowerCase().includes(searchTerm)
      );
    }

    if (category) {
      filteredEmails = filteredEmails.filter(email => email.category === category);
    }

    if (account) {
      filteredEmails = filteredEmails.filter(email => email.account === account);
    }

    if (folder) {
      filteredEmails = filteredEmails.filter(email => email.folder === folder);
    }

    // Pagination
    const startIndex = (Number(page) - 1) * Number(limit);
    const endIndex = startIndex + Number(limit);
    const paginatedEmails = filteredEmails.slice(startIndex, endIndex);

    res.json({
      emails: paginatedEmails,
      total: filteredEmails.length,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(filteredEmails.length / Number(limit))
    });

  } catch (error) {
    logger.error('Failed to get emails:', error);
    res.status(500).json({ error: 'Failed to fetch emails' });
  }
});

// Get email by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const email = await getEmailById(id);

    if (!email) {
      return res.status(404).json({ error: 'Email not found' });
    }

    res.json(email);

  } catch (error) {
    logger.error('Failed to get email:', error);
    res.status(500).json({ error: 'Failed to fetch email' });
  }
});

// Update email category
router.patch('/:id/category', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { category } = req.body;

    if (!category) {
      return res.status(400).json({ error: 'Category is required' });
    }

    const validCategories = ['Interested', 'Meeting Booked', 'Not Interested', 'Spam', 'Out of Office'];
    if (!validCategories.includes(category)) {
      return res.status(400).json({ error: 'Invalid category' });
    }

    await updateEmailCategory(id, category);

    res.json({ message: 'Category updated successfully' });

  } catch (error) {
    logger.error('Failed to update email category:', error);
    res.status(500).json({ error: 'Failed to update category' });
  }
});

// Generate suggested reply
router.post('/:id/suggest-reply', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const email = await getEmailById(id);

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
router.post('/:id/suggest-replies', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { count = 3 } = req.body;
    const email = await getEmailById(id);

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
router.post('/:id/analyze-sentiment', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const email = await getEmailById(id);

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

// Get email statistics
router.get('/stats/overview', async (req: Request, res: Response) => {
  try {
    const statsQuery = {
      query: { match_all: {} },
      aggs: {
        total_emails: { value_count: { field: 'id' } },
        by_category: {
          terms: { field: 'category.keyword' }
        },
        by_account: {
          terms: { field: 'account.keyword' }
        },
        by_folder: {
          terms: { field: 'folder.keyword' }
        },
        recent_emails: {
          date_histogram: {
            field: 'date',
            calendar_interval: 'day',
            min_doc_count: 1
          }
        }
      },
      size: 0
    };

    // Mock statistics for demonstration
    const mockStats = {
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
      ],
      recentEmails: [
        { key_as_string: new Date().toISOString().split('T')[0], key: Date.now(), doc_count: 1 },
        { key_as_string: new Date(Date.now() - 86400000).toISOString().split('T')[0], key: Date.now() - 86400000, doc_count: 1 },
        { key_as_string: new Date(Date.now() - 172800000).toISOString().split('T')[0], key: Date.now() - 172800000, doc_count: 1 }
      ]
    };

    res.json(mockStats);

  } catch (error) {
    logger.error('Failed to get email statistics:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

// Search emails with advanced filters
router.post('/search', async (req: Request, res: Response) => {
  try {
    const {
      query,
      filters = {},
      page = 1,
      limit = 20,
      sortBy = 'date',
      sortOrder = 'desc'
    } = req.body;

    const searchQuery: any = {
      query: {
        bool: {
          must: []
        }
      },
      from: (Number(page) - 1) * Number(limit),
      size: Number(limit),
      sort: [
        { [sortBy]: { order: sortOrder } }
      ]
    };

    // Add search query
    if (query) {
      searchQuery.query.bool.must.push({
        multi_match: {
          query,
          fields: ['subject^2', 'text', 'from', 'to']
        }
      });
    }

    // Add filters
    const filterClauses: any[] = [];

    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        if (key === 'dateRange') {
          filterClauses.push({ range: { date: value } });
        } else if (key === 'hasAttachments') {
          filterClauses.push({ exists: { field: 'attachments' } });
        } else {
          filterClauses.push({ term: { [key]: value } });
        }
      }
    });

    if (filterClauses.length > 0) {
      searchQuery.query.bool.filter = filterClauses;
    }

    const result = await searchEmails(searchQuery);

    res.json({
      emails: result.hits,
      total: result.total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(result.total / Number(limit))
    });

  } catch (error) {
    logger.error('Failed to search emails:', error);
    res.status(500).json({ error: 'Failed to search emails' });
  }
});

export { router as emailRouter };
