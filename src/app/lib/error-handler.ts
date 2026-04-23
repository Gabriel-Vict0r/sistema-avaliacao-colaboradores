import { toast } from 'sonner';

export function extractApiErrorMessage(error: any, fallback: string): string {
  const apiError = error?.response?.data?.error;
  if (!apiError) return fallback;

  if (Array.isArray(apiError.details) && apiError.details.length > 0) {
    return apiError.details.map((d: any) => d.message).join(' | ');
  }

  return apiError.message || fallback;
}

export const handleApiError = (error: any, fallback = 'Erro ao processar requisição') => {
  if (error.response) {
    toast.error(extractApiErrorMessage(error, fallback));
  } else if (error.request) {
    toast.error('Erro de conexão com o servidor');
  } else {
    toast.error('Erro inesperado');
  }
  console.error('API Error:', error);
};
