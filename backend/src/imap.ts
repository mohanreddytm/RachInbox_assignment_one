import { ImapFlow } from 'imapflow';
import { v4 as uuidv4 } from 'uuid';
import { logger } from './utils/logger';
import { indexEmail, Email } from './elasticsearch';
import { categorizeEmail } from './ai';
import { sendSlackNotification, sendWebhookNotification } from './webhook';
import { storeEmailEmbedding } from './rag';

interface ImapAccount {
  host: string;
  port: number;
  user: string;
  password: string;
  ssl: boolean;
  name: string;
}

// Parse IMAP accounts from environment variables
function getImapAccounts(): ImapAccount[] {
  const accounts: ImapAccount[] = [];
  
  // Account 1
  if (process.env.IMAP_ACCOUNT_1_HOST) {
    accounts.push({
      host: process.env.IMAP_ACCOUNT_1_HOST,
      port: parseInt(process.env.IMAP_ACCOUNT_1_PORT || '993'),
      user: process.env.IMAP_ACCOUNT_1_USER!,
      password: process.env.IMAP_ACCOUNT_1_PASSWORD!,
      ssl: process.env.IMAP_ACCOUNT_1_SSL === 'true',
      name: 'Account 1'
    });
  }
  
  // Account 2
  if (process.env.IMAP_ACCOUNT_2_HOST) {
    accounts.push({
      host: process.env.IMAP_ACCOUNT_2_HOST,
      port: parseInt(process.env.IMAP_ACCOUNT_2_PORT || '993'),
      user: process.env.IMAP_ACCOUNT_2_USER!,
      password: process.env.IMAP_ACCOUNT_2_PASSWORD!,
      ssl: process.env.IMAP_ACCOUNT_2_SSL === 'true',
      name: 'Account 2'
    });
  }
  
  return accounts;
}

// Process and index email
async function processEmail(message: any, account: ImapAccount, folder: string): Promise<void> {
  try {
    const emailId = uuidv4();
    const now = new Date().toISOString();
    
    // Extract email data
    const email: Email = {
      id: emailId,
      messageId: message.messageId || '',
      subject: message.subject || 'No Subject',
      from: message.from?.text || '',
      to: message.to?.text || '',
      date: message.date?.toISOString() || now,
      text: message.text || '',
      html: message.html,
      folder,
      account: account.name,
      isRead: false,
      attachments: message.attachments?.map((att: any) => ({
        filename: att.filename || 'unknown',
        contentType: att.contentType || 'application/octet-stream',
        size: att.size || 0
      })) || [],
      createdAt: now,
      updatedAt: now
    };

    // Categorize email using AI
    try {
      email.category = await categorizeEmail(email);
      logger.info(`Email categorized as: ${email.category}`);
    } catch (error) {
      logger.error('Failed to categorize email:', error);
      email.category = 'Not Interested'; // Default category
    }

    // Index email in Elasticsearch
    await indexEmail(email);
    logger.info(`Processed email: ${email.subject} from ${email.from}`);

    // Store email embedding for RAG (optional)
    try {
      await storeEmailEmbedding(email);
      logger.debug(`Stored embedding for email: ${email.id}`);
    } catch (error) {
      logger.warn('Failed to store email embedding (RAG feature):', error);
    }

    // Send notifications for Interested emails
    if (email.category === 'Interested') {
      try {
        await sendSlackNotification(email);
        await sendWebhookNotification(email);
        logger.info(`Sent notifications for interested email: ${email.id}`);
      } catch (error) {
        logger.error('Failed to send notifications:', error);
      }
    }

  } catch (error) {
    logger.error('Failed to process email:', error);
  }
}

// Sync emails for a specific account
async function syncAccount(account: ImapAccount): Promise<void> {
  let client: ImapFlow | null = null;
  
  try {
    logger.info(`Connecting to ${account.name} (${account.user})`);
    
    client = new ImapFlow({
      host: account.host,
      port: account.port,
      secure: account.ssl,
      auth: {
        user: account.user,
        pass: account.password
      },
      logger: false
    });

    await client.connect();
    logger.info(`Connected to ${account.name}`);

    // Get all folders
    const folders = await client.list();
    const inboxFolders = folders.filter(folder => 
      folder.name.toLowerCase().includes('inbox') || 
      folder.name.toLowerCase().includes('sent') ||
      folder.name.toLowerCase().includes('drafts')
    );

    // Process each folder
    for (const folder of inboxFolders) {
      try {
        logger.info(`Processing folder: ${folder.name}`);
        
        await client.mailboxOpen(folder.name);
        
        // Get emails from last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const searchCriteria = {
          since: thirtyDaysAgo
        };

        // Fetch emails
        for await (const message of client.fetch(searchCriteria, { envelope: true, uid: true })) {
          if (message.envelope) {
            // Get full message content
            const fullMessage = await client.download(String(message.uid));
            if (fullMessage) {
              await processEmail(fullMessage, account, folder.name);
            }
          }
        }

        logger.info(`Completed processing folder: ${folder.name}`);
      } catch (error) {
        logger.error(`Failed to process folder ${folder.name}:`, error);
      }
    }

    // Set up IDLE mode for real-time updates
    logger.info(`Setting up IDLE mode for ${account.name}`);
    
    await client.mailboxOpen('INBOX');
    
    // Start IDLE mode
    const idle = client.idle();
    
    if (idle && typeof idle === 'object' && 'on' in idle) {
      (idle as any).on('mailboxUpdate', async (update: any) => {
        logger.info(`New email detected in ${account.name}:`, update);
        
        try {
          // Fetch new emails
          if (client) {
            const newEmails = await client.fetch(update.uid, { uid: true });
            
            for await (const message of newEmails) {
              if (message.envelope) {
                const fullMessage = await client.download(String(message.uid));
                if (fullMessage) {
                  await processEmail(fullMessage, account, 'INBOX');
                }
              }
            }
          }
        } catch (error) {
          logger.error('Failed to process new email:', error);
        }
      });

      // Keep IDLE connection alive
      (idle as any).on('error', (error: any) => {
        logger.error(`IDLE error for ${account.name}:`, error);
      });
    }

    // Keep the connection alive
    setInterval(() => {
      if (client && client.authenticated) {
        client.noop().catch(error => {
          logger.error(`NOOP failed for ${account.name}:`, error);
        });
      }
    }, 30000); // Send NOOP every 30 seconds

  } catch (error) {
    logger.error(`Failed to sync account ${account.name}:`, error);
  }
}

// Start IMAP sync for all accounts
export async function startImapSync(): Promise<void> {
  const accounts = getImapAccounts();
  
  if (accounts.length === 0) {
    logger.warn('No IMAP accounts configured');
    return;
  }

  logger.info(`Starting IMAP sync for ${accounts.length} accounts`);

  // Start sync for each account
  for (const account of accounts) {
    // Run each account sync in parallel
    setImmediate(() => {
      syncAccount(account).catch(error => {
        logger.error(`Account sync failed for ${account.name}:`, error);
      });
    });
  }
}

// Manual sync function (for testing)
export async function manualSync(): Promise<void> {
  logger.info('Starting manual sync...');
  await startImapSync();
}
