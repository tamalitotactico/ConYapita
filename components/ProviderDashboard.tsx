import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, TextInput } from 'react-native';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Store, Menu, Package, DollarSign } from 'lucide-react-native';

interface ProviderData {
  id: string;
  business_name: string;
  description: string;
  is_active: boolean;
}

export default function ProviderDashboard() {
  const { user } = useAuth();
  const [provider, setProvider] = useState<ProviderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [businessName, setBusinessName] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadProvider();
  }, []);

  const loadProvider = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('providers')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setProvider(data);
        setBusinessName(data.business_name);
        setDescription(data.description || '');
      }
    } catch (error) {
      console.error('Error loading provider:', error);
    } finally {
      setLoading(false);
    }
  };

  const createOrUpdateProvider = async () => {
    if (!user || !businessName) return;

    setSaving(true);

    try {
      if (provider) {
        const { error } = await supabase
          .from('providers')
          .update({
            business_name: businessName,
            description: description,
          })
          .eq('id', provider.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('providers')
          .insert({
            user_id: user.id,
            business_name: businessName,
            description: description,
          });

        if (error) throw error;
      }

      await loadProvider();
      setEditMode(false);
    } catch (error) {
      console.error('Error saving provider:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0066CC" />
      </View>
    );
  }

  if (!provider && !editMode) {
    return (
      <View style={styles.setupContainer}>
        <Store size={64} color="#0066CC" />
        <Text style={styles.setupTitle}>Configura tu Negocio</Text>
        <Text style={styles.setupText}>
          Completa la información de tu negocio para empezar a recibir suscriptores
        </Text>
        <TouchableOpacity style={styles.button} onPress={() => setEditMode(true)}>
          <Text style={styles.buttonText}>Comenzar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (editMode || !provider) {
    return (
      <ScrollView style={styles.container}>
        <View style={styles.form}>
          <Text style={styles.formTitle}>
            {provider ? 'Editar Negocio' : 'Crear Negocio'}
          </Text>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Nombre del negocio</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej: Restaurant La Cocina"
              value={businessName}
              onChangeText={setBusinessName}
              editable={!saving}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Descripción</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Describe tu negocio y lo que ofreces..."
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              editable={!saving}
            />
          </View>

          <View style={styles.buttonRow}>
            {provider && (
              <TouchableOpacity
                style={[styles.button, styles.buttonSecondary, styles.flex1]}
                onPress={() => {
                  setEditMode(false);
                  setBusinessName(provider.business_name);
                  setDescription(provider.description || '');
                }}
                disabled={saving}
              >
                <Text style={styles.buttonSecondaryText}>Cancelar</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[styles.button, styles.flex1, saving && styles.buttonDisabled]}
              onPress={createOrUpdateProvider}
              disabled={saving || !businessName}
            >
              {saving ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Guardar</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.businessName}>{provider.business_name}</Text>
          <Text style={styles.businessDescription}>{provider.description}</Text>
        </View>
        <TouchableOpacity onPress={() => setEditMode(true)}>
          <Text style={styles.editLink}>Editar</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Menu size={24} color="#0066CC" />
          <Text style={styles.statNumber}>0</Text>
          <Text style={styles.statLabel}>Platos en menú</Text>
        </View>
        <View style={styles.statCard}>
          <Package size={24} color="#34C759" />
          <Text style={styles.statNumber}>0</Text>
          <Text style={styles.statLabel}>Suscriptores</Text>
        </View>
        <View style={styles.statCard}>
          <DollarSign size={24} color="#FFB800" />
          <Text style={styles.statNumber}>$0</Text>
          <Text style={styles.statLabel}>Ingresos</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Acciones Rápidas</Text>
        <TouchableOpacity style={styles.actionCard}>
          <Menu size={20} color="#0066CC" />
          <Text style={styles.actionText}>Gestionar Menú</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionCard}>
          <Package size={20} color="#0066CC" />
          <Text style={styles.actionText}>Ver Pedidos</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
  },
  setupContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#F2F2F7',
  },
  setupTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginTop: 24,
    marginBottom: 8,
  },
  setupText: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    marginBottom: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 24,
    backgroundColor: '#fff',
    marginBottom: 16,
  },
  headerLeft: {
    flex: 1,
  },
  businessName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
  },
  businessDescription: {
    fontSize: 14,
    color: '#8E8E93',
  },
  editLink: {
    fontSize: 16,
    color: '#0066CC',
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 4,
    textAlign: 'center',
  },
  section: {
    padding: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 16,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  actionText: {
    fontSize: 16,
    color: '#000',
    fontWeight: '500',
  },
  form: {
    padding: 24,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 24,
  },
  inputContainer: {
    marginBottom: 20,
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
  textArea: {
    height: 100,
    paddingTop: 12,
    textAlignVertical: 'top',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  flex1: {
    flex: 1,
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
