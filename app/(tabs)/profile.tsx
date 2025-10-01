import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'expo-router';
import { LogOut, User as UserIcon, Phone, MapPin, Tag } from 'lucide-react-native';

const DIETARY_OPTIONS = [
  'Vegano',
  'Vegetariano',
  'Sin gluten',
  'Keto',
  'Paleo',
  'Halal',
  'Kosher',
  'Sin lactosa',
];

export default function Profile() {
  const { profile, signOut, updateProfile } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editing, setEditing] = useState(false);

  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [address, setAddress] = useState(profile?.address || '');
  const [city, setCity] = useState(profile?.city || '');
  const [postalCode, setPostalCode] = useState(profile?.postal_code || '');
  const [selectedDiets, setSelectedDiets] = useState<string[]>(profile?.dietary_preferences || []);

  const toggleDiet = (diet: string) => {
    setSelectedDiets(prev =>
      prev.includes(diet)
        ? prev.filter(d => d !== diet)
        : [...prev, diet]
    );
  };

  const handleSave = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    const { error } = await updateProfile({
      full_name: fullName,
      phone,
      address,
      city,
      postal_code: postalCode,
      dietary_preferences: selectedDiets,
    });

    setLoading(false);

    if (error) {
      setError('Error al actualizar perfil');
    } else {
      setSuccess('Perfil actualizado correctamente');
      setEditing(false);
      setTimeout(() => setSuccess(''), 3000);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.replace('/(auth)/login');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>Mi Perfil</Text>
          <TouchableOpacity onPress={handleSignOut} style={styles.logoutButton}>
            <LogOut size={20} color="#FF3B30" />
          </TouchableOpacity>
        </View>

        {error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {success ? (
          <View style={styles.successContainer}>
            <Text style={styles.successText}>{success}</Text>
          </View>
        ) : null}

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <UserIcon size={20} color="#0066CC" />
            <Text style={styles.sectionTitle}>Información Personal</Text>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Nombre completo</Text>
            <TextInput
              style={[styles.input, !editing && styles.inputDisabled]}
              placeholder="Tu nombre"
              value={fullName}
              onChangeText={setFullName}
              editable={editing && !loading}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Teléfono</Text>
            <TextInput
              style={[styles.input, !editing && styles.inputDisabled]}
              placeholder="Número de teléfono"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              editable={editing && !loading}
            />
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MapPin size={20} color="#0066CC" />
            <Text style={styles.sectionTitle}>Dirección de Entrega</Text>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Dirección</Text>
            <TextInput
              style={[styles.input, !editing && styles.inputDisabled]}
              placeholder="Calle y número"
              value={address}
              onChangeText={setAddress}
              editable={editing && !loading}
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.inputContainer, styles.flex1]}>
              <Text style={styles.label}>Ciudad</Text>
              <TextInput
                style={[styles.input, !editing && styles.inputDisabled]}
                placeholder="Ciudad"
                value={city}
                onChangeText={setCity}
                editable={editing && !loading}
              />
            </View>

            <View style={[styles.inputContainer, styles.flex1]}>
              <Text style={styles.label}>Código Postal</Text>
              <TextInput
                style={[styles.input, !editing && styles.inputDisabled]}
                placeholder="CP"
                value={postalCode}
                onChangeText={setPostalCode}
                keyboardType="numeric"
                editable={editing && !loading}
              />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Tag size={20} color="#0066CC" />
            <Text style={styles.sectionTitle}>Preferencias Dietéticas</Text>
          </View>

          <View style={styles.tagsContainer}>
            {DIETARY_OPTIONS.map(diet => (
              <TouchableOpacity
                key={diet}
                style={[
                  styles.tag,
                  selectedDiets.includes(diet) && styles.tagActive,
                  !editing && styles.tagDisabled,
                ]}
                onPress={() => editing && toggleDiet(diet)}
                disabled={!editing || loading}
              >
                <Text
                  style={[
                    styles.tagText,
                    selectedDiets.includes(diet) && styles.tagTextActive,
                  ]}
                >
                  {diet}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              Tipo de cuenta: {profile?.user_type === 'provider' ? 'Proveedor' : 'Cliente'}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          {editing ? (
            <View style={styles.row}>
              <TouchableOpacity
                style={[styles.button, styles.buttonSecondary, styles.flex1]}
                onPress={() => setEditing(false)}
                disabled={loading}
              >
                <Text style={styles.buttonSecondaryText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.flex1, loading && styles.buttonDisabled]}
                onPress={handleSave}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Guardar</Text>
                )}
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity style={styles.button} onPress={() => setEditing(true)}>
              <Text style={styles.buttonText}>Editar Perfil</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
  },
  logoutButton: {
    padding: 8,
  },
  errorContainer: {
    backgroundColor: '#FEE',
    padding: 12,
    marginHorizontal: 24,
    marginTop: 16,
    borderRadius: 8,
  },
  errorText: {
    color: '#C00',
    fontSize: 14,
  },
  successContainer: {
    backgroundColor: '#E8F5E9',
    padding: 12,
    marginHorizontal: 24,
    marginTop: 16,
    borderRadius: 8,
  },
  successText: {
    color: '#2E7D32',
    fontSize: 14,
  },
  section: {
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  inputDisabled: {
    backgroundColor: '#F2F2F7',
    color: '#8E8E93',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  flex1: {
    flex: 1,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  tagActive: {
    backgroundColor: '#0066CC',
    borderColor: '#0066CC',
  },
  tagDisabled: {
    opacity: 0.6,
  },
  tagText: {
    fontSize: 14,
    color: '#8E8E93',
  },
  tagTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  badge: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  badgeText: {
    fontSize: 14,
    color: '#0066CC',
    fontWeight: '600',
  },
  button: {
    height: 48,
    backgroundColor: '#0066CC',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonSecondary: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonSecondaryText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '600',
  },
});
