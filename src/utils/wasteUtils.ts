import { Platform, Share , Alert } from 'react-native';
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
    // Get QR code as base64
    const qrDataUrl = await new Promise<string>((resolve, reject) => {
      if (!svgRef) {
        reject(new Error('QR Code reference not available'));
        return;
      }
      svgRef.toDataURL(
        (data: string) => resolve(data),
        (error: Error) => reject(error)
      );
    });

    // Create a temporary file
    const tempFile = `${FileSystem.cacheDirectory}temp-qr-${wasteData.wasteId}.png`;
    await FileSystem.writeAsStringAsync(tempFile, qrDataUrl, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // Share the QR code with details
    const message = `CircularChain Waste Item\nID: ${wasteData.wasteId}\nType: ${wasteData.type}\nQuantity: ${wasteData.quantity} ${wasteData.unit}`;
    await Share.share({
      message,
      title: 'Waste QR Code',
      url: tempFile, // This will attach the QR code image
    });

    // Clean up the temporary file
    await FileSystem.deleteAsync(tempFile, { idempotent: true });
  } catch (error) {
    console.error('Error sharing QR code:', error);
    Alert.alert('Error', 'Failed to share QR code');
  }
};
