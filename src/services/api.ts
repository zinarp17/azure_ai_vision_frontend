import axios from 'axios';
import type { AnalyzeImageResponse } from '../types/azure';

const api = axios.create({
  baseURL: process.env.REACT_APP_AZURE_API_URL?.replace(/^@/, '') || '',
});

export type AnalyzeImageRequest = {
  url: string;
  genderNeutral: boolean;
};

export async function analyzeImage(
  body: AnalyzeImageRequest
): Promise<AnalyzeImageResponse> {
  const { data } = await api.post<AnalyzeImageResponse>('/', body);
  return data;
}


