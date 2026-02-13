import React from 'react';
import QRCode from 'react-native-qrcode-svg';

export interface PaymentQRData {
  amount: number;
  currency: string;
  timestamp: number;
  type: 'payment_request';
  walletAddress?: string;
}

export const generatePaymentQRData = (amount: number, currency: string = 'NPR', walletAddress?: string): PaymentQRData => {
  return {
    amount,
    currency,
    timestamp: Date.now(),
    type: 'payment_request',
    walletAddress,
  };
};

export const parsePaymentQRData = (qrString: string): PaymentQRData | null => {
  try {
    const data = JSON.parse(qrString);
    if (data.type === 'payment_request' && data.amount && data.currency) {
      return data as PaymentQRData;
    }
    return null;
  } catch (error) {
    console.error('Failed to parse QR data:', error);
    return null;
  }
};
