import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Alert } from 'react-native';
import { Text, Button } from '@rneui/themed';
import { Camera, CameraView, type BarcodeScanningResult } from 'expo-camera';
import { WasteQRData } from '../utils/wasteUtils';
import { WasteDetails } from '../components/WasteDetails';
import { SafeAreaView } from 'react-native-safe-area-context';

const ScanQRScreen: React.FC = () => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [scannedWaste, setScannedWaste] = useState<WasteQRData | null>(null);

  useEffect(() => {
    const getCameraPermission = async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    };

    getCameraPermission();
  }, []);

  const resetScan = () => {
    setScanned(false);
    setScannedWaste(null);
  };

  const handleBarCodeScanned = ({ type, data }: BarcodeScanningResult) => {
    setScanned(true);
    try {
      const wasteData = JSON.parse(data) as WasteQRData;
      if (wasteData.wasteId && wasteData.type && wasteData.quantity) {
        setScannedWaste(wasteData);
      } else {
        Alert.alert('Invalid QR Code', 'This QR code does not contain valid waste data.');
        resetScan();
      }
    } catch (error) {
      Alert.alert('Error', 'Could not read QR code data. Please try again.');
      resetScan();
    }
  };

  if (hasPermission === null) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.message}>Requesting camera permission...</Text>
      </SafeAreaView>
    );
  }

  if (hasPermission === false) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.message}>No access to camera</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.camera}>
        <CameraView
          style={StyleSheet.absoluteFillObject}
          onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
          barcodeScannerSettings={{
            barcodeTypes: ['qr'],
          }}
        >
          <View style={styles.overlay}>
            {!scannedWaste && scanned && (
              <Button
                title="Tap to Scan Again"
                onPress={resetScan}
                containerStyle={styles.button}
                icon={{ name: 'qr-code-scanner', color: 'white' }}
              />
            )}
          </View>
        </CameraView>
      </View>
      
      {scannedWaste && (
        <View style={styles.detailsContainer}>
          <WasteDetails
            waste={scannedWaste}
            onClose={resetScan}
          />
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'flex-end',
    padding: 16,
  },
  button: {
    marginBottom: 16,
  },
  detailsContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    padding: 20,
  },
  message: {
    textAlign: 'center',
    marginTop: 20,
  },
});

export default ScanQRScreen;