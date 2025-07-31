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
  try {
    const response = await axiosClient.post('company/generate_suggestion/', {
      client_text: payload.clientInterest,
      vendor_text: payload.vendorCapability,
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching suggestions:', error);
    throw error; // Re-throw the error to be handled by the caller
  }
};

export const finalizeServices = async (services: string[]): Promise<{ success: boolean, message: string }> => {
  try {
    const response = await axiosClient.post('/api/finalize', { services });
    return response.data;
  } catch (error) {
    console.error('Error finalizing services:', error);
    throw error; // Re-throw the error to be handled by the caller
  }
};
