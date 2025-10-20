import OpenAI from 'openai';
import { logger } from './utils/logger';
import { Email } from './elasticsearch';

const openai = process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'sk-demo-key-for-testing' 
  ? new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    })
  : null;

export type EmailCategory = 'Interested' | 'Meeting Booked' | 'Not Interested' | 'Spam' | 'Out of Office';

// Categorize email using OpenAI
export async function categorizeEmail(email: Email): Promise<EmailCategory> {
  try {
    if (!openai) {
      logger.warn('OpenAI API key not configured, using default category');
      return 'Not Interested';
    }

    const prompt = `
Analyze the following email and categorize it into one of these categories:
- Interested: The email seems to be from a potential client, customer, or business opportunity
- Meeting Booked: The email confirms a meeting, appointment, or call
- Not Interested: The email is not relevant for business opportunities
- Spam: The email is clearly spam or promotional content
- Out of Office: The email is an automated out-of-office reply

Email Details:
From: ${email.from}
Subject: ${email.subject}
Content: ${email.text.substring(0, 1000)}...

Respond with only the category name (e.g., "Interested").
`;

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are an email categorization assistant. Analyze emails and categorize them based on their business relevance and content.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 50,
      temperature: 0.1
    });

    const category = response.choices[0]?.message?.content?.trim() as EmailCategory;
    
    // Validate category
    const validCategories: EmailCategory[] = ['Interested', 'Meeting Booked', 'Not Interested', 'Spam', 'Out of Office'];
    if (validCategories.includes(category)) {
      return category;
    } else {
      logger.warn(`Invalid category returned: ${category}, using default`);
      return 'Not Interested';
    }

  } catch (error) {
    logger.error('Failed to categorize email:', error);
    return 'Not Interested';
  }
}

// Generate suggested reply using RAG (Retrieval-Augmented Generation)
export async function generateSuggestedReply(email: Email): Promise<string> {
  try {
    if (!openai) {
      return 'AI reply generation not available - OpenAI API key not configured';
    }

    const prompt = `
Based on the following email, generate a professional and helpful reply. The reply should be:
- Professional and courteous
- Address the sender's needs or questions
- Be concise but informative
- Include a call-to-action if appropriate

Original Email:
From: ${email.from}
Subject: ${email.subject}
Content: ${email.text}

Generate a suggested reply:
`;

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a professional email assistant. Generate helpful and professional email replies.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 500,
      temperature: 0.7
    });

    return response.choices[0]?.message?.content?.trim() || 'Unable to generate reply';

  } catch (error) {
    logger.error('Failed to generate suggested reply:', error);
    return 'Error generating reply';
  }
}

// Generate multiple reply options
export async function generateReplyOptions(email: Email, count: number = 3): Promise<string[]> {
  try {
    if (!openai) {
      return ['AI reply generation not available - OpenAI API key not configured'];
    }

    const prompt = `
Based on the following email, generate ${count} different professional reply options. Each reply should have a different tone or approach:
1. Formal and professional
2. Friendly and conversational  
3. Brief and direct

Original Email:
From: ${email.from}
Subject: ${email.subject}
Content: ${email.text}

Generate ${count} different reply options, numbered 1-${count}:
`;

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a professional email assistant. Generate multiple reply options with different tones and approaches.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 1000,
      temperature: 0.8
    });

    const content = response.choices[0]?.message?.content?.trim() || '';
    
    // Parse the numbered responses
    const replies = content.split(/\d+\./).filter(reply => reply.trim()).map(reply => reply.trim());
    
    return replies.length > 0 ? replies : ['Unable to generate reply options'];

  } catch (error) {
    logger.error('Failed to generate reply options:', error);
    return ['Error generating reply options'];
  }
}

// Analyze email sentiment
export async function analyzeEmailSentiment(email: Email): Promise<{
  sentiment: 'positive' | 'negative' | 'neutral';
  confidence: number;
  summary: string;
}> {
  try {
    if (!openai) {
      return {
        sentiment: 'neutral',
        confidence: 0,
        summary: 'Sentiment analysis not available'
      };
    }

    const prompt = `
Analyze the sentiment of this email and provide:
1. Sentiment: positive, negative, or neutral
2. Confidence score: 0-1
3. Brief summary of the sentiment

Email:
From: ${email.from}
Subject: ${email.subject}
Content: ${email.text.substring(0, 1000)}

Respond in JSON format:
{
  "sentiment": "positive|negative|neutral",
  "confidence": 0.85,
  "summary": "Brief explanation"
}
`;

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are an email sentiment analysis assistant. Analyze emails and provide sentiment analysis in JSON format.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 200,
      temperature: 0.1
    });

    const content = response.choices[0]?.message?.content?.trim();
    
    try {
      const analysis = JSON.parse(content || '{}');
      return {
        sentiment: analysis.sentiment || 'neutral',
        confidence: analysis.confidence || 0,
        summary: analysis.summary || 'Unable to analyze sentiment'
      };
    } catch (parseError) {
      logger.error('Failed to parse sentiment analysis:', parseError);
      return {
        sentiment: 'neutral',
        confidence: 0,
        summary: 'Sentiment analysis failed'
      };
    }

  } catch (error) {
    logger.error('Failed to analyze email sentiment:', error);
    return {
      sentiment: 'neutral',
      confidence: 0,
      summary: 'Sentiment analysis error'
    };
  }
}
