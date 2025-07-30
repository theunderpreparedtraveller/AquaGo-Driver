import { useState } from 'react';
import { StyleSheet, View, TextInput, Text, TouchableOpacity } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { useFonts, Montserrat_400Regular, Montserrat_500Medium, Montserrat_600SemiBold } from '@expo-google-fonts/montserrat';
import { supabase } from '../../lib/supabase';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const [fontsLoaded] = useFonts({
    'Montserrat-Regular': Montserrat_400Regular,
    'Montserrat-Medium': Montserrat_500Medium,
    'Montserrat-SemiBold': Montserrat_600SemiBold,
  });

  if (!fontsLoaded) {
    return null;
  }

  const handleLogin = async () => {
    setError('');
    setLoading(true);

    try {
      if (!email || !password) {
        setError('Please fill in all fields');
        return;
      }

      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError || !data?.user) {
        setError(signInError?.message || 'Login failed');
        return;
      }

      const userId = data.user.id;

      // ✅ Check if user is a registered driver
      const { data: driver, error: driverError } = await supabase
        .from('driver_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (driverError || !driver) {
        console.error('[Auth Check Failed]: Not a registered driver', driverError);
        setError('You are a driver to login');
        await supabase.auth.signOut();
        return;
      }

      console.log('[Login Success]:', { userId, email: data.user.email });
      router.replace('/(tabs)/home');

    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.formContainer}>
      <Text style={styles.title_name}>AquaGo Delivery</Text>
        <Text style={styles.title}>Log in</Text>
        
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        
        <TextInput
          style={styles.input}
          placeholder="jane@example.com"
          placeholderTextColor="#666"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          editable={!loading}
        />
        
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#666"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          editable={!loading}
        />

        <TouchableOpacity 
          style={[styles.loginButton, loading && styles.loginButtonDisabled]} 
          onPress={handleLogin}
          disabled={loading}
        >
          <Text style={styles.loginButtonText}>
            {loading ? 'LOGGING IN...' : 'LOG IN'}
          </Text>
        </TouchableOpacity>

        <View style={styles.signupContainer}>
          <Text style={styles.signupText}>Don't have an account? </Text>
          <Link href="/signup" asChild>
            <TouchableOpacity>
              <Text style={styles.signupLink}>Sign Up</Text>
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
    fontSize: 20,
    color: 'black',
    marginBottom: 30,
  },
  title_name: {
    fontFamily: 'Montserrat-Regular',
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
  loginButton: {
    backgroundColor: '#FFA500',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  loginButtonText: {
    color: '#000000',
    fontSize: 16,
    fontFamily: 'Montserrat-SemiBold',
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  signupText: {
    color: '#666',
    fontFamily: 'Montserrat-Regular',
  },
  signupLink: {
    color: '#FFA500',
    fontFamily: 'Montserrat-SemiBold',
  },
});