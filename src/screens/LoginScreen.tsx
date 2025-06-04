import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Input, Button, Text } from '@rneui/themed';
import { useNavigation } from '@react-navigation/native';
import { authService } from '../services/auth';
import { colors } from '../theme/colors';

export const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    setLoading(true);
    try {
      await authService.login({ email, password });
      // Navigation will be handled by the auth state change
    } catch (error) {
      Alert.alert('Login Failed', 'Please check your credentials and try again');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.form}>
        <Text h3 style={styles.title}>Welcome Back</Text>
        <Text style={styles.subtitle}>Sign in to your account</Text>

        <Input
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          leftIcon={{ name: 'email', color: colors.primary }}
        />

        <Input
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          leftIcon={{ name: 'lock', color: colors.primary }}
        />

        <Button
          title="Sign In"
          onPress={handleLogin}
          loading={loading}
          containerStyle={styles.buttonContainer}
        />

        <Button
          title="Create Account"
          type="outline"
          onPress={() => navigation.navigate('Register')}
          containerStyle={styles.buttonContainer}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
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
    color: colors.secondary || colors.text,
    marginBottom: 30,
  },
  buttonContainer: {
    marginVertical: 10,
    borderRadius: 8,
  },
});

export default LoginScreen;
