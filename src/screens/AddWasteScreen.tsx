import React, { useState, useRef } from 'react';
import { 
  View, 
  StyleSheet, 
  ScrollView, 
  Modal, 
  Alert, 
  ActivityIndicator, 
  Image, 
  TouchableOpacity,
  Linking 
} from 'react-native';
import { Input, Button, Text, Card, Icon } from '@rneui/themed';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import QRCode from 'react-native-qrcode-svg';
import * as FileSystem from 'expo-file-system';
import { WasteQRData, formatWasteQRData, shareQRCode } from '../utils/wasteUtils';
import { RootStackNavigationProp } from '../types/navigation';

const MAX_LOAD_ATTEMPTS = 3;

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

interface Suggestion {
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  materials: string[];
}

const MOCK_SUGGESTIONS: Record<string, Suggestion[]> = {
  'Wood/Sawdust': [
    { 
      title: 'DIY Plant Pots', 
      difficulty: 'Easy', 
      materials: ['Sawdust', 'Paper', 'Glue'] 
    },
    { 
      title: 'Fire Starters', 
      difficulty: 'Easy', 
      materials: ['Sawdust', 'Wax'] 
    }
  ],
  'Plastic': [
    { 
      title: 'Vertical Garden', 
      difficulty: 'Medium', 
      materials: ['Plastic Bottles', 'Rope', 'Soil'] 
    },
    { 
      title: 'Storage Containers', 
      difficulty: 'Easy', 
      materials: ['Plastic Containers', 'Paint'] 
    }
  ],
  'Paper/Cardboard': [
    { 
      title: 'DIY Gift Boxes', 
      difficulty: 'Easy', 
      materials: ['Cardboard', 'Paper', 'Glue'] 
    },
    { 
      title: 'Wall Art', 
      difficulty: 'Medium', 
      materials: ['Paper', 'Paint', 'Frame'] 
    }
  ]
};

type WasteType = 'plastic_bottle' | 'glass_bottles' | 'paper_waste' | 'cardboard';

// Add DIY recommendations database
const DIY_MODEL_URL = 'https://teachablemachine.withgoogle.com/models/mH9HKRCUG/';

const diyRecommendations: Record<string, DIYProject[]> = {
  'plastic_bottles': [
    {
      title: 'Self-Watering Planter',
      description: 'Create a beautiful self-watering planter from plastic bottles',
      difficulty: 'Easy',
      youtubeLink: 'https://www.youtube.com/watch?v=h0rlrwqyuVQ',
      materials: ['2L Plastic bottle', 'Scissors', 'String/Rope', 'Potting soil', 'Plant']
    },
    {
      title: 'Bird Feeder',
      description: 'Make a simple bird feeder from plastic bottles',
      youtubeLink: 'https://www.youtube.com/watch?v=S2GJqF7QqvY',
      difficulty: 'Easy',
      materials: ['Plastic bottle', 'Wooden spoons', 'String', 'Bird seeds']
    }
  ],
  'paper_waste': [
    {
      title: 'Paper Basket',
      description: 'Weave a beautiful basket using old newspapers',
      difficulty: 'Medium',
      youtubeLink: 'https://www.youtube.com/watch?v=E8P_uI2o_O8',
      materials: ['Old newspapers', 'Glue', 'Paint', 'Scissors']
    },
    {
      title: 'Paper Beads Jewelry',
      description: 'Create colorful jewelry from magazine pages',
      difficulty: 'Easy',
      youtubeLink: 'https://www.youtube.com/watch?v=xja5e5jkzWQ',
      materials: ['Magazines/Papers', 'Glue', 'String', 'Scissors']
    }
  ],
  'cardboard': [
    {
      title: 'Desk Organizer',
      description: 'Make a stylish desk organizer from cardboard boxes',
      difficulty: 'Medium',
      youtubeLink: 'https://www.youtube.com/watch?v=6E1-EJQNoq8',
      materials: ['Cardboard boxes', 'Glue', 'Scissors', 'Decorative paper']
    },
    {
      title: 'Wall Art',
      description: 'Create amazing 3D wall art using cardboard',
      difficulty: 'Hard',
      youtubeLink: 'https://www.youtube.com/watch?v=Vxd5ZMqVYnE',
      materials: ['Cardboard', 'Paint', 'Craft knife', 'Ruler']
    }
  ],
  'glass_bottles': [
    {
      title: 'Decorative Vase',
      description: 'Transform glass bottles into beautiful vases',
      difficulty: 'Easy',
      youtubeLink: 'https://www.youtube.com/watch?v=JB6EAEH1Pe0',
      materials: ['Glass bottle', 'Paint', 'Rope', 'Decorative items']
    },
    {
      title: 'Bottle Lamp',
      description: 'Create an elegant lamp from a glass bottle',
      difficulty: 'Medium',
      youtubeLink: 'https://www.youtube.com/watch?v=sPS7_QZToQ4',
      materials: ['Glass bottle', 'LED string lights', 'Drill', 'Decorative items']
    }
  ]
};

