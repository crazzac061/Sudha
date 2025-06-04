import React, { useState, useRef } from 'react';
import { View, StyleSheet, ScrollView, Modal, Alert, ActivityIndicator, TouchableOpacity, Image } from 'react-native';
import { Input, Button, Text, Overlay, Card, Icon } from '@rneui/themed';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import QRCode from 'react-native-qrcode-svg';
import * as FileSystem from 'expo-file-system';
import { WasteQRData, formatWasteQRData, shareQRCode } from '../utils/wasteUtils';
import * as tf from '@tensorflow/tfjs';
import { bundleResourceIO, decodeJpeg } from '@tensorflow/tfjs-react-native';
import { Linking } from 'react-native';

// Define the DIY recommendation types
type DIYProject = {
  title: string;
  description: string;
  difficulty: string;
  youtubeLink: string;
  materials: string[];
};

type WasteType = 'plastic_bottle' | 'glass_bottles' | 'paper_waste' | 'cardboard';

// Add DIY recommendations database
const diyRecommendations: Record<WasteType, DIYProject[]> = {
  plastic_bottle: [
    {
      title: 'Decorative Flower Vase',
      description: 'Turn plastic bottles into beautiful vases',
      difficulty: 'Easy',
      youtubeLink: 'https://youtube.com/watch?v=example1',
      materials: ['Plastic bottle', 'Paint', 'Scissors', 'Decorative items']
    },
    {
      title: 'Vertical Garden',
      description: 'Create hanging planters from bottles',
      difficulty: 'Medium',
      youtubeLink: 'https://youtube.com/watch?v=example2',
      materials: ['Plastic bottles', 'Rope', 'Soil', 'Seeds']
    }
  ],
  glass_bottles: [],
  paper_waste: [],
  cardboard: []
};

