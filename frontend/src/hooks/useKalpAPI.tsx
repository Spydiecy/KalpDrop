"use client"
import { useState } from 'react';

export const useKalpApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const apiKey = process.env.NEXT_PUBLIC_API_KEY;

  const callApi = async (endpoint: string, args: { [key: string]: any }) => {
    setError(null);
    setLoading(true);
    const params = {
      network: 'TESTNET',
      blockchain: 'KALP',
      walletAddress: 'c7c7894eacdd0457030298d571302b4eacb911b9',
      args: args,
    };

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey!,
        },
        body: JSON.stringify(params),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
      }
      setLoading(false);
      return data;
    } catch (err: any) {
      setError(err);
      setLoading(false);
      throw err;
    }
  };

  const claim = async (address: string) => {
    const endpoint =
      'https://gateway-api.kalp.studio/v1/contract/kalp/invoke/hXnehquPHxcvX0joxaLGEBXPyso1hhYo1726835489367/Claim';
    const args = {
      amount: 100,
      address: address,
    };
    return callApi(endpoint, args);
  };

  const balanceOf = async (account: string) => {
    const endpoint =
      'https://gateway-api.kalp.studio/v1/contract/kalp/query/hXnehquPHxcvX0joxaLGEBXPyso1hhYo1726835489367/BalanceOf';
    const args = {
      account: account,
    };
    return callApi(endpoint, args);
  };
  
  const transferFrom = async (from: string, to: string, value: number) => {
    const endpoint =
      'https://gateway-api.kalp.studio/v1/contract/kalp/invoke/hXnehquPHxcvX0joxaLGEBXPyso1hhYo1726835489367/TransferFrom';
    const args = {
      from,
      to,
      value,
    };
    return callApi(endpoint, args);
  };

  const totalSupply = async () => {
    const endpoint =
      'https://gateway-api.kalp.studio/v1/contract/kalp/query/hXnehquPHxcvX0joxaLGEBXPyso1hhYo1726835489367/TotalSupply';
    const args = {};
    return callApi(endpoint, args);
  };

  return { claim, balanceOf, totalSupply, transferFrom, loading, error };
};