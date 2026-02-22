
export interface EbookConfig {
  topic: string;
  pageCount: number;
  tone: string;
  authorName: string;
  generateImages: boolean;
}

export interface Chapter {
  id: string;
  title: string;
  description?: string;
  content?: string;
  imagePrompt?: string;
  imageCaption?: string;
  imageUrl?: string;
  proTips?: string[];
}

export interface EbookData {
  title: string;
  disclaimer: string;
  chapters: Chapter[];
  aboutAuthor: string;
}

export enum AppStatus {
  IDLE = 'IDLE',
  CONFIGURING = 'CONFIGURING',
  GENERATING_OUTLINE = 'GENERATING_OUTLINE',
  GENERATING_CHAPTERS = 'GENERATING_CHAPTERS',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR'
}
