import { useState } from 'react';
import { StyleSheet, View, TextInput, Text, TouchableOpacity } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { useFonts, Montserrat_400Regular, Montserrat_500Medium, Montserrat_600SemiBold } from '@expo-google-fonts/montserrat';
import { supabase } from '../../lib/supabase';

export default function SignUp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const [fontsLoaded] = useFonts({
    'Montserrat-Regular': Montserrat_400Regular,
    'Montserrat-Medium': Montserrat_500Medium,
    'Montserrat-SemiBold': Montserrat_600SemiBold,
  });

  if (!fontsLoaded) {
    return null;
  }

  const handleSignUp = async () => {
    try {
      setError(''); // Clear any existing errors
  
      if (!email || !password || !name) {
        setError('Please fill in all fields');
        return;
      }
  
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        setError('Please enter a valid email address');
        return;
      }
  
      if (password.length < 6) {
        setError('Password must be at least 6 characters long');
        return;
      }
  
      console.log('[Signup Process]: Starting signup for:', email);
  
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: email,
        password: password,
      });
  
      if (signUpError) {
        console.error('[Signup Error]:', signUpError.message);
        setError(signUpError.message);
        return;
      }
  
      // If email confirmation is required
      if (!signUpData.user) {
        console.log('[Signup]: Confirmation email sent. Awaiting user verification.');
        setError('Check your inbox to confirm your email before logging in.');
        return;
      }
  
      // Insert into driver_profiles only after confirmation
      const { error: profileError } = await supabase
        .from('driver_profiles')
        .insert([
          {
            id: signUpData.user.id,
            email,
            name,
          },
        ]);
  
      if (profileError) {
        console.error('[Profile Creation Error]:', profileError.message);
        setError('Account created but profile setup failed. Please contact support.');
        return;
      }
  
      console.log('[Signup Success]: User and profile created');
      router.replace('/(tabs)');
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'An unexpected error occurred';
      console.error('[Signup Error]:', errorMsg);
      setError(errorMsg);
    }
  };
  

  return (
    <View style={styles.container}>
      <View style={styles.formContainer}>
        <Text style={styles.title}>Create Account</Text>
        
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        
        <TextInput
          style={styles.input}
          placeholder="Full Name"
          placeholderTextColor="#666"
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
        />

        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#666"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#666"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity style={styles.signupButton} onPress={handleSignUp}>
          <Text style={styles.signupButtonText}>SIGN UP</Text>
        </TouchableOpacity>

        <View style={styles.loginContainer}>
          <Text style={styles.loginText}>Already have an account? </Text>
          <Link href="/login" asChild>
            <TouchableOpacity>
              <Text style={styles.loginLink}>Log In</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 20,
    justifyContent: 'center',
  },
  formContainer: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  title: {
    fontFamily: 'Montserrat-SemiBold',
    fontSize: 30,
    color: 'black',
    marginBottom: 30,
  },
  errorText: {
    color: '#FF3B30',
    fontFamily: 'Montserrat-Regular',
    marginBottom: 15,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#f2f2f5',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    color: 'black',
    fontFamily: 'Montserrat-Regular',
  },
  signupButton: {
    backgroundColor: '#FFA500',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  signupButtonText: {
    color: '#000000',
    fontSize: 16,
    fontFamily: 'Montserrat-SemiBold',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  loginText: {
    color: '#666',
    fontFamily: 'Montserrat-Regular',
  },
  loginLink: {
    color: '#FFA500',
    fontFamily: 'Montserrat-SemiBold',
  },
});