interface WasteForm {
  type: string;
  quantity: string;
  unit: string;
  condition: string;
  description: string;
  images: ImagePicker.ImagePickerAsset[];
  location: Location.LocationObject | null;
}

interface DIYProject {
  title: string;
  description: string;
  difficulty: string;
  youtubeLink: string;
  materials: string[];
}

const AddWasteScreen = () => {
  const navigation = useNavigation<RootStackNavigationProp>();
  const qrRef = useRef<QRCode>(null);
  const modelRef = useRef<any>(null);

  const [form, setForm] = useState<WasteForm>({
    type: '',
    quantity: '',
    unit: 'kg',
    condition: '',
    description: '',
    images: [],
    location: null,
  });

  const [modelLoadAttempts, setModelLoadAttempts] = useState(0);
  const [diyLoading, setDiyLoading] = useState(false);
  const [diyResults, setDiyResults] = useState<DIYProject[]>([]);
  const [diyImage, setDiyImage] = useState<string | null>(null);
  const [showDIY, setShowDIY] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [qrData, setQrData] = useState<WasteQRData | null>(null);
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);

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

  const loadModel = async (): Promise<boolean> => {
    try {
      setDiyLoading(true);
      
      if (modelLoadAttempts >= MAX_LOAD_ATTEMPTS) {
        Alert.alert(
          'Error',
          'Unable to load AI model after multiple attempts. Please try again later.',
          [
            { 
              text: 'Try Again',
              onPress: () => {
                setModelLoadAttempts(0);
                loadModel();
              }
            },
            { text: 'Cancel' }
          ]
        );
        return false;
      }

      // Initialize TensorFlow.js
      await tf.ready();
      
      // Load model and metadata from local assets
      const modelJson = require('../../../assets/model.json');
      const modelMetadata = require('../../../assets/metadata.json');
      
      // Note: weights.bin will be automatically loaded based on the paths in model.json
      modelRef.current = {
        model: await tf.loadLayersModel(modelJson),
        metadata: modelMetadata
      };

      setDiyLoading(false);
      return true;
    } catch (error) {
      console.error('Error loading model:', error);
      
      // Increment attempt counter
      setModelLoadAttempts(prev => prev + 1);
      
      // Show retry message
      Alert.alert(
        'Loading Issue',
        `Failed to load AI model (Attempt ${modelLoadAttempts + 1}/${MAX_LOAD_ATTEMPTS}). Retrying...`,
        [{ text: 'OK' }]
      );

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, 1000));
      return loadModel();
    }
  };

  const analyzeDIYImage = async (imageUri: string) => {
    setDiyLoading(true);
    try {
      // Ensure model is loaded
      if (!modelRef.current) {
        const modelLoaded = await loadModel();
        if (!modelLoaded) {
          throw new Error('Failed to load model');
        }
      }

      // Load and process image for prediction
      const imgB64 = await FileSystem.readAsStringAsync(imageUri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      
      // Convert base64 to raw bytes
      const imgBuffer = tf.util.encodeString(imgB64, 'base64').buffer;
      const raw = new Uint8Array(imgBuffer);
      
      // Decode JPEG to tensor
      const imageTensor = tf.node.decodeJpeg(raw);
      
      // Preprocess image
      const resized = tf.image.resizeBilinear(imageTensor, [224, 224]); // Adjust size if your model expects different dimensions
      const expanded = resized.expandDims(0);
      const normalized = expanded.div(255.0);

      // Make prediction
      const predictions = await modelRef.current.model.predict(normalized);
      const probabilities = await predictions.data();
      
      // Get the class with highest probability
      const maxProbability = Math.max(...probabilities);
      const predictedIndex = probabilities.indexOf(maxProbability);
      const predictedClass = modelRef.current.metadata.labels[predictedIndex];

      // Set the predicted waste type
      setForm(prev => ({
        ...prev,
        type: predictedClass
      }));

      // Clean up tensors
      tf.dispose([imageTensor, resized, expanded, normalized, predictions]);
      
      setDiyLoading(false);
    } catch (error) {
      console.error('Error analyzing image:', error);
      Alert.alert(
        'Error',
        'Failed to analyze the image. Please try again.'
      );
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
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E8F5E9',
    padding: 16,
  },
  suggestionsSection: {
    marginVertical: 15,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
  },
  suggestionCard: {
    backgroundColor: '#f5f5f5',
    borderRadius: 6,
    padding: 10,
    marginVertical: 5,
  },
  suggestionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 5,
  },
  suggestionDifficulty: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  buttonMargin: {
    marginRight: 10,
  },
  modalButton: {
    marginVertical: 5,
    width: '100%',
  },
  title: {
    color: '#2E7D32',
    textAlign: 'center',
    marginVertical: 20,
    fontSize: 24,
  },
  section: {
    marginBottom: 20,
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
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    width: '80%',
    maxHeight: '80%',
  },
  modalTitle: {
    textAlign: 'center',
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
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
  wasteId: {
    marginTop: 10,
    color: '#666',
  },
});

export default AddWasteScreen;