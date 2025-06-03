import { Platform, Share } from 'react-native';
import * as FileSystem from 'expo-file-system';

export interface WasteQRData {
  wasteId: string;
  type: string;
  quantity: string;
  unit: string;
  condition: string;
  timestamp: string;
  location?: {
    latitude: number;
    longitude: number;
  };
}

export const generateWasteId = () => {
  return 'W' + Date.now().toString(36) + Math.random().toString(36).substring(2);
};

export const formatWasteQRData = (data: Omit<WasteQRData, 'wasteId' | 'timestamp'>): WasteQRData => {
  return {
    ...data,
    wasteId: generateWasteId(),
    timestamp: new Date().toISOString(),
  };
};

export const shareQRCode = async (svgRef: any, wasteData: WasteQRData) => {
  try {
    const message = `CircularChain Waste Item\nID: ${wasteData.wasteId}\nType: ${wasteData.type}\nQuantity: ${wasteData.quantity} ${wasteData.unit}`;
    await Share.share({
      message,
      title: 'Waste QR Code',
    });
  } catch (error) {
    console.error('Error sharing QR code:', error);
  }
};
