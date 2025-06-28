export interface QueData {
    request: {
      userId: string;
      contents: {
        userId: string;
        contentId: string;
        courseId: string;
        batchId: string;
        status: number;
        completionPercentage: number;
      }[];
    };
  }
  export interface assementQueData {
    request: {
      userId: string;
      contents: {
        userId: string;
        contentId: string;
        courseId: string;
        batchId: string
      }[];
      body: any;
    };
  }
  export interface QueRequest {
    msg_id: string;
    priority: number;
    timestamp: number;
    data: string;
    item_count: number;
    config: string;
    type: string;
    request: string;
  }