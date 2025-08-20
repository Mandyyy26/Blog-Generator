export interface BlogResponse {
    title: string;
    slug: string;
    markdown: string;
    fileUrl?: string;
  }
  
  export interface FormData {
    topic: string;
    title: string;
    tags: string[];
  }
  
  export interface StepperStep {
    id: number;
    name: string;
    description: string;
    status: 'pending' | 'current' | 'complete';
  }