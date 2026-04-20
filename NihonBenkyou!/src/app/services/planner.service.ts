import { api } from './api';

export interface StudyBlock {
  id: number;
  title: string;
  scheduledAt: string;
  duration: number;
  completed: boolean;
  date: string;
  sortOrder: number;
}

export interface CreateStudyBlockRequest {
  title: string;
  scheduledAt: string;
  duration: number;
  date?: string;
}

export const plannerService = {
  async getBlocks(date?: string): Promise<StudyBlock[]> {
    const params: Record<string, string> = {};
    if (date) params.date = date;
    return api.get<StudyBlock[]>('/planner/blocks', params);
  },

  async createBlock(data: CreateStudyBlockRequest): Promise<StudyBlock> {
    return api.post<StudyBlock>('/planner/blocks', data);
  },

  async updateBlock(id: number, data: Partial<StudyBlock>): Promise<StudyBlock> {
    return api.patch<StudyBlock>(`/planner/blocks/${id}`, data);
  },

  async deleteBlock(id: number): Promise<void> {
    return api.delete(`/planner/blocks/${id}`);
  },
};
