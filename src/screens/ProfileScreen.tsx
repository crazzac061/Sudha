import React, { useState } from 'react';
import { ScrollView, StyleSheet, View, TouchableOpacity, Alert } from 'react-native';
import { Text, Card, Button, Avatar, Icon } from '@rneui/themed';
import * as ImagePicker from 'expo-image-picker';

const ProfileScreen = () => {
  const [userInfo, setUserInfo] = useState({
    name: 'Ram',
    company: 'Ram Furniture Factory',
    location: 'Bhaktapur',
    totalWasteListed: '250kg',
    impactScore: '85',
    badges: ['Verified Waste Recycler', 'Eco Champion'],
    profilePhoto: null as string | null,
  });

  const handlePickImage = async () => {
    // Request permission
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant permission to access your photos');
      return;
    }

    // Pick image
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled) {
      setUserInfo(prev => ({
        ...prev,
        profilePhoto: result.assets[0].uri
      }));
    }
  };

  const handleTakePhoto = async () => {
    // Request camera permission
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant permission to use the camera');
      return;
    }

    // Take photo
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled) {
      setUserInfo(prev => ({
        ...prev,
        profilePhoto: result.assets[0].uri
      }));
    }
  };

  const showImageOptions = () => {
    Alert.alert(
      'Update Profile Photo',
      'Choose an option',
      [
        {
          text: 'Take Photo',
          onPress: handleTakePhoto,
        },
        {
          text: 'Choose from Gallery',
          onPress: handlePickImage,
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={showImageOptions}>
          <Avatar
            size={120}
            rounded
            source={userInfo.profilePhoto ? { uri: userInfo.profilePhoto } : undefined}
            icon={!userInfo.profilePhoto ? { name: 'person', type: 'material' } : undefined}
            containerStyle={styles.avatar}
          >
            <Avatar.Accessory
              size={36}
              onPress={showImageOptions}
              containerStyle={styles.editButton}
            />
          </Avatar>
        </TouchableOpacity>
        <Text h4>{userInfo.name}</Text>
        <Text>{userInfo.company}</Text>
        <Text style={styles.location}>
          <Icon name="location-on" size={16} color="#666" /> {userInfo.location}
        </Text>
      </View>

      <Card containerStyle={styles.statsCard}>
        <Card.Title>Impact Statistics</Card.Title>
        <Card.Divider />
        <View style={styles.statRow}>
          <Icon name="eco" color="#4CAF50" />
          <Text style={styles.statText}>Total Waste Listed: {userInfo.totalWasteListed}</Text>
        </View>
        <View style={styles.statRow}>
          <Icon name="stars" color="#FFC107" />
          <Text style={styles.statText}>Impact Score: {userInfo.impactScore}</Text>
        </View>
      </Card>

      <Card containerStyle={styles.badgesCard}>
        <Card.Title>Badges</Card.Title>
        <Card.Divider />
        {userInfo.badges.map((badge, index) => (
          <View key={index} style={styles.badgeRow}>
            <Icon name="workspace-premium" color="#2196F3" />
            <Text style={styles.badge}>{badge}</Text>
          </View>
        ))}
      </Card>

      <Button
        title="Edit Profile"
        icon={{ name: 'edit', color: 'white' }}
        containerStyle={styles.button}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  avatar: {
    backgroundColor: '#2089dc',
    marginBottom: 15,
  },
  editButton: {
    backgroundColor: '#2089dc',
  },
  location: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
    color: '#666',
  },
  statsCard: {
    borderRadius: 10,
    marginTop: 10,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
  },
  statText: {
    marginLeft: 10,
    fontSize: 16,
  },
  badgesCard: {
    borderRadius: 10,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
  },
  badge: {
    marginLeft: 10,
    fontSize: 16,
    fontWeight: '500',
  },
  button: {
    margin: 20,
    borderRadius: 10,
  },
});

export default ProfileScreen;
