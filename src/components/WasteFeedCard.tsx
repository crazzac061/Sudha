import React from 'react';
import { View, StyleSheet, Image, Dimensions } from 'react-native';
import { Card, Text, Icon, Button } from '@rneui/themed';

export interface WasteFeedPost {
  id: string;
  userName: string;
  wasteType: string;
  description: string;
  imageUrl: string;
  likes: number;
  comments: number;
  craftSuggestions: {
    title: string;
    difficulty: 'Easy' | 'Medium' | 'Hard';
    materials: string[];
  }[];
  timestamp: string;
}

interface WasteFeedCardProps {
  post: WasteFeedPost;
  onLike: (id: string) => void;
  onComment: (id: string) => void;
  onViewSuggestions: (id: string) => void;
}

const WasteFeedCard: React.FC<WasteFeedCardProps> = ({
  post,
  onLike,
  onComment,
  onViewSuggestions,
}) => {
  return (
    <Card containerStyle={styles.card}>
      <View style={styles.header}>
        <Icon name="account-circle" size={24} color="#666" />
        <Text style={styles.userName}>{post.userName}</Text>
        <Text style={styles.timestamp}>
          {new Date(post.timestamp).toLocaleDateString()}
        </Text>
      </View>

      <Card.Divider />

      <Text style={styles.title}>{post.wasteType}</Text>
      <Text style={styles.description}>{post.description}</Text>

      <Image
        source={{ uri: post.imageUrl }}
        style={styles.image}
        resizeMode="cover"
      />

      <View style={styles.stats}>
        <View style={styles.statItem}>
          <Icon name="thumb-up-off-alt" size={20} color="#666" />
          <Text style={styles.statText}>{post.likes}</Text>
        </View>
        <View style={styles.statItem}>
          <Icon name="comment" size={20} color="#666" />
          <Text style={styles.statText}>{post.comments}</Text>
        </View>
        <View style={styles.statItem}>
          <Icon name="lightbulb" size={20} color="#666" />
          <Text style={styles.statText}>{post.craftSuggestions.length}</Text>
        </View>
      </View>

      <Card.Divider />

      <View style={styles.actions}>
        <Button
          type="clear"
          icon={<Icon name="thumb-up-off-alt" size={20} color="#2089dc" />}
          title="Like"
          titleStyle={styles.actionButtonText}
          onPress={() => onLike(post.id)}
        />
        <Button
          type="clear"
          icon={<Icon name="comment" size={20} color="#2089dc" />}
          title="Comment"
          titleStyle={styles.actionButtonText}
          onPress={() => onComment(post.id)}
        />
        <Button
          type="clear"
          icon={<Icon name="lightbulb" size={20} color="#2089dc" />}
          title="Suggestions"
          titleStyle={styles.actionButtonText}
          onPress={() => onViewSuggestions(post.id)}
        />
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 10,
    marginBottom: 10,
    padding: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  userName: {
    marginLeft: 8,
    fontWeight: 'bold',
    flex: 1,
  },
  timestamp: {
    color: '#666',
    fontSize: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    marginBottom: 12,
    color: '#444',
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 12,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 8,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    marginLeft: 4,
    color: '#666',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 8,
  },
  actionButtonText: {
    fontSize: 14,
    marginLeft: 4,
  },
});

export default WasteFeedCard;
