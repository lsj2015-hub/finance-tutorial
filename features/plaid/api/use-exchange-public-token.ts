import { InferRequestType, InferResponseType } from 'hono';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { client } from '@/lib/hono';

type ResponseType = InferResponseType<
  (typeof client.api.plaid)['exchange-public-token']['$post'],
  200
>;
type RequestType = InferRequestType<
  (typeof client.api.plaid)['exchange-public-token']['$post']
>['json'];

export const useExchangePublicToken = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async (json) => {
      const response = await client.api.plaid['exchange-public-token'].$post({
        json,
      });

      if (!response.ok) {
        throw new Error('Failed to exchange public token');
      }

      return await response.json();
    },
    onSuccess: () => {
      toast.success('Public token exchanged');
      // TODO: Reinvalidate the following
      // connected-bank
      queryClient.invalidateQueries({ queryKey: ['connected-bank'] });
      // summary
      queryClient.invalidateQueries({ queryKey: ['summary'] });
      // transactions
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      // accounts
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      // categories
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
    onError: () => {
      toast.error('Failed to exchange public token');
    },
  });

  return mutation;
};
