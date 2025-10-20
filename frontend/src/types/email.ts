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

export interface EmailSearchParams {
  query?: string;
  account?: string;
  folder?: string;
  category?: string;
  from?: string;
  to?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface EmailSearchResponse {
  emails: Email[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface EmailStats {
  totalEmails: number;
  byCategory: Record<string, number>;
  byAccount: Record<string, number>;
  byFolder: Record<string, number>;
  recentEmails: Array<{
    date: string;
    count: number;
  }>;
}
