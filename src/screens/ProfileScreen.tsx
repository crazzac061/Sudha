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
    backgroundColor: '#E8F5E9',
  },
  header: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    marginBottom: 10,
  },
  avatar: {
    backgroundColor: '#43A047',
    marginBottom: 10,
  },
  welcomeText: {
    color: '#2E7D32',
    marginBottom: 5,
  },
  subText: {
    color: '#666',
    fontSize: 16,
  },
  cardContainer: {
    borderRadius: 15,
    marginHorizontal: 10,
    marginVertical: 8,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardTitle: {
    color: '#2E7D32',
    fontSize: 18,
    fontWeight: 'bold',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#43A047',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  buttonContainer: {
    marginTop: 15,
    borderRadius: 8,
  },
  button: {
    backgroundColor: '#43A047',
    paddingVertical: 12,
    borderRadius: 8,
  },
  divider: {
    backgroundColor: '#81C784',
    height: 1.5,
  },
  listItem: {
    paddingVertical: 8,
    fontSize: 16,
    color: '#1B5E20',
  },
  badge: {
    paddingVertical: 5,
    fontSize: 16,
    color: '#43A047',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginVertical: 5,
  },
  statText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#333'
  },
  editButton: {
    backgroundColor: '#43A047'
  },
  location: {
    color: '#666',
    fontSize: 16,
    marginTop: 5
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5
  },
  badgesCard: {
    borderRadius: 15,
    marginHorizontal: 10,
    marginVertical: 8
  },
  statsCard: {
    borderRadius: 15,
    marginHorizontal: 10,
    marginVertical: 8
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5
  }
});
export default ProfileScreen;
