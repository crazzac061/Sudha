import React, { useState, useRef } from 'react';
<<<<<<< HEAD
import { View, StyleSheet, ScrollView, Modal, Alert, ActivityIndicator, TouchableOpacity, Image } from 'react-native';
import { Input, Button, Text, Overlay, Card, Icon } from '@rneui/themed';
=======
import { View, StyleSheet, ScrollView, Modal, Alert, ActivityIndicator, Image, TouchableOpacity } from 'react-native';
import { Input, Button, Text, Overlay, Icon } from '@rneui/themed';
>>>>>>> 37acbed708e60e8f5db28d845244d5d9b80bc4a6
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import QRCode from 'react-native-qrcode-svg';
import * as FileSystem from 'expo-file-system';
import { WasteQRData, formatWasteQRData, shareQRCode } from '../utils/wasteUtils';
<<<<<<< HEAD
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
=======
import { useNavigation } from '@react-navigation/native';
import { RootStackNavigationProp } from '../types/navigation';

interface WasteForm {
  type: string;
  quantity: string;
  unit: string;
  condition: string;
  description: string;
  images: ImagePicker.ImagePickerAsset[];
  location: Location.LocationObject | null;
}
>>>>>>> 37acbed708e60e8f5db28d845244d5d9b80bc4a6

const WASTE_TYPES = [
  'Wood/Sawdust',
  'Plastic',
  'Metal',
  'Paper/Cardboard',
  'Textile',
  'Glass',
  'Organic',
  'Other'
];

const MOCK_SUGGESTIONS = {
  'Wood/Sawdust': [
    { title: 'DIY Plant Pots', difficulty: 'Easy', materials: ['Sawdust', 'Paper', 'Glue'] },
    { title: 'Fire Starters', difficulty: 'Easy', materials: ['Sawdust', 'Wax'] }
  ],
  'Plastic': [
    { title: 'Vertical Garden', difficulty: 'Medium', materials: ['Plastic Bottles', 'Rope', 'Soil'] },
    { title: 'Storage Containers', difficulty: 'Easy', materials: ['Plastic Containers', 'Paint'] }
  ],
  'Paper/Cardboard': [
    { title: 'DIY Gift Boxes', difficulty: 'Easy', materials: ['Cardboard', 'Paper', 'Glue'] },
    { title: 'Wall Art', difficulty: 'Medium', materials: ['Paper', 'Paint', 'Frame'] }
  ]
};

