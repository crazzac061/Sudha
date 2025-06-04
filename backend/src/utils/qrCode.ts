import QRCode from 'qrcode';
import path from 'path';
import fs from 'fs/promises';
import crypto from 'crypto';

interface QRCodeOptions {
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
  margin?: number;
  scale?: number;
  width?: number;
}

class QRCodeError extends Error {
  constructor(message: string, public originalError?: Error) {
    super(message);
    this.name = 'QRCodeError';
  }
}

const validateWasteId = (wasteId: string): void => {
  if (!wasteId || typeof wasteId !== 'string') {
    throw new QRCodeError('Invalid waste ID provided');
  }
};

const ensureUploadDirectory = async (dirPath: string): Promise<void> => {
  try {
    await fs.access(dirPath);
  } catch {
    await fs.mkdir(dirPath, { recursive: true });
  }
};

const cleanupOldFiles = async (dirPath: string, maxAgeHours = 24): Promise<void> => {
  try {
    const files = await fs.readdir(dirPath);
    const now = Date.now();
    
    for (const file of files) {
      const filePath = path.join(dirPath, file);
      const stats = await fs.stat(filePath);
      const ageHours = (now - stats.ctimeMs) / (1000 * 60 * 60);
      
      if (ageHours > maxAgeHours) {
        await fs.unlink(filePath);
      }
    }
  } catch (error) {
    console.warn('Failed to cleanup old QR codes:', error);
  }
};

export const generateQRCode = async (
  wasteId: string, 
  options: QRCodeOptions = {}
): Promise<string> => {
  try {
    validateWasteId(wasteId);

    const uploadDir = path.join(__dirname, '../../uploads/qr');
    await ensureUploadDirectory(uploadDir);

    // Clean up old files in the background
    cleanupOldFiles(uploadDir).catch(console.error);

    const qrData = JSON.stringify({
      wasteId,
      timestamp: Date.now(),
      nonce: crypto.randomBytes(16).toString('hex')
    });

    const fileName = `${wasteId}-${Date.now()}-${crypto.randomBytes(4).toString('hex')}.png`;
    const filePath = path.join(uploadDir, fileName);

    await QRCode.toFile(filePath, qrData, {
      errorCorrectionLevel: options.errorCorrectionLevel || 'H',
      margin: options.margin || 1,
      scale: options.scale || 8,
      width: options.width || 300
    });

    // Verify the file was created
    await fs.access(filePath);

    return `/uploads/qr/${fileName}`;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('QR Code generation error:', error);
    throw new QRCodeError(`Failed to generate QR code: ${message}`, error as Error);
  }
};
