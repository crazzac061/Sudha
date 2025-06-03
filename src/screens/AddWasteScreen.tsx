import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Input, Button, Text } from '@rneui/themed';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';

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

  const handleSubmit = () => {
    // TODO: Implement form submission
    console.log('Form submitted:', form);
  };

  return (
    <ScrollView style={styles.container}>
      <Text h4 style={styles.title}>List Your Waste</Text>
      
      <Input
        placeholder="Type of waste (e.g., Sawdust)"
        value={form.type}
        onChangeText={(text: string) => setForm(prev => ({ ...prev, type: text }))}
      />

      <Input
        placeholder="Quantity"
        keyboardType="numeric"
        value={form.quantity}
        onChangeText={(text) => setForm(prev => ({ ...prev, quantity: text }))}
      />

      <Input
        placeholder="Condition (e.g., Clean, dry)"
        value={form.condition}
        onChangeText={(text) => setForm(prev => ({ ...prev, condition: text }))}
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
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
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
});

export default AddWasteScreen;