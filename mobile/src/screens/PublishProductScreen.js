import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert, Image, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useQuery, useMutation } from '@tanstack/react-query';
import { ProductAPI, SubscriptionAPI } from '../services/api';
import { colors, spacing, radius, typography } from '../theme/colors';

export default function PublishProductScreen({ navigation }) {
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [price, setPrice] = useState('');
  const [city, setCity] = useState('Dakar');
  const [categoryId, setCategoryId] = useState(null);
  const [images, setImages] = useState([]);

  const subQuery = useQuery({ queryKey: ['mySub'], queryFn: SubscriptionAPI.me });
  const catsQuery = useQuery({ queryKey: ['categories'], queryFn: ProductAPI.categories });
  const isActive = subQuery.data?.isActive;

  const create = useMutation({
    mutationFn: ProductAPI.create,
    onSuccess: () => {
      Alert.alert('✅ Publié', 'Ton annonce est en attente de validation.');
      setTitle(''); setDesc(''); setPrice(''); setImages([]); setCategoryId(null);
      navigation.navigate('Home');
    },
    onError: (e) => {
      const code = e.response?.data?.error?.code;
      if (code === 'SUBSCRIPTION_REQUIRED') {
        navigation.navigate('Subscription');
      } else {
        Alert.alert('Erreur', e.response?.data?.error?.message || 'Échec');
      }
    },
  });

  const pickImage = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.7,
      selectionLimit: 6 - images.length,
    });
    if (!res.canceled) {
      // TODO: upload to Cloudinary; ici on garde URI local
      setImages([...images, ...res.assets.map((a) => ({ url: a.uri }))]);
    }
  };

  const submit = () => {
    if (!title || !desc || !price || !categoryId) {
      return Alert.alert('Champs manquants', 'Remplis tous les champs obligatoires');
    }
    create.mutate({
      title,
      description: desc,
      price: Number(price),
      city,
      categoryId,
      images,
    });
  };

  if (!isActive) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.lockedBox}>
          <Ionicons name="lock-closed" size={48} color={colors.primary} />
          <Text style={styles.lockedTitle}>Abonnement vendeur requis</Text>
          <Text style={styles.lockedSubtitle}>
            Publie des annonces en t'abonnant pour 1 000 FCFA / mois.
          </Text>
          <TouchableOpacity
            style={styles.ctaPrimary}
            onPress={() => navigation.navigate('Subscription')}
          >
            <Text style={styles.ctaPrimaryText}>Devenir vendeur</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={{ padding: spacing.lg }}>
        <Text style={styles.title}>Publier un produit</Text>

        <Text style={styles.label}>Photos (max 6)</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: spacing.sm }}>
          {images.map((img, i) => (
            <Image key={i} source={{ uri: img.url }} style={styles.thumb} />
          ))}
          {images.length < 6 && (
            <TouchableOpacity style={styles.addPhoto} onPress={pickImage}>
              <Ionicons name="add" size={32} color={colors.textMuted} />
            </TouchableOpacity>
          )}
        </ScrollView>

        <Text style={styles.label}>Titre *</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: Samsung Galaxy A54"
          value={title}
          onChangeText={setTitle}
        />

        <Text style={styles.label}>Catégorie *</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: spacing.sm }}>
          {catsQuery.data?.items?.map((c) => (
            <TouchableOpacity
              key={c.id}
              onPress={() => setCategoryId(c.id)}
              style={[styles.chip, categoryId === c.id && styles.chipActive]}
            >
              <Text style={[styles.chipText, categoryId === c.id && styles.chipTextActive]}>
                {c.icon} {c.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={styles.label}>Prix (FCFA) *</Text>
        <TextInput
          style={styles.input}
          placeholder="85000"
          keyboardType="number-pad"
          value={price}
          onChangeText={setPrice}
        />

        <Text style={styles.label}>Ville *</Text>
        <TextInput style={styles.input} value={city} onChangeText={setCity} />

        <Text style={styles.label}>Description *</Text>
        <TextInput
          style={[styles.input, styles.textarea]}
          placeholder="Décris ton produit…"
          multiline
          numberOfLines={5}
          value={desc}
          onChangeText={setDesc}
        />

        <TouchableOpacity style={styles.ctaPrimary} onPress={submit} disabled={create.isPending}>
          {create.isPending ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.ctaPrimaryText}>Publier</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  title: { ...typography.h2, marginBottom: spacing.lg },
  label: { ...typography.body, fontWeight: '600', marginTop: spacing.lg, marginBottom: spacing.sm },
  input: {
    backgroundColor: colors.surface, borderRadius: radius.md,
    borderWidth: 1, borderColor: colors.border,
    padding: spacing.md, fontSize: 15,
  },
  textarea: { minHeight: 100, textAlignVertical: 'top' },
  thumb: { width: 80, height: 80, borderRadius: radius.md, marginRight: spacing.xs },
  addPhoto: {
    width: 80, height: 80, borderRadius: radius.md,
    borderWidth: 2, borderColor: colors.border, borderStyle: 'dashed',
    alignItems: 'center', justifyContent: 'center',
  },
  chip: {
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    borderWidth: 1, borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontSize: 13 },
  chipTextActive: { color: 'white', fontWeight: '600' },
  ctaPrimary: {
    backgroundColor: colors.primary, borderRadius: radius.md,
    padding: spacing.lg, alignItems: 'center', marginTop: spacing.xxl,
  },
  ctaPrimaryText: { color: 'white', fontWeight: '700', fontSize: 16 },
  lockedBox: {
    flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl,
  },
  lockedTitle: { ...typography.h2, marginTop: spacing.lg, textAlign: 'center' },
  lockedSubtitle: { ...typography.body, color: colors.textMuted, textAlign: 'center', marginVertical: spacing.md },
});
