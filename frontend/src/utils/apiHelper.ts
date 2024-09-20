// utils/apiHelper.ts

export interface KalpApiResponse<T = unknown> {
    status: number;
    data: T;
  }
  
  // utils/apiHelper.ts

  export async function callKalpApi<T = unknown>(
    endpoint: string,
    args: Record<string, unknown> = {}
  ): Promise<KalpApiResponse<T>> {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'auth': process.env.NEXT_PUBLIC_API_KEY as string, // Make sure this matches your .env variable name
      },
      body: JSON.stringify({
        network: 'TESTNET',
        blockchain: 'KALP',
        walletAddress: 'c7c7894eacdd0457030298d571302b4eacb911b9',
        args,
      }),
    });
  
    const data = await response.json();
    return { status: response.status, data };
}