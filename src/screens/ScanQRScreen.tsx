import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Alert } from 'react-native';
import { Text, Button } from '@rneui/themed';
import { BarCodeScanner, BarCodeScannedCallback } from 'expo-barcode-scanner';
import { Camera as ExpoCamera } from 'expo-camera';
import { WasteQRData } from '../utils/wasteUtils';
import { WasteDetails } from '../components/WasteDetails';

const ScanQRScreen = () => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [scannedWaste, setScannedWaste] = useState<WasteQRData | null>(null);

  useEffect(() => {
    const getCameraPermission = async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    };

    getCameraPermission();
  }, []);

  const resetScan = () => {
    setScanned(false);
    setScannedWaste(null);
  };

  const handleBarCodeScanned: BarCodeScannedCallback = ({ type, data }) => {
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
    return <Text>Requesting camera permission...</Text>;
  }

  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  return (
    <View style={styles.container}>
      <View style={styles.camera}>
        <BarCodeScanner
          onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
          style={StyleSheet.absoluteFillObject}
          barCodeTypes={[BarCodeScanner.Constants.BarCodeType.qr]}
        />
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
      </View>
      
      {scannedWaste && (
        <View style={styles.detailsContainer}>
          <WasteDetails
            waste={scannedWaste}
            onClose={resetScan}
          />
        </View>
      )}
    </View>
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
});

export default ScanQRScreen;