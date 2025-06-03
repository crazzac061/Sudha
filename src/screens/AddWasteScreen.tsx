import React, { useState, useRef } from 'react';
import { View, StyleSheet, ScrollView, Modal, Alert, ActivityIndicator } from 'react-native';
import { Input, Button, Text, Overlay } from '@rneui/themed';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import QRCode from 'react-native-qrcode-svg';
import * as FileSystem from 'expo-file-system';
import { WasteQRData, formatWasteQRData, shareQRCode } from '../utils/wasteUtils';

interface WasteForm {
  type: string;
  quantity: string;
  unit: string;
  condition: string;
  images: ImagePicker.ImagePickerAsset[];
  location: Location.LocationObject | null;
}

const AddWasteScreen = () => {
  const [form, setForm] = useState<WasteForm>({
    type: '',
    quantity: '',
    unit: 'kg',
    condition: '',
    images: [],
    location: null,
  });
  const [qrData, setQrData] = useState<WasteQRData | null>(null);
  const [showQR, setShowQR] = useState(false);
  const qrRef = useRef<QRCode>();

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.7,
    });

    if (!result.canceled) {
      setForm(prev => ({
        ...prev,
        images: [...prev.images, ...result.assets]
      }));
    }
  };

  const getLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      alert('Permission to access location was denied');
      return;
    }

    const location = await Location.getCurrentPositionAsync({});
    setForm(prev => ({ ...prev, location }));
  };

  const [saving, setSaving] = useState(false);

  const validateForm = () => {
    const errors = [];
    if (!form.type.trim()) errors.push('Type of waste');
    if (!form.quantity.trim()) errors.push('Quantity');
    if (!form.condition.trim()) errors.push('Condition');
    
    if (errors.length > 0) {
      Alert.alert(
        'Required Fields',
        `Please fill in the following fields:\n${errors.join('\n')}`,
        [{ text: 'OK' }]
      );
      return false;
    }
    return true;
  };

  const saveQRCode = async () => {
    if (!qrRef.current || !qrData) return;
    
    setSaving(true);
    try {
      const path = `${FileSystem.documentDirectory}waste-qr-${qrData.wasteId}.png`;
      qrRef.current.toDataURL(async (data: string) => {
        try {
          const base64Data = `data:image/png;base64,${data}`;
          await FileSystem.writeAsStringAsync(path, base64Data.split('base64,')[1], {
            encoding: FileSystem.EncodingType.Base64,
          });
          Alert.alert('Success', 'QR Code saved successfully!');
        } catch (err) {
          Alert.alert('Error', 'Failed to save QR code');
        }
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to generate QR code');
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    const wasteData = formatWasteQRData({
      type: form.type.trim(),
      quantity: form.quantity.trim(),
      unit: form.unit,
      condition: form.condition.trim(),
      location: form.location ? {
        latitude: form.location.coords.latitude,
        longitude: form.location.coords.longitude,
      } : undefined,
    });

    setQrData(wasteData);
    setShowQR(true);
  };

  return (
    <>
      <ScrollView style={styles.container}>
        <Text h4 style={styles.title}>List Your Waste</Text>
        
        <Input
          placeholder="Type of waste (e.g., Sawdust)"
          value={form.type}
          onChangeText={(text: string) => setForm(prev => ({ ...prev, type: text }))}
          label="Type *"
          errorStyle={{ color: 'red' }}
          errorMessage={form.type.trim() ? '' : 'Required field'}
        />

        <Input
          placeholder="Quantity"
          keyboardType="numeric"
          value={form.quantity}
          onChangeText={(text) => setForm(prev => ({ ...prev, quantity: text }))}
          label="Quantity *"
          errorStyle={{ color: 'red' }}
          errorMessage={form.quantity.trim() ? '' : 'Required field'}
        />

        <Input
          placeholder="Condition (e.g., Clean, dry)"
          value={form.condition}
          onChangeText={(text) => setForm(prev => ({ ...prev, condition: text }))}
          label="Condition *"
          errorStyle={{ color: 'red' }}
          errorMessage={form.condition.trim() ? '' : 'Required field'}
        />

        <Button
          title={`Add Photos (${form.images.length} selected)`}
          onPress={pickImage}
          containerStyle={styles.buttonContainer}
        />

        <Button
          title={form.location ? "Location Added ✓" : "Get Current Location"}
          onPress={getLocation}
          containerStyle={styles.buttonContainer}
          disabled={!!form.location}
        />

        <Button
          title="Submit Listing"
          onPress={handleSubmit}
          containerStyle={styles.submitButton}
        />
      </ScrollView>

      <Modal
        visible={showQR}
        transparent
        animationType="slide"
        onRequestClose={() => setShowQR(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text h4 style={styles.modalTitle}>Waste QR Code</Text>
            {qrData && (
              <View style={styles.qrContainer}>
                <QRCode
                  value={JSON.stringify(qrData)}
                  size={200}
                  ref={qrRef}
                />
                <Text style={styles.wasteId}>ID: {qrData.wasteId}</Text>
              </View>
            )}
            <View style={styles.modalButtons}>
              <Button
                title="Share"
                onPress={() => qrData && shareQRCode(qrRef.current, qrData)}
                containerStyle={[styles.modalButton, styles.buttonMargin]}
                icon={{ name: 'share', color: 'white' }}
              />
              <Button
                title="Save"
                onPress={saveQRCode}
                containerStyle={[styles.modalButton, styles.buttonMargin]}
                icon={{ name: 'save', color: 'white' }}
                disabled={saving}
              />
              <Button
                title="Close"
                onPress={() => setShowQR(false)}
                containerStyle={styles.modalButton}
                type="outline"
              />
            </View>
            {saving && (
              <View style={styles.loadingOverlay}>
                <ActivityIndicator size="large" color="#0000ff" />
                <Text style={styles.loadingText}>Saving QR Code...</Text>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  buttonMargin: {
    marginHorizontal: 4,
  },
  title: {
    textAlign: 'center',
    marginBottom: 20,
  },
  buttonContainer: {
    marginVertical: 10,
  },
  submitButton: {
    marginTop: 20,
    marginBottom: 40,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    width: '80%',
  },
  modalTitle: {
    marginBottom: 20,
    textAlign: 'center',
  },
  qrContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  wasteId: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  modalButton: {
    width: '45%',
  },
});

export default AddWasteScreen;