const AddWasteScreen = () => {
  const qeRef=useRef<QRCode>(null);
  interface WasteForm {
    type: string;
    quantity: string;
    unit: string;
    condition: string;
    images: ImagePicker.ImagePickerAsset[];
    location: Location.LocationObject | null;
  }
  
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
  const qrRef = useRef<any>(null);

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
    if (!qrRef.current || !qrData) {
      Alert.alert('Error', 'QR Code not ready');
      return;
    }
    
    setSaving(true);
    try {
      const path = `${FileSystem.documentDirectory}waste-qr-${qrData.wasteId}.png`;
      
      // Use Promise to handle the async toDataURL callback
      const qrDataUrl = await new Promise<string>((resolve, reject) => {
        qrRef.current?.toDataURL(
          (data: string) => resolve(data),
          (error: Error) => reject(error)
        );
      });

      await FileSystem.writeAsStringAsync(
        path,
        qrDataUrl,
        { encoding: FileSystem.EncodingType.Base64 }
      );
      
      Alert.alert('Success', 'QR Code saved successfully!');
    } catch (error) {
      console.error('Save QR error:', error);
      Alert.alert('Error', 'Failed to save QR code');
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

  const [showDIY, setShowDIY] = useState(false);
  const [diyImage, setDiyImage] = useState<string | null>(null);
  const [diyLoading, setDiyLoading] = useState(false);
  const [diyResults, setDiyResults] = useState<any[]>([]);
  const modelRef = useRef<tf.LayersModel | null>(null);

  const loadModel = async () => {
    try {
      await tf.ready();
      // Load model directly from Teachable Machine URL
      modelRef.current = await tf.loadLayersModel(
        'https://teachablemachine.withgoogle.com/models/mH9HKRCUG/model.json'
      );
    } catch (error) {
      console.error('Error loading model:', error);
      Alert.alert('Error', 'Failed to load AI model');
    }
  };

  const analyzeDIYImage = async (imageUri: string) => {
    setDiyLoading(true);
    try {
      if (!modelRef.current) await loadModel();
      
      const imgB64 = await FileSystem.readAsStringAsync(imageUri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      const imgBuffer = tf.util.encodeString(imgB64, 'base64').buffer;
      const raw = new Uint8Array(imgBuffer);
      const imageTensor = decodeJpeg(raw);
      
      // Process image
      const resized = tf.image.resizeBilinear(imageTensor, [224, 224]);
      const expanded = resized.expandDims(0);
      const normalized = expanded.div(255.0);
      const prediction = await modelRef.current?.predict(normalized);
      
      if (prediction) {
        // Get the index of the highest probability
        const predictionArray = await prediction.data();
        const maxIndex = predictionArray.indexOf(Math.max(...predictionArray));
        
        // Map index to waste type based on your Teachable Machine classes
        const wasteTypes = ['plastic_bottle', 'glass_bottles', 'paper_waste', 'cardboard'];
        const predictedType = wasteTypes[maxIndex];
        
        if (diyRecommendations[predictedType]) {
          setDiyResults(diyRecommendations[predictedType]);
          Alert.alert(
            'Waste Identified!', 
            `This appears to be ${predictedType.replace('_', ' ')}. Here are some DIY ideas!`
          );
        } else {
          Alert.alert('Sorry', 'No DIY recommendations available for this type of waste yet.');
        }
      }
    } catch (error) {
      console.error('Error analyzing image:', error);
      Alert.alert('Error', 'Failed to analyze image');
    } finally {
      setDiyLoading(false);
    }
  };

  const pickDIYImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled) {
      setDiyImage(result.assets[0].uri);
      analyzeDIYImage(result.assets[0].uri);
    }
  };

  const openYoutubeLink = (url: string) => {
    Linking.openURL(url);
  };

  return (
    <>
      <ScrollView style={styles.container}>
        <Text h4 style={styles.title}>List Your Waste</Text>
        
        <Input
          placeholder="Type of waste (e.g., Sawdust)"
          value={form.type}
          onChangeText={(text: string) => setForm(prev => ({ ...prev, type: text }))}
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
          icon={{
            name: 'image',
            type: 'material',
            size: 24,
            color: 'white',
          }}
        />

        <Button
          title={form.location ? "Location Added ✓" : "Get Current Location"}
          onPress={getLocation}
          containerStyle={styles.buttonContainer}
          disabled={!!form.location}
          icon={{
            name: 'location-on',
            type: 'material',
            size: 24,
            color: 'white',
          }}
        />

        <Button
          title="Submit Listing"
          onPress={handleSubmit}
          containerStyle={styles.submitButton}
          icon={{
            name: 'check-circle',
            type: 'material',
            size: 24,
            color: 'white',
          }}
        />

        <Button
          title="Get DIY Ideas"
          onPress={() => setShowDIY(true)}
          containerStyle={styles.diyButton}
          icon={{
            name: 'lightbulb',
            type: 'material',
            size: 24,
            color: 'white',
          }}
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
                {qrData && 'wasteId' in qrData && (
                  <Text style={styles.wasteId}>ID: {(qrData as WasteQRData).wasteId}</Text>
                )}
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

      <Modal
        visible={showDIY}
        transparent
        animationType="slide"
        onRequestClose={() => setShowDIY(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text h4 style={styles.modalTitle}>DIY Waste Projects</Text>
            
            {!diyImage ? (
              <Button
                title="Upload Waste Photo"
                onPress={pickDIYImage}
                containerStyle={styles.uploadButton}
                icon={{ name: 'camera', type: 'material-community', color: 'white' }}
              />
            ) : (
              <Image source={{ uri: diyImage }} style={styles.previewImage} />
            )}

            {diyLoading && (
              <ActivityIndicator size="large" color="#43A047" />
            )}

            <ScrollView style={styles.recommendationsContainer}>
              {diyResults.map((item, index) => (
                <Card key={index} containerStyle={styles.diyCard}>
                  <Card.Title style={styles.diyTitle}>{item.title}</Card.Title>
                  <Card.Divider />
                  <Text style={styles.diyDescription}>{item.description}</Text>
                  <Text style={styles.diyDifficulty}>Difficulty: {item.difficulty}</Text>
                  <Text style={styles.diyMaterials}>
                    Materials needed:{'\n'}
                    {item.materials.join('\n• ')}
                  </Text>
                  <Button
                    title="Watch Tutorial"
                    onPress={() => openYoutubeLink(item.youtubeLink)}
                    containerStyle={styles.tutorialButton}
                    buttonStyle={styles.tutorialButtonStyle}
                  />
                </Card>
              ))}
            </ScrollView>

            <Button
              title="Close"
              onPress={() => {
                setShowDIY(false);
                setDiyImage(null);
                setDiyResults([]);
              }}
              containerStyle={styles.closeButton}
              type="outline"
            />
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E8F5E9', // Light green background
    padding: 16,
  },
  qrContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    marginHorizontal: 4,
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
    color: '#2E7D32',
    textAlign: 'center',
    marginBottom: 20,
    fontSize: 24,
  },
  inputContainer: {
    backgroundColor: '#F1F8E9',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 15,
  },
  inputLabel: {
    color: '#2E7D32',
    fontSize: 16,
  },
  buttonContainer: {
    marginVertical: 10,
    borderRadius: 8,
    backgroundColor: '#43A047',
  },
  submitButton: {
    marginTop: 20,
    marginBottom: 40,
    backgroundColor: '#2E7D32',
    borderRadius: 8,
  },
  diyButton: {
    marginTop: 20,
    backgroundColor: '#2E7D32', // Dark green
    borderRadius: 8,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 15,
    width: '90%',
    maxHeight: '80%',
  },
  modalTitle: {
    textAlign: 'center',
    color: '#2E7D32',
    marginBottom: 20,
  },
  uploadButton: {
    marginVertical: 20,
    backgroundColor: '#43A047',
    borderRadius: 8,
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginBottom: 20,
  },
  recommendationsContainer: {
    maxHeight: 400,
  },
  diyCard: {
    borderRadius: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#81C784',
    elevation: 3,
  },
  diyTitle: {
    color: '#2E7D32',
    fontSize: 18,
    fontWeight: 'bold',
  },
  diyDescription: {
    color: '#1B5E20',
    fontSize: 16,
    marginBottom: 10,
  },
  diyDifficulty: {
    color: '#43A047',
    fontSize: 14,
    marginBottom: 5,
  },
  diyMaterials: {
    color: '#1B5E20',
    fontSize: 14,
    marginVertical: 10,
  },
  tutorialButton: {
    marginTop: 10,
  },
  tutorialButtonStyle: {
    backgroundColor: '#43A047',
    borderRadius: 8,
  },
  closeButton: {
    marginTop: 20,
    borderColor: '#43A047',
  },
});

export default AddWasteScreen;