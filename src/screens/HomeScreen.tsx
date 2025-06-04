import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, Card, Button, FAB } from '@rneui/themed';
import { useNavigation } from '@react-navigation/native';
import { TabNavigationProp } from '../types/navigation';
import WasteFeedCard, { WasteFeedPost } from '../components/WasteFeedCard';

const MOCK_POSTS: WasteFeedPost[] = [
  {
    id: '1',
    userName: 'Ram Furniture',
    wasteType: 'Sawdust and Wood Scraps',
    description: 'Daily sawdust and wood scraps from furniture making. Perfect for craft projects or composting!',
    imageUrl: 'https://picsum.photos/400/300',
    likes: 15,
    comments: 3,
    craftSuggestions: [
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
    timestamp: new Date().toISOString()
  },
  {
    id: '2',
    userName: 'Green Garden Nepal',
    wasteType: 'Plastic Bottles',
    description: 'Clean plastic bottles available for recycling or upcycling projects. Great for vertical gardens!',
    imageUrl: 'https://picsum.photos/400/301',
    likes: 23,
    comments: 7,
    craftSuggestions: [
      {
        title: 'Vertical Garden',
        difficulty: 'Medium',
        materials: ['Plastic Bottles', 'Rope', 'Soil']
      }
    ],
    timestamp: new Date(Date.now() - 86400000).toISOString()
  }
];

const HomeScreen = () => {
  const navigation = useNavigation<TabNavigationProp>();
  const [posts, setPosts] = useState<WasteFeedPost[]>(MOCK_POSTS);

  const handleLike = (postId: string) => {
    setPosts(prevPosts => 
      prevPosts.map(post => 
        post.id === postId 
          ? { ...post, likes: post.likes + 1 }
          : post
      )
    );
  };

  const handleComment = (postId: string) => {
    // TODO: Implement comment functionality
    Alert.alert('Coming Soon', 'Comments feature will be available in the next update!');
  };

  const handleViewSuggestions = (postId: string) => {
    const post = posts.find(p => p.id === postId);
    if (post) {
      Alert.alert(
        'Craft Suggestions',
        post.craftSuggestions.map(suggestion => 
          `${suggestion.title} (${suggestion.difficulty})\nMaterials: ${suggestion.materials.join(', ')}`
        ).join('\n\n'),
        [{ text: 'OK' }]
      );
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {posts.map(post => (
          <WasteFeedCard
            key={post.id}
            post={post}
            onLike={handleLike}
            onComment={handleComment}
            onViewSuggestions={handleViewSuggestions}
          />
        ))}
      </ScrollView>

      <FAB
        placement="right"
        icon={{ name: 'add', color: 'white' }}
        color="#2089dc"
        style={styles.fab}
        onPress={() => navigation.navigate('AddWaste')}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E8F5E9', // Light green background
    padding: 10,
  },
  cardContainer: {
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    marginBottom: 15,
  },
  cardTitle: {
    color: '#2E7D32', // Dark green text
    fontSize: 20,
    fontWeight: 'bold',
  },
  cardText: {
    color: '#1B5E20', // Darker green text
    fontSize: 16,
    marginVertical: 5,
  },
<<<<<<< HEAD
  buttonContainer: {
    marginTop: 15,
    borderRadius: 8,
  },
  button: {
    backgroundColor: '#43A047', // Green button
    paddingVertical: 12,
    borderRadius: 8,
  },
  divider: {
    backgroundColor: '#81C784', // Light green divider
    height: 1.5,
=======
  scrollContent: {
    padding: 10,
  },
  fab: {
    margin: 16,
    right: 0,
    bottom: 0,
>>>>>>> 37acbed708e60e8f5db28d845244d5d9b80bc4a6
  },
});


export default HomeScreen;