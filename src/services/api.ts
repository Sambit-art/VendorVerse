import axiosClient from '@/lib/axios';

export interface Service {
  title: string;
  description: string;
}

interface SuggestionsPayload {
  clientInterest: string;
  vendorCapability: string;
}

export const getSuggestions = async (payload: SuggestionsPayload): Promise<{ services: Service[] }> => {
  const response = await axiosClient.post('/suggestions', payload);
  return response.data;
};

export const finalizeServices = async (services: string[]): Promise<{ success: boolean, message: string }> => {
  const response = await axiosClient.post('/finalize', { services });
  return response.data;
};