const AddWasteScreen = () => {
<<<<<<< HEAD
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
=======
  const qrRef = useRef<QRCode>(null);
  const navigation = useNavigation<RootStackNavigationProp>();

  const [form, setForm] = useState<WasteForm>({
    type: '',
    quantity: '',
    unit: 'kg',
    condition: '',
    description: '',
    images: [],
    location: null,
  });

>>>>>>> 37acbed708e60e8f5db28d845244d5d9b80bc4a6
  const [qrData, setQrData] = useState<WasteQRData | null>(null);
  const [showQR, setShowQR] = useState(false);
  const [saving, setSaving] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showImagePicker, setShowImagePicker] = useState(false);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant permission to access your photos');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.7,
      aspect: [4, 3],
    });

    if (!result.canceled) {
      setForm(prev => ({
        ...prev,
        images: [...prev.images, ...result.assets]
      }));
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant permission to use the camera');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
      aspect: [4, 3],
    });

    if (!result.canceled) {
      setForm(prev => ({
        ...prev,
        images: [...prev.images, result.assets[0]]
      }));
    }
  };

  const removeImage = (index: number) => {
    setForm(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const getLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant permission to access location');
      return;
    }

    const location = await Location.getCurrentPositionAsync({});
    setForm(prev => ({ ...prev, location }));
  };

  const validateForm = () => {
    const errors = [];
    if (!form.type.trim()) errors.push('Type of waste');
    if (!form.quantity.trim()) errors.push('Quantity');
    if (!form.condition.trim()) errors.push('Condition');
    if (!form.description.trim()) errors.push('Description');
    if (form.images.length === 0) errors.push('At least one image');
    
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

  const handleTypeChange = (type: string) => {
    setForm(prev => ({ ...prev, type }));
    setSuggestions(MOCK_SUGGESTIONS[type as keyof typeof MOCK_SUGGESTIONS] || []);
  };

  const handleSubmit = async () => {
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
<<<<<<< HEAD
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
=======
    <ScrollView style={styles.container}>
      <Text h4 style={styles.title}>List Your Waste</Text>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Type of Waste</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typeContainer}>
          {WASTE_TYPES.map((type) => (
            <TouchableOpacity
              key={type}
              style={[
                styles.typeButton,
                form.type === type && styles.selectedTypeButton
              ]}
              onPress={() => handleTypeChange(type)}
            >
              <Text style={[
                styles.typeText,
                form.type === type && styles.selectedTypeText
              ]}>{type}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
>>>>>>> 37acbed708e60e8f5db28d845244d5d9b80bc4a6

      <Input
        placeholder="Quantity"
        keyboardType="numeric"
        value={form.quantity}
        onChangeText={(text) => setForm(prev => ({ ...prev, quantity: text }))}
        label="Quantity *"
      />
      <View style={styles.unitContainer}>
        <Text>kg</Text>
      </View>

      <Input
        placeholder="Condition (e.g., Clean, dry)"
        value={form.condition}
        onChangeText={(text) => setForm(prev => ({ ...prev, condition: text }))}
        label="Condition *"
      />

<<<<<<< HEAD
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
=======
      <Input
        placeholder="Describe your waste material and any specific details"
        value={form.description}
        onChangeText={(text) => setForm(prev => ({ ...prev, description: text }))}
        label="Description *"
        multiline
        numberOfLines={3}
      />

      <View style={styles.imageSection}>
        <Text style={styles.sectionTitle}>Photos</Text>
        <View style={styles.imageGrid}>
          {form.images.map((image, index) => (
            <View key={index} style={styles.imageContainer}>
              <Image source={{ uri: image.uri }} style={styles.thumbnail} />
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => removeImage(index)}
              >
                <Icon name="close" color="white" size={20} />
              </TouchableOpacity>
            </View>
          ))}
          <TouchableOpacity
            style={styles.addImageButton}
            onPress={() => setShowImagePicker(true)}
          >
            <Icon name="add-a-photo" size={30} color="#666" />
          </TouchableOpacity>
        </View>
      </View>

      {suggestions.length > 0 && (
        <View style={styles.suggestionsSection}>
          <Text style={styles.sectionTitle}>Craft Suggestions</Text>
          {suggestions.map((suggestion, index) => (
            <View key={index} style={styles.suggestionCard}>
              <Text style={styles.suggestionTitle}>{suggestion.title}</Text>
              <Text style={styles.suggestionDifficulty}>
                Difficulty: {suggestion.difficulty}
              </Text>
              <Text>Materials: {suggestion.materials.join(', ')}</Text>
            </View>
          ))}
        </View>
      )}

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

      <Modal
        visible={showImagePicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowImagePicker(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Button
              title="Take Photo"
              onPress={() => {
                setShowImagePicker(false);
                takePhoto();
              }}
              containerStyle={styles.modalButton}
              icon={{ name: 'camera', type: 'feather' }}
            />
            <Button
              title="Choose from Gallery"
              onPress={() => {
                setShowImagePicker(false);
                pickImage();
              }}
              containerStyle={styles.modalButton}
              icon={{ name: 'image', type: 'feather' }}
            />
            <Button
              title="Cancel"
              onPress={() => setShowImagePicker(false)}
              containerStyle={styles.modalButton}
              type="outline"
            />
          </View>
        </View>
      </Modal>
>>>>>>> 37acbed708e60e8f5db28d845244d5d9b80bc4a6

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
                title="Done"
                onPress={() => {
                  setShowQR(false);
                  navigation.navigate('MainTabs');
                }}
                containerStyle={styles.modalButton}
                type="outline"
              />
            </View>
          </View>
        </View>
      </Modal>
<<<<<<< HEAD

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
=======
    </ScrollView>
>>>>>>> 37acbed708e60e8f5db28d845244d5d9b80bc4a6
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
<<<<<<< HEAD
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
=======
    backgroundColor: '#fff',
>>>>>>> 37acbed708e60e8f5db28d845244d5d9b80bc4a6
  },
  title: {
    color: '#2E7D32',
    textAlign: 'center',
    marginVertical: 20,
  },
  section: {
    marginBottom: 20,
<<<<<<< HEAD
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
=======
    paddingHorizontal: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#666',
  },
  typeContainer: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  typeButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    marginRight: 10,
  },
  selectedTypeButton: {
    backgroundColor: '#2089dc',
  },
  typeText: {
    color: '#666',
  },
  selectedTypeText: {
    color: 'white',
  },
  unitContainer: {
    marginRight: 10,
  },
  imageSection: {
    marginVertical: 15,
    paddingHorizontal: 15,
  },
  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
  },
  imageContainer: {
    width: 100,
    height: 100,
    margin: 5,
    borderRadius: 8,
    overflow: 'hidden',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  removeButton: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 12,
    padding: 4,
  },
  addImageButton: {
    width: 100,
    height: 100,
    margin: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  suggestionsSection: {
    marginVertical: 15,
    paddingHorizontal: 15,
  },
  suggestionCard: {
    backgroundColor: '#f8f8f8',
    padding: 15,
    borderRadius: 8,
    marginVertical: 5,
  },
  suggestionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  suggestionDifficulty: {
    color: '#666',
    marginVertical: 5,
>>>>>>> 37acbed708e60e8f5db28d845244d5d9b80bc4a6
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
<<<<<<< HEAD
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
=======
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    width: '80%',
    alignItems: 'stretch',
  },
  modalTitle: {
    textAlign: 'center',
    marginBottom: 20,
  },
  modalButton: {
    marginVertical: 5,
  },
  buttonContainer: {
    marginHorizontal: 15,
    marginVertical: 10,
  },
  submitButton: {
    margin: 15,
    marginBottom: 30,
  },
  qrContainer: {
    alignItems: 'center',
    marginVertical: 20,
>>>>>>> 37acbed708e60e8f5db28d845244d5d9b80bc4a6
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
<<<<<<< HEAD
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
=======
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  buttonMargin: {
    marginRight: 10,
>>>>>>> 37acbed708e60e8f5db28d845244d5d9b80bc4a6
  },
});

export default AddWasteScreen;