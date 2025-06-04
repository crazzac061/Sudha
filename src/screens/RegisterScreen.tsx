import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Input, Button, Text } from '@rneui/themed';
import { useNavigation } from '@react-navigation/native';
import { authService } from '../services/auth';
import { colors } from '../theme/colors';

const ROLES = [
  { label: 'Waste Producer', value: 'producer' },
  { label: 'Waste Collector', value: 'collector' },
  { label: 'Recycler', value: 'recycler' },
] as const;

export const RegisterScreen = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    company: '',
    location: '',
    role: 'producer' as const,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigation = useNavigation();

  const validateForm = () => {
    if (!formData.name.trim()) {
      Alert.alert('Error', 'Please enter your name');
      return false;
    }
    if (!formData.email.trim()) {
      Alert.alert('Error', 'Please enter your email');
      return false;
    }
    if (!formData.password || formData.password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return false;
    }
    return true;
  };

  const handleRegister = async () => {
    setError(null);
    if (!validateForm()) return;

    setLoading(true);
    try {
      await authService.register(formData);
      Alert.alert(
        'Success',
        'Registration successful! Please login.',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('Login' as never)
          }
        ]
      );
    } catch (error: any) {
      setError(error.message);
      Alert.alert(
        'Registration Failed',
        error.message || 'Please try again'
      );
    } finally {
      setLoading(false);
    }
  };

  const updateFormData = (key: keyof typeof formData) => (value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.form}>
        <Text h3 style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Join the circular economy</Text>

        <Input
          placeholder="Full Name *"
          value={formData.name}
          onChangeText={updateFormData('name')}
          leftIcon={{ name: 'person', color: colors.primary }}
        />

        <Input
          placeholder="Email *"
          value={formData.email}
          onChangeText={updateFormData('email')}
          autoCapitalize="none"
          keyboardType="email-address"
          leftIcon={{ name: 'email', color: colors.primary }}
        />

        <Input
          placeholder="Password *"
          value={formData.password}
          onChangeText={updateFormData('password')}
          secureTextEntry
          leftIcon={{ name: 'lock', color: colors.primary }}
        />

        <Input
          placeholder="Company Name"
          value={formData.company}
          onChangeText={updateFormData('company')}
          leftIcon={{ name: 'business', color: colors.primary }}
        />

        <Input
          placeholder="Location"
          value={formData.location}
          onChangeText={updateFormData('location')}
          leftIcon={{ name: 'location-on', color: colors.primary }}
        />

        <View style={styles.roleContainer}>
          <Text style={styles.roleLabel}>Select your role:</Text>
          <View style={styles.roleButtons}>
            {ROLES.map(({ label, value }) => (
              <Button
                key={value}
                title={label}
                type={formData.role === value ? 'solid' : 'outline'}
                onPress={() => updateFormData('role')(value)}
                containerStyle={styles.roleButton}
                buttonStyle={
                  formData.role === value
                    ? styles.roleButtonActive
                    : styles.roleButtonInactive
                }
              />
            ))}
          </View>
        </View>

        <Button
          title="Create Account"
          onPress={handleRegister}
          loading={loading}
          containerStyle={styles.buttonContainer}
        />

        <Button
          title="Already have an account? Sign In"
          type="clear"
          onPress={() => navigation.navigate('Login')}
          titleStyle={styles.signInButton}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: colors.background,
  },
  form: {
    padding: 20,
  },
  title: {
    textAlign: 'center',
    color: colors.text,
    marginBottom: 10,
  },
  subtitle: {
    textAlign: 'center',
    color: colors.gray.medium,
    marginBottom: 30,
  },
  roleContainer: {
    marginBottom: 20,
  },
  roleLabel: {
    fontSize: 16,
    color: colors.text,
    marginBottom: 10,
  },
  roleButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  roleButton: {
    flex: 1,
    marginHorizontal: 5,
  },
  roleButtonActive: {
    backgroundColor: colors.primary,
  },
  roleButtonInactive: {
    borderColor: colors.primary,
  },
  buttonContainer: {
    marginVertical: 10,
    borderRadius: 8,
  },
  signInButton: {
    color: colors.primary,
  },
});

export default RegisterScreen;
