import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';

interface AuthScreenProps {
  onAuth: (token: string, email: string) => void;
  apiBaseUrl: string;
}

export default function AuthScreen({ onAuth, apiBaseUrl }: AuthScreenProps) {
  const [email, setEmail] = useState('');
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  async function handleRequestOtp() {
    setLoading(true);
    setMessage('');
    try {
      // Tenta registrar (primeiro acesso)
      const registerRes = await fetch(`${apiBaseUrl}/auth/register-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (registerRes.ok) {
        // Sucesso no registro
        setMessage('Enviamos um OTP para o seu e-mail de registro.');
        setStep('otp');
      } else {
        const data = await registerRes.json();
        // Se falhou porque o usuário já existe, tenta solicitar OTP para login
        if (registerRes.status === 400 && data.detail && data.detail.includes('já existe')) {
          const loginRes = await fetch(`${apiBaseUrl}/auth/request-otp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email }),
          });

          if (loginRes.ok) {
            setMessage('Usuário já registrado. Enviamos um novo OTP para o seu e-mail.');
            setStep('otp');
          } else {
            const loginData = await loginRes.json();
            setMessage(loginData.detail || 'Erro ao solicitar OTP para login.');
          }
        } else {
          setMessage(data.detail || 'Erro ao registrar.');
        }
      }
    } catch (e) {
      setMessage('Erro de rede ao solicitar OTP.');
    }
    setLoading(false);
  }

  async function handleLoginOtp() {
    setLoading(true);
    setMessage('');
    try {
      const res = await fetch(`${apiBaseUrl}/auth/login-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });
      const data = await res.json();
      if (data.access_token) {
        onAuth(data.access_token, email);
      } else {
        setMessage(data.detail || 'OTP inválido.');
      }
    } catch (e) {
      setMessage('Erro de rede ao autenticar.');
    }
    setLoading(false);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login/Registro com OTP</Text>
      {step === 'email' && (
        <>
          <TextInput
            style={styles.input}
            placeholder="Digite seu e-mail"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <TouchableOpacity style={styles.button} onPress={handleRequestOtp} disabled={loading || !email}>
            <Text style={styles.buttonText}>Solicitar OTP</Text>
          </TouchableOpacity>
        </>
      )}
      {step === 'otp' && (
        <>
          <TextInput
            style={styles.input}
            placeholder="Digite o OTP"
            value={otp}
            onChangeText={setOtp}
            keyboardType="numeric"
          />
          <TouchableOpacity style={styles.button} onPress={handleLoginOtp} disabled={loading || !otp}>
            <Text style={styles.buttonText}>Entrar</Text>
          </TouchableOpacity>
        </>
      )}
      {loading && <ActivityIndicator style={{ marginTop: 16 }} />}
      {!!message && <Text style={styles.message}>{message}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#10451d',
    padding: 24,
  },
  title: {
    color: 'white',
    fontSize: 24,
    marginBottom: 24,
    fontWeight: 'bold',
  },
  input: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    width: 260,
    marginBottom: 16,
    fontSize: 18,
  },
  button: {
    backgroundColor: '#00c853',
    padding: 14,
    borderRadius: 8,
    marginBottom: 16,
    width: 260,
    alignItems: 'center',
  },
  buttonText: {
    color: '#10451d',
    fontWeight: 'bold',
    fontSize: 18,
  },
  message: {
    color: 'white',
    marginTop: 16,
    textAlign: 'center',
  },
}); 