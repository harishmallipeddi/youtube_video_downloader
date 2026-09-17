import axios from 'axios';

const API_BASE_URL = '/api';

export interface AvailableFormat {
  quality: string;
  format_id: string;
  ext: string;
  label: string;
}

export interface VideoInfo {
  title: string;
  thumbnail: string;
  duration: string;
  channel: string;
  url: string;
  available_formats: AvailableFormat[];
}

export interface ProgressResponse {
  status: 'downloading' | 'merging' | 'completed' | 'error';
  percent: number;
  speed: string;
  filename: string;
  error?: string;
}

export const api = {
  async getVideoInfo(url: string): Promise<VideoInfo> {
    const res = await axios.post<VideoInfo>(`${API_BASE_URL}/video-info`, { url });
    return res.data;
  },

  async startDownload(url: string, format_id: string, ext: string = 'mp4'): Promise<{ task_id: string }> {
    const res = await axios.post<{ task_id: string }>(`${API_BASE_URL}/download`, {
      url,
      format_id,
      ext
    });
    return res.data;
  },

  async getProgress(taskId: string): Promise<ProgressResponse> {
    const res = await axios.get<ProgressResponse>(`${API_BASE_URL}/progress/${taskId}`);
    return res.data;
  },

  getDownloadUrl(taskId: string): string {
    return `${API_BASE_URL}/get-file/${taskId}`;
  }
};
