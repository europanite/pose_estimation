import React, { useMemo, useState } from 'react';
import { ActivityIndicator, Image, LayoutChangeEvent, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import PoseOverlay from './src/PoseOverlay';
import PoseScene from './src/PoseScene';
import type { PoseResponse } from './src/types';

const API_URL = process.env.EXPO_PUBLIC_POSE_API_URL ?? 'http://localhost:8000';

export default function App() {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [pose, setPose] = useState<PoseResponse | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageLayout, setImageLayout] = useState<{ width: number; height: number } | null>(null);

  const firstPerson = useMemo(() => pose?.people?.[0] ?? null, [pose]);

  async function pickAndEstimateImage() {
    if (busy) return;

    setError(null);
    setPose(null);
    setImageLayout(null);

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
      allowsEditing: false,
    });

    if (result.canceled || !result.assets[0]?.uri) return;

    const selectedUri = result.assets[0].uri;
    setImageUri(selectedUri);

    await estimatePose(selectedUri);
  }

  async function estimatePose(uri: string) {
    setBusy(true);
    setError(null);
    setPose(null);

    try {
      const form = new FormData();

      if (Platform.OS === 'web') {
        const blob = await fetch(uri).then((r) => r.blob());
        form.append('file', blob, 'input.png');
      } else {
        form.append('file', {
          uri,
          name: 'input.jpg',
          type: 'image/jpeg',
        } as unknown as Blob);
      }

      const response = await fetch(`${API_URL}/api/v1/pose`, {
        method: 'POST',
        body: form,
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.detail ?? 'pose request failed');

      setPose(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.page}>
      <Text style={styles.title}>Pose Estimation</Text>
      <Text style={styles.subtitle}>Estimate a pose from an image and check it with a 2D overlay and a simple 3D skeleton.</Text>

      <View style={styles.row}>
        <Pressable
          style={[styles.button, busy && styles.disabled]}
          onPress={pickAndEstimateImage}
          disabled={busy}
        >
          <Text style={styles.buttonText}>
            {busy ? 'Estimating pose...' : 'Select image'}
          </Text>
        </Pressable>
      </View>

      {busy && <ActivityIndicator />}
      {error && <Text style={styles.error}>{error}</Text>}
      {pose && <Text style={styles.meta}>backend: {pose.backend} / people: {pose.people.length}</Text>}

      <View style={styles.card}>
        <Text style={styles.cardTitle}>2D check</Text>
        {imageUri ? (
          <View
            style={styles.imageWrap}
            onLayout={(event: LayoutChangeEvent) => {
              const { width, height } = event.nativeEvent.layout;
              setImageLayout({ width, height });
            }}
          >
            <Image source={{ uri: imageUri }} style={styles.image} resizeMode="contain" />
            {pose && <PoseOverlay pose={pose} layout={imageLayout} />}
          </View>
        ) : (
          <Text style={styles.placeholder}>No image selected</Text>
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>3D skeleton check</Text>
        <PoseScene person={firstPerson} bones={pose?.bones ?? []} />
        <Text style={styles.note}>This view is currently for checking the pose direction. To transfer the pose to GLB/VRM bones properly, add a bone mapping table for the neck, shoulders, elbows, hips, knees, and other joints.</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { padding: 24, gap: 16, backgroundColor: '#f7f7f7', minHeight: '100%' as unknown as number },
  title: { fontSize: 28, fontWeight: '700' },
  subtitle: { fontSize: 15, color: '#555' },
  row: { flexDirection: 'row', gap: 12, flexWrap: 'wrap' },
  button: { paddingVertical: 12, paddingHorizontal: 18, backgroundColor: '#222', borderRadius: 10 },
  disabled: { opacity: 0.4 },
  buttonText: { color: '#fff', fontWeight: '700' },
  error: { color: '#b00020' },
  meta: { color: '#333' },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, gap: 12, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 12 },
  cardTitle: { fontSize: 18, fontWeight: '700' },
  imageWrap: { width: '100%', height: 520, backgroundColor: '#111', position: 'relative', overflow: 'hidden', borderRadius: 12 },
  image: { width: '100%', height: '100%', zIndex: 1 },
  placeholder: { color: '#888' },
  note: { color: '#666', lineHeight: 20 },
});
