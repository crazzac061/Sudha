import React, { useState, useRef } from 'react';
import { View, StyleSheet, ScrollView, Modal, Alert, ActivityIndicator, Image, TouchableOpacity } from 'react-native';
import { Input, Button, Text, Overlay, Icon } from '@rneui/themed';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import QRCode from 'react-native-qrcode-svg';
import * as FileSystem from 'expo-file-system';
import { WasteQRData, formatWasteQRData, shareQRCode } from '../utils/wasteUtils';
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
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  title: {
    textAlign: 'center',
    marginVertical: 20,
  },
  section: {
    marginBottom: 20,
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
  },
  wasteId: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  buttonMargin: {
    marginRight: 10,
  },
});

export default AddWasteScreen;