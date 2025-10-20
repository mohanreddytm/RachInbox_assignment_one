import { Client } from 'pg';
import { logger } from './utils/logger';
import { Email } from './elasticsearch';
import OpenAI from 'openai';

const openai = process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'sk-demo-key-for-testing' 
  ? new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    })
  : null;

// Initialize PostgreSQL connection for pgvector
let pgClient: Client | null = null;

export async function initializeRAG(): Promise<void> {
  try {
    if (!process.env.POSTGRES_URL || process.env.POSTGRES_URL.includes('username:password')) {
      logger.warn('PostgreSQL URL not configured, RAG features disabled');
      return;
    }

    pgClient = new Client({
      connectionString: process.env.POSTGRES_URL
    });

    await pgClient.connect();
    logger.info('Connected to PostgreSQL for RAG features');

    // Enable pgvector extension
    await pgClient.query('CREATE EXTENSION IF NOT EXISTS vector');

    // Create emails table with vector column
    await pgClient.query(`
      CREATE TABLE IF NOT EXISTS email_embeddings (
        id UUID PRIMARY KEY,
        email_id VARCHAR(255) UNIQUE NOT NULL,
        subject TEXT,
        content TEXT,
        embedding VECTOR(1536),
        category VARCHAR(50),
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Create vector index for similarity search
    await pgClient.query(`
      CREATE INDEX IF NOT EXISTS email_embeddings_embedding_idx 
      ON email_embeddings USING ivfflat (embedding vector_cosine_ops)
      WITH (lists = 100)
    `);

    logger.info('RAG database initialized successfully');

  } catch (error) {
    logger.error('Failed to initialize RAG:', error);
    throw error;
  }
}

// Generate embedding for text using OpenAI
async function generateEmbedding(text: string): Promise<number[]> {
  try {
    if (!openai) {
      throw new Error('OpenAI not configured');
    }

    const response = await openai.embeddings.create({
      model: 'text-embedding-ada-002',
      input: text
    });

    return response.data[0].embedding;
  } catch (error) {
    logger.error('Failed to generate embedding:', error);
    throw error;
  }
}

// Store email embedding in vector database
export async function storeEmailEmbedding(email: Email): Promise<void> {
  if (!pgClient || !openai) {
    logger.warn('PostgreSQL or OpenAI not connected, skipping embedding storage');
    return;
  }

  try {
    // Combine subject and content for embedding
    const textToEmbed = `${email.subject}\n\n${email.text}`;
    
    // Generate embedding
    const embedding = await generateEmbedding(textToEmbed);

    // Store in database
    await pgClient.query(`
      INSERT INTO email_embeddings (id, email_id, subject, content, embedding, category)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (email_id) 
      DO UPDATE SET 
        subject = EXCLUDED.subject,
        content = EXCLUDED.content,
        embedding = EXCLUDED.embedding,
        category = EXCLUDED.category
    `, [
      email.id,
      email.id,
      email.subject,
      email.text,
      JSON.stringify(embedding),
      email.category
    ]);

    logger.debug(`Stored embedding for email: ${email.id}`);

  } catch (error) {
    logger.error(`Failed to store embedding for email ${email.id}:`, error);
  }
}

// Find similar emails using vector similarity
export async function findSimilarEmails(
  queryText: string, 
  limit: number = 5,
  category?: string
): Promise<Array<{ email: Email; similarity: number }>> {
  if (!pgClient || !openai) {
    logger.warn('PostgreSQL or OpenAI not connected, cannot find similar emails');
    return [];
  }

  try {
    // Generate embedding for query
    const queryEmbedding = await generateEmbedding(queryText);

    // Build query with optional category filter
    let query = `
      SELECT 
        e.email_id,
        e.subject,
        e.content,
        e.category,
        1 - (e.embedding <=> $1) as similarity
      FROM email_embeddings e
      WHERE 1 - (e.embedding <=> $1) > 0.7
    `;
    
    const params: any[] = [JSON.stringify(queryEmbedding)];
    
    if (category) {
      query += ` AND e.category = $2`;
      params.push(category);
    }
    
    query += ` ORDER BY similarity DESC LIMIT $${params.length + 1}`;
    params.push(limit);

    const result = await pgClient.query(query, params);

    return result.rows.map((row: any) => ({
      email: {
        id: row.email_id,
        subject: row.subject,
        text: row.content,
        category: row.category
      } as Email,
      similarity: parseFloat(row.similarity)
    }));

  } catch (error) {
    logger.error('Failed to find similar emails:', error);
    return [];
  }
}

// Generate contextual reply using RAG
export async function generateContextualReply(
  email: Email, 
  similarEmails: Array<{ email: Email; similarity: number }>
): Promise<string> {
  try {
    if (!openai) {
      return 'AI reply generation not available - OpenAI API key not configured';
    }

    // Build context from similar emails
    const context = similarEmails
      .slice(0, 3) // Use top 3 similar emails
      .map(sim => `Subject: ${sim.email.subject}\nContent: ${sim.email.text.substring(0, 200)}...`)
      .join('\n\n');

    const prompt = `
You are a professional email assistant. Generate a contextual reply based on the current email and similar past emails.

Current Email:
From: ${email.from}
Subject: ${email.subject}
Content: ${email.text}

Similar Past Emails (for context):
${context}

Generate a professional reply that:
1. Addresses the current email appropriately
2. Uses context from similar past emails to provide relevant information
3. Is professional and helpful
4. Includes a clear call-to-action if appropriate

Reply:
`;

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a professional email assistant. Generate contextual replies using past email context.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 500,
      temperature: 0.7
    });

    return response.choices[0]?.message?.content?.trim() || 'Unable to generate contextual reply';

  } catch (error) {
    logger.error('Failed to generate contextual reply:', error);
    return 'Error generating contextual reply';
  }
}

// Get email insights using RAG
export async function getEmailInsights(email: Email): Promise<{
  similarEmails: Array<{ email: Email; similarity: number }>;
  suggestedReply: string;
  insights: string[];
}> {
  try {
    // Find similar emails
    const similarEmails = await findSimilarEmails(
      `${email.subject} ${email.text}`,
      5,
      email.category
    );

    // Generate contextual reply
    const suggestedReply = await generateContextualReply(email, similarEmails);

    // Generate insights
    const insights = await generateInsights(email, similarEmails);

    return {
      similarEmails,
      suggestedReply,
      insights
    };

  } catch (error) {
    logger.error('Failed to get email insights:', error);
    return {
      similarEmails: [],
      suggestedReply: 'Unable to generate insights',
      insights: ['Error generating insights']
    };
  }
}

// Generate insights from similar emails
async function generateInsights(
  email: Email, 
  similarEmails: Array<{ email: Email; similarity: number }>
): Promise<string[]> {
  try {
    if (!openai || similarEmails.length === 0) {
      return ['No similar emails found for insights'];
    }

    const context = similarEmails
      .map(sim => `Subject: ${sim.email.subject} (Similarity: ${(sim.similarity * 100).toFixed(1)}%)`)
      .join('\n');

    const prompt = `
Based on the current email and similar past emails, provide 3-5 key insights:

Current Email:
Subject: ${email.subject}
From: ${email.from}

Similar Past Emails:
${context}

Provide insights about:
1. Common patterns or themes
2. Response strategies that worked
3. Important context or background
4. Potential follow-up actions

Format as a bulleted list of insights.
`;

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are an email analysis assistant. Provide insights based on email patterns and context.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 300,
      temperature: 0.5
    });

    const content = response.choices[0]?.message?.content?.trim() || '';
    return content.split('\n').filter(line => line.trim()).map(line => line.replace(/^[-•]\s*/, ''));

  } catch (error) {
    logger.error('Failed to generate insights:', error);
    return ['Error generating insights'];
  }
}

// Clean up old embeddings
export async function cleanupOldEmbeddings(daysToKeep: number = 90): Promise<void> {
  if (!pgClient) {
    return;
  }

  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const result = await pgClient.query(`
      DELETE FROM email_embeddings 
      WHERE created_at < $1
    `, [cutoffDate]);

    logger.info(`Cleaned up ${result.rowCount} old embeddings`);

  } catch (error) {
    logger.error('Failed to cleanup old embeddings:', error);
  }
}

// Close database connection
export async function closeRAGConnection(): Promise<void> {
  if (pgClient) {
    await pgClient.end();
    pgClient = null;
    logger.info('RAG database connection closed');
  }
}
