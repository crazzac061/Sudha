import React, { useState, useEffect, useCallback } from 'react';
import { ScrollView, StyleSheet, View, TouchableOpacity, Alert, Image, RefreshControl } from 'react-native';
import { Text, Card, Button, Avatar, Icon, Chip } from '@rneui/themed';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

interface WasteListing {
  id: string;
  type: string;
  quantity: string;
  unit: string;
  condition: string;
  description: string;
  images: string[];
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  dateCreated: string;
  status: 'active' | 'taken' | 'expired';
  qrData: any;
}

interface UserStats {
  totalListings: number;
  activeListings: number;
  totalWasteWeight: number;
}

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

  const [wasteListings, setWasteListings] = useState<WasteListing[]>([]);
  const [userStats, setUserStats] = useState<UserStats>({
    totalListings: 0,
    activeListings: 0,
    totalWasteWeight: 0,
  });
  const [refreshing, setRefreshing] = useState(false);

  // Load waste listings and stats
  const loadWasteListings = async () => {
    try {
      // Load waste listings
      const listingsData = await AsyncStorage.getItem('userWasteListings');
      const listings = listingsData ? JSON.parse(listingsData) : [];
      setWasteListings(listings);

      // Load or calculate user stats
      const statsData = await AsyncStorage.getItem('userStats');
      let stats = statsData ? JSON.parse(statsData) : { totalListings: 0, activeListings: 0, totalWasteWeight: 0 };
      
      // Calculate total weight from listings
      const totalWeight = listings.reduce((sum: number, listing: WasteListing) => {
        const weight = parseFloat(listing.quantity) || 0;
        return sum + weight;
      }, 0);

      stats = {
        totalListings: listings.length,
        activeListings: listings.filter((l: WasteListing) => l.status === 'active').length,
        totalWasteWeight: totalWeight,
      };

      setUserStats(stats);
      
      // Update user info with calculated stats
      setUserInfo(prev => ({
        ...prev,
        totalWasteListed: `${totalWeight.toFixed(1)}kg`,
      }));

    } catch (error) {
      console.error('Error loading waste listings:', error);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadWasteListings();
    setRefreshing(false);
  }, []);

  // Load data when screen is focused
  useFocusEffect(
    useCallback(() => {
      loadWasteListings();
    }, [])
  );

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant permission to access your photos');
      return;
    }

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
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant permission to use the camera');
      return;
    }

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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#4CAF50';
      case 'taken': return '#FF9800';
      case 'expired': return '#F44336';
      default: return '#666';
    }
  };

  const handleDeleteListing = async (id: string) => {
    Alert.alert(
      'Delete Listing',
      'Are you sure you want to delete this waste listing?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const updatedListings = wasteListings.filter(listing => listing.id !== id);
              await AsyncStorage.setItem('userWasteListings', JSON.stringify(updatedListings));
              setWasteListings(updatedListings);
              
              // Update stats
              const totalWeight = updatedListings.reduce((sum, listing) => {
                return sum + (parseFloat(listing.quantity) || 0);
              }, 0);
              
              const newStats = {
                totalListings: updatedListings.length,
                activeListings: updatedListings.filter(l => l.status === 'active').length,
                totalWasteWeight: totalWeight,
              };
              
              await AsyncStorage.setItem('userStats', JSON.stringify(newStats));
              setUserStats(newStats);
              setUserInfo(prev => ({
                ...prev,
                totalWasteListed: `${totalWeight.toFixed(1)}kg`,
              }));
            } catch (error) {
              console.error('Error deleting listing:', error);
              Alert.alert('Error', 'Failed to delete listing');
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
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
          <Icon name="list" color="#2196F3" />
          <Text style={styles.statText}>Active Listings: {userStats.activeListings}</Text>
        </View>
        <View style={styles.statRow}>
          <Icon name="assignment-turned-in" color="#FF9800" />
          <Text style={styles.statText}>Total Listings: {userStats.totalListings}</Text>
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

      {/* Waste Listings Section */}
      <Card containerStyle={styles.listingsCard}>
        <Card.Title>My Waste Listings ({wasteListings.length})</Card.Title>
        <Card.Divider />
        
        {wasteListings.length === 0 ? (
          <View style={styles.emptyState}>
            <Icon name="inventory-2" size={50} color="#ccc" />
            <Text style={styles.emptyText}>No waste listings yet</Text>
            <Text style={styles.emptySubtext}>Start by adding your first waste listing!</Text>
          </View>
        ) : (
          wasteListings.map((listing) => (
            <View key={listing.id} style={styles.listingItem}>
              <View style={styles.listingHeader}>
                <View style={styles.listingTitleRow}>
                  <Text style={styles.listingType}>{listing.type}</Text>
                  <Chip
                    title={listing.status.toUpperCase()}
                    size="sm"
                    buttonStyle={{ backgroundColor: getStatusColor(listing.status) }}
                    titleStyle={{ color: 'white', fontSize: 10 }}
                  />
                </View>
                <TouchableOpacity
                  onPress={() => handleDeleteListing(listing.id)}
                  style={styles.deleteButton}
                >
                  <Icon name="delete" color="#F44336" size={20} />
                </TouchableOpacity>
              </View>
              
              <View style={styles.listingDetails}>
                <View style={styles.listingRow}>
                  <Icon name="scale" size={16} color="#666" />
                  <Text style={styles.listingText}>
                    {listing.quantity} {listing.unit}
                  </Text>
                </View>
                
                <View style={styles.listingRow}>
                  <Icon name="info" size={16} color="#666" />
                  <Text style={styles.listingText}>
                    {listing.condition}
                  </Text>
                </View>
                
                <View style={styles.listingRow}>
                  <Icon name="calendar-today" size={16} color="#666" />
                  <Text style={styles.listingText}>
                    {formatDate(listing.dateCreated)}
                  </Text>
                </View>
              </View>

              {listing.description && (
                <Text style={styles.listingDescription} numberOfLines={2}>
                  {listing.description}
                </Text>
              )}

              {listing.images && listing.images.length > 0 && (
                <ScrollView horizontal style={styles.imageContainer} showsHorizontalScrollIndicator={false}>
                  {listing.images.slice(0, 3).map((imageUri, index) => (
                    <Image
                      key={index}
                      source={{ uri: imageUri }}
                      style={styles.listingImage}
                    />
                  ))}
                  {listing.images.length > 3 && (
                    <View style={styles.moreImagesOverlay}>
                      <Text style={styles.moreImagesText}>+{listing.images.length - 3}</Text>
                    </View>
                  )}
                </ScrollView>
              )}

              <View style={styles.listingFooter}>
                <Text style={styles.listingId}>ID: {listing.id.slice(-8)}</Text>
                {listing.location && (
                  <View style={styles.locationRow}>
                    <Icon name="location-on" size={14} color="#666" />
                    <Text style={styles.locationText}>Location saved</Text>
                  </View>
                )}
              </View>
            </View>
          ))
        )}
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
<<<<<<< HEAD
=======
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
  listingsCard: {
    borderRadius: 10,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 10,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 5,
  },
  listingItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingVertical: 15,
    marginBottom: 10,
  },
  listingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  listingTitleRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginRight: 10,
  },
  listingType: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  deleteButton: {
    padding: 5,
  },
  listingDetails: {
    marginBottom: 10,
  },
  listingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 2,
  },
  listingText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
  },
  listingDescription: {
    fontSize: 14,
    color: '#333',
    marginBottom: 10,
    lineHeight: 20,
  },
  imageContainer: {
    marginVertical: 10,
  },
  listingImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 8,
  },
  moreImagesOverlay: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  moreImagesText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  listingFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  listingId: {
    fontSize: 12,
    color: '#999',
    fontFamily: 'monospace',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  button: {
    margin: 20,
    borderRadius: 10,
>>>>>>> 37acbed708e60e8f5db28d845244d5d9b80bc4a6
=======
>>>>>>> 5f11177e6954e75c85f1c2e07789bf76f3e2ee01
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