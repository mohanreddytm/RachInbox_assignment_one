import { Client } from '@elastic/elasticsearch';
import { logger } from './utils/logger';

const elasticsearchUrl = process.env.ELASTICSEARCH_URL || 'http://localhost:9200';
const indexName = process.env.ELASTICSEARCH_INDEX || 'emails';

export const elasticsearchClient = new Client({
  node: elasticsearchUrl,
  requestTimeout: 30000,
  maxRetries: 3,
  resurrectStrategy: 'ping'
});

// Email interface
export interface Email {
  id: string;
  messageId: string;
  subject: string;
  from: string;
  to: string;
  date: string;
  text: string;
  html?: string;
  folder: string;
  account: string;
  category?: 'Interested' | 'Meeting Booked' | 'Not Interested' | 'Spam' | 'Out of Office';
  isRead: boolean;
  attachments?: Array<{
    filename: string;
    contentType: string;
    size: number;
  }>;
  createdAt: string;
  updatedAt: string;
}

// Initialize Elasticsearch index
export async function initializeElasticsearch() {
  try {
    // Check if index exists
    const indexExists = await elasticsearchClient.indices.exists({
      index: indexName
    });

    if (!indexExists) {
      // Create index with mapping
      await elasticsearchClient.indices.create({
        index: indexName,
        body: {
          mappings: {
            properties: {
              id: { type: 'keyword' },
              messageId: { type: 'keyword' },
              subject: { 
                type: 'text',
                analyzer: 'standard',
                fields: {
                  keyword: { type: 'keyword' }
                }
              },
              from: { 
                type: 'text',
                analyzer: 'standard',
                fields: {
                  keyword: { type: 'keyword' }
                }
              },
              to: { 
                type: 'text',
                analyzer: 'standard',
                fields: {
                  keyword: { type: 'keyword' }
                }
              },
              date: { type: 'date' },
              text: { 
                type: 'text',
                analyzer: 'standard'
              },
              html: { type: 'text' },
              folder: { type: 'keyword' },
              account: { type: 'keyword' },
              category: { type: 'keyword' },
              isRead: { type: 'boolean' },
              attachments: {
                type: 'nested',
                properties: {
                  filename: { type: 'keyword' },
                  contentType: { type: 'keyword' },
                  size: { type: 'integer' }
                }
              },
              createdAt: { type: 'date' },
              updatedAt: { type: 'date' }
            }
          },
          settings: {
            number_of_shards: 1,
            number_of_replicas: 0
          }
        }
      });
      logger.info(`Created Elasticsearch index: ${indexName}`);
    } else {
      logger.info(`Elasticsearch index already exists: ${indexName}`);
    }
  } catch (error) {
    logger.error('Failed to initialize Elasticsearch:', error);
    throw error;
  }
}

// Index email document
export async function indexEmail(email: Email): Promise<void> {
  try {
    await elasticsearchClient.index({
      index: indexName,
      id: email.id,
      body: email
    });
    logger.debug(`Indexed email: ${email.id}`);
  } catch (error) {
    logger.error(`Failed to index email ${email.id}:`, error);
    throw error;
  }
}

// Search emails
export async function searchEmails(query: any): Promise<{ hits: any[]; total: number }> {
  try {
    const response = await elasticsearchClient.search({
      index: indexName,
      body: query
    });

    return {
      hits: response.hits.hits.map((hit: any) => ({
        ...hit._source,
        _score: hit._score
      })),
      total: typeof response.hits.total === 'number' ? response.hits.total : (response.hits.total?.value || 0)
    };
  } catch (error) {
    logger.error('Failed to search emails:', error);
    throw error;
  }
}

// Update email category
export async function updateEmailCategory(emailId: string, category: string): Promise<void> {
  try {
    await elasticsearchClient.update({
      index: indexName,
      id: emailId,
      body: {
        doc: {
          category,
          updatedAt: new Date().toISOString()
        }
      }
    });
    logger.info(`Updated email ${emailId} category to ${category}`);
  } catch (error) {
    logger.error(`Failed to update email ${emailId} category:`, error);
    throw error;
  }
}

// Get email by ID
export async function getEmailById(emailId: string): Promise<Email | null> {
  try {
    const response = await elasticsearchClient.get({
      index: indexName,
      id: emailId
    });

    return response._source as Email;
  } catch (error: any) {
    if (error.statusCode === 404) {
      return null;
    }
    logger.error(`Failed to get email ${emailId}:`, error);
    throw error;
  }
}
