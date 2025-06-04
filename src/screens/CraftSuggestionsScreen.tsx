import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Text, Card, Button, Icon } from '@rneui/themed';
import { RouteProp, useRoute } from '@react-navigation/native';
import { RootStackParamList } from '../types/navigation';
import { colors } from '../theme/colors';

type CraftSuggestionsRouteProp = RouteProp<RootStackParamList, 'CraftSuggestions'>;

interface CraftProject {
  id: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  materials: string[];
  steps: string[];
  imageUrl: string;
  estimatedTime: string;
}

const MOCK_PROJECTS: Record<string, CraftProject[]> = {
  'Wood/Sawdust': [
    {
      id: '1',
      title: 'DIY Plant Pots',
      difficulty: 'Easy',
      materials: ['Sawdust', 'Paper pulp', 'Eco-friendly glue', 'Water'],
      steps: [
        'Mix sawdust with paper pulp',
        'Add water and eco-friendly glue',
        'Mold into desired pot shape',
        'Let dry for 24 hours'
      ],
      imageUrl: 'https://picsum.photos/400/300',
      estimatedTime: '2-3 hours'
    },
    {
      id: '2',
      title: 'Natural Fire Starters',
      difficulty: 'Easy',
      materials: ['Sawdust', 'Wax', 'Paper cups'],
      steps: [
        'Melt wax in a double boiler',
        'Mix with sawdust',
        'Pour into paper cups',
        'Let cool and harden'
      ],
      imageUrl: 'https://picsum.photos/400/301',
      estimatedTime: '1 hour'
    }
  ],
  'Plastic': [
    {
      id: '3',
      title: 'Vertical Garden',
      difficulty: 'Medium',
      materials: ['Plastic bottles', 'Rope', 'Soil', 'Seeds', 'Scissors'],
      steps: [
        'Clean bottles thoroughly',
        'Cut openings for plants',
        'Make drainage holes',
        'String together with rope',
        'Add soil and seeds'
      ],
      imageUrl: 'https://picsum.photos/400/302',
      estimatedTime: '3-4 hours'
    }
  ]
};

const CraftSuggestionsScreen = () => {
  const route = useRoute<RouteProp<RootStackParamList, 'CraftSuggestions'>>();
  const wasteType = route.params?.wasteType ?? '';
  const projects = MOCK_PROJECTS[wasteType] || [];

  const renderDifficultyStars = (difficulty: string) => {
    const stars = difficulty === 'Easy' ? 1 : difficulty === 'Medium' ? 2 : 3;
    return Array(stars).fill('⭐').join('');
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Icon name="eco" size={50} color={colors.gray.medium} />
      <Text style={styles.emptyStateText}>
        No craft ideas available for {wasteType} yet.
      </Text>
      <Text style={styles.emptyStateText}>
        Check back later for more eco-friendly craft ideas!
      </Text>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <Text h4 style={styles.title}>Craft Ideas for {wasteType}</Text>
      
      {projects.length === 0 ? renderEmptyState() : projects.map((project) => (
        <Card 
          key={project.id} 
          containerStyle={styles.card}
        >
          <View
            accessible
            accessibilityRole="header"
            accessibilityLabel={`Craft project: ${project.title}. Difficulty: ${project.difficulty}. Time needed: ${project.estimatedTime}`}
          >
            <Image 
              source={{ uri: project.imageUrl }} 
              style={styles.image}
              accessibilityLabel={`Image of ${project.title} craft project`}
            />
            
            <Text style={styles.projectTitle}>{project.title}</Text>
            <Text style={styles.difficultyText}>
              Difficulty: {renderDifficultyStars(project.difficulty)}
            </Text>
            <Text style={styles.timeText}>
              Time needed: {project.estimatedTime}
            </Text>
          </View>
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Materials Needed:</Text>
            {project.materials.map((material, index) => (
              <View 
                key={index} 
                style={styles.bulletPoint}
                accessible
                accessibilityRole="text"
              >
                <Icon name="fiber-manual-record" size={8} color={colors.gray.medium} />
                <Text style={styles.bulletText}>{material}</Text>
              </View>
            ))}
          </View>
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Steps:</Text>
            {project.steps.map((step, index) => (
              <View 
                key={index} 
                style={styles.step}
                accessible
                accessibilityRole="text"
              >
                <Text style={styles.stepNumber}>{index + 1}.</Text>
                <Text style={styles.stepText}>{step}</Text>
              </View>
            ))}
          </View>

          <Button
            title="Save Project"
            type="outline"
            containerStyle={styles.buttonContainer}
            buttonStyle={{ borderColor: colors.primary }}
            titleStyle={{ color: colors.primary }}
            icon={<Icon name="bookmark-border" color={colors.primary} />}
            accessibilityLabel="Save this craft project"
          />
        </Card>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  title: {
    textAlign: 'center',
    marginVertical: 20,
    color: colors.text,
  },
  card: {
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    backgroundColor: colors.white,
    elevation: 2,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 15,
  },
  projectTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    color: colors.text,
  },
  difficultyText: {
    fontSize: 16,
    marginBottom: 4,
    color: colors.text,
  },
  timeText: {
    fontSize: 14,
    color: colors.gray.medium,
    marginBottom: 15,
  },
  section: {
    marginVertical: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: colors.text,
  },
  bulletPoint: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    paddingLeft: 8,
  },
  bulletText: {
    marginLeft: 8,
    fontSize: 14,
    color: colors.text,
  },
  step: {
    flexDirection: 'row',
    marginBottom: 8,
    paddingLeft: 8,
  },
  stepNumber: {
    fontWeight: 'bold',
    marginRight: 8,
    fontSize: 14,
    color: colors.primary,
  },
  stepText: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
  },
  buttonContainer: {
    marginTop: 15,
  },
  emptyState: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: colors.gray.medium,
    textAlign: 'center',
    marginVertical: 10,
  },
});

export default CraftSuggestionsScreen;
