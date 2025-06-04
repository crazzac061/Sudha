// import React, { useState, useRef } from 'react';
// import { View, StyleSheet, Image, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
// import { Text, Button, Card } from '@rneui/themed';
// import * as ImagePicker from 'expo-image-picker';
// // import * as tf from '@tensorflow/tfjs';
// // import { bundleResourceIO, decodeJpeg } from '@tensorflow/tfjs-react-native';
// import * as FileSystem from 'expo-file-system';

// interface DIYProject {
//   title: string;
//   description: string;
//   youtubeLink: string;
//   difficulty: 'Easy' | 'Medium' | 'Hard';
// }

// const WasteUpcyclingScreen = () => {
//   const [image, setImage] = useState<string | null>(null);
//   const [loading, setLoading] = useState(false);
//   const [predictions, setPredictions] = useState<DIYProject[]>([]);
//   const modelRef = useRef<tf.LayersModel | null>(null);

//   // Example DIY projects database
//   const diyProjects: Record<string, DIYProject[]> = {
//     'plastic_bottle': [
//       {
//         title: 'Decorative Flower Vase',
//         description: 'Transform plastic bottles into beautiful vases',
//         youtubeLink: 'https://youtube.com/watch?v=example1',
//         difficulty: 'Easy'
//       },
//       {
//         title: 'Vertical Garden',
//         description: 'Create a hanging garden using plastic bottles',
//         youtubeLink: 'https://youtube.com/watch?v=example2',
//         difficulty: 'Medium'
//       }
//     ],
//     // Add more waste categories and projects
//   };

//   const loadModel = async () => {
//     try {
//       await tf.ready();
//       // Replace with your Teachable Machine model files
//       const modelJSON = require('../assets/model/model.json');
//       const modelWeights = require('../assets/model/weights.bin');
//       modelRef.current = await tf.loadLayersModel(bundleResourceIO(modelJSON, modelWeights));
//     } catch (error) {
//       console.error('Error loading model:', error);
//     }
//   };

//   const pickImage = async () => {
//     const result = await ImagePicker.launchImageLibraryAsync({
//       mediaTypes: ImagePicker.MediaTypeOptions.Images,
//       allowsEditing: true,
//       aspect: [1, 1],
//       quality: 1,
//     });

//     if (!result.canceled) {
//       setImage(result.assets[0].uri);
//       analyzeImage(result.assets[0].uri);
//     }
//   };

//   const analyzeImage = async (imageUri: string) => {
//     setLoading(true);
//     try {
//       if (!modelRef.current) await loadModel();
      
//       // Process image for prediction
//       const imgB64 = await FileSystem.readAsStringAsync(imageUri, {
//         encoding: FileSystem.EncodingType.Base64,
//       });
//       const imgBuffer = tf.util.encodeString(imgB64, 'base64').buffer;
//       const raw = new Uint8Array(imgBuffer);
//       const imageTensor = decodeJpeg(raw);
      
//       // Make prediction
//       const resized = tf.image.resizeBilinear(imageTensor, [224, 224]);
//       const expanded = resized.expandDims(0);
//       const normalized = expanded.div(255.0);
//       const prediction = await modelRef.current?.predict(normalized);
      
//       // Get recommendations based on prediction
//       const wasteType = 'plastic_bottle'; // Replace with actual prediction
//       setPredictions(diyProjects[wasteType] || []);
//     } catch (error) {
//       console.error('Error analyzing image:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <ScrollView style={styles.container}>
//       <Text h4 style={styles.title}>Waste Upcycling Ideas</Text>
      
//       <Button
//         title="Upload Waste Photo"
//         onPress={pickImage}
//         icon={{ name: 'camera-alt', color: 'white' }}
//         containerStyle={styles.buttonContainer}
//       />

//       {image && (
//         <Image source={{ uri: image }} style={styles.image} />
//       )}

//       {loading ? (
//         <ActivityIndicator size="large" color="#43A047" />
//       ) : (
//         predictions.map((project, index) => (
//           <Card key={index} containerStyle={styles.cardContainer}>
//             <Card.Title>{project.title}</Card.Title>
//             <Card.Divider />
//             <Text style={styles.description}>{project.description}</Text>
//             <Text style={styles.difficulty}>Difficulty: {project.difficulty}</Text>
//             <Button
//               title="Watch Tutorial"
//               onPress={() => {/* Handle YouTube link */}}
//               type="outline"
//               containerStyle={styles.tutorialButton}
//             />
//           </Card>
//         ))
//       )}
//     </ScrollView>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#E8F5E9',
//     padding: 16,
//   },
//   title: {
//     textAlign: 'center',
//     color: '#2E7D32',
//     marginVertical: 20,
//   },
//   buttonContainer: {
//     marginVertical: 20,
//   },
//   image: {
//     width: '100%',
//     height: 300,
//     borderRadius: 10,
//     marginBottom: 20,
//   },
//   cardContainer: {
//     borderRadius: 10,
//     marginBottom: 15,
//     elevation: 3,
//   },
//   description: {
//     fontSize: 16,
//     marginBottom: 10,
//     color: '#1B5E20',
//   },
//   difficulty: {
//     fontSize: 14,
//     color: '#666',
//     marginBottom: 10,
//   },
//   tutorialButton: {
//     marginTop: 10,
//   },
// });

// export default WasteUpcyclingScreen;