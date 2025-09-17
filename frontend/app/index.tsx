import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ExperimentStep {
  type: string;
  content: string;
  description?: string;
}

interface Experiment {
  title: string;
  shortDescription: string;
  subject: string;
  gradeLevel: string;
  steps: ExperimentStep[];
  schoolType: string;
}

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

export default function AlltagsLaborApp() {
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [filteredExperiments, setFilteredExperiments] = useState<Experiment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [selectedExperiment, setSelectedExperiment] = useState<Experiment | null>(null);

  useEffect(() => {
    loadExperiments();
  }, []);

  const loadExperiments = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${BACKEND_URL}/api/experiments`);
      const data = await response.json();
      setExperiments(data);
      setFilteredExperiments(data);
    } catch (error) {
      console.error('Error loading experiments:', error);
      Alert.alert('Fehler', 'Experimente konnten nicht geladen werden');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchText.trim()) {
      setFilteredExperiments(experiments);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${BACKEND_URL}/api/experiments/search?freetext=${encodeURIComponent(searchText)}`);
      const data = await response.json();
      setFilteredExperiments(data);
    } catch (error) {
      console.error('Error searching:', error);
      Alert.alert('Fehler', 'Suche konnte nicht durchgeführt werden');
    } finally {
      setLoading(false);
    }
  };

  const openExperiment = (experiment: Experiment) => {
    setSelectedExperiment(experiment);
  };

  const closeExperiment = () => {
    setSelectedExperiment(null);
  };

  const renderExperimentCard = (experiment: Experiment, index: number) => (
    <TouchableOpacity
      key={index}
      style={styles.experimentCard}
      onPress={() => openExperiment(experiment)}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{experiment.title}</Text>
        <View style={styles.cardMeta}>
          <Text style={styles.cardSubject}>{experiment.subject}</Text>
          <Text style={styles.cardGrade}>Klasse {experiment.gradeLevel}</Text>
        </View>
      </View>
      <Text style={styles.cardDescription}>{experiment.shortDescription.replace(/<[^>]*>/g, '')}</Text>
      <View style={styles.cardFooter}>
        <Text style={styles.schoolType}>{experiment.schoolType}</Text>
        <Ionicons name="chevron-forward" size={20} color="#666" />
      </View>
    </TouchableOpacity>
  );

  const renderExperimentDetail = () => {
    if (!selectedExperiment) return null;

    return (
      <Modal visible={true} animationType="slide">
        <SafeAreaView style={styles.detailContainer}>
          <View style={styles.detailHeader}>
            <TouchableOpacity onPress={closeExperiment} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="#c41e3a" />
            </TouchableOpacity>
            <Text style={styles.detailTitle}>{selectedExperiment.title}</Text>
          </View>

          <ScrollView style={styles.detailScroll}>
            <View style={styles.detailMeta}>
              <Text style={styles.detailSubject}>{selectedExperiment.subject}</Text>
              <Text style={styles.detailGrade}>Klassenstufe: {selectedExperiment.gradeLevel}</Text>
              <Text style={styles.detailSchoolType}>{selectedExperiment.schoolType}</Text>
            </View>

            <Text style={styles.detailDescription}>
              {selectedExperiment.shortDescription.replace(/<[^>]*>/g, '')}
            </Text>

            {selectedExperiment.steps.map((step, index) => (
              <View key={index} style={styles.stepContainer}>
                {step.type === 'aufgabe' && (
                  <View style={[styles.stepBox, styles.aufgabeBox]}>
                    <Text style={styles.stepTitle}>Aufgabe:</Text>
                    <Text style={styles.stepContent}>{step.content.replace(/<[^>]*>/g, '')}</Text>
                  </View>
                )}
                {step.type === 'merksatz' && (
                  <View style={[styles.stepBox, styles.merksatzBox]}>
                    <Text style={styles.stepTitle}>Merksatz:</Text>
                    <Text style={styles.stepContent}>{step.content.replace(/<[^>]*>/g, '')}</Text>
                  </View>
                )}
                {step.type === 'text' && (
                  <View style={styles.stepBox}>
                    <Text style={styles.stepContent}>{step.content.replace(/<[^>]*>/g, '')}</Text>
                  </View>
                )}
              </View>
            ))}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {renderExperimentDetail()}
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.logoContainer}>
            <View style={styles.logoCircle}>
              <Ionicons name="flask" size={32} color="#fff" />
            </View>
            <Text style={styles.headerTitle}>AlltagsLabor</Text>
          </View>
        </View>
      </View>

      {/* Search Section */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Suchbegriff eingeben"
            value={searchText}
            onChangeText={setSearchText}
            onSubmitEditing={handleSearch}
          />
        </View>

        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <Text style={styles.searchButtonText}>SUCHEN</Text>
        </TouchableOpacity>
      </View>

      {/* Experiments List */}
      <View style={styles.content}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#c41e3a" />
            <Text style={styles.loadingText}>Experimente werden geladen...</Text>
          </View>
        ) : (
          <ScrollView style={styles.experimentsList}>
            <Text style={styles.resultCount}>
              {filteredExperiments.length} Experiment{filteredExperiments.length !== 1 ? 'e' : ''} gefunden
            </Text>
            
            {filteredExperiments.map((experiment, index) => 
              renderExperimentCard(experiment, index)
            )}

            {/* Impressum at bottom */}
            <View style={styles.impressumContainer}>
              <Text style={styles.impressumTitle}>Impressum</Text>
              <Text style={styles.impressumText}>
                Friedrich-Schiller-Universität Jena{'\n'}
                Institut für Erziehungswissenschaft{'\n'}
                L4a - Digitales Lehren und Lernen an der Werkstattschule Jena{'\n'}
                Dozentin: Dr. phil. Stefanie Czempiel{'\n'}
                Studenten: Claudius Gladewitz, Patrick Köhler, Felix Staacke
              </Text>
            </View>
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#c41e3a',
    paddingVertical: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerContent: {
    alignItems: 'center',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  searchContainer: {
    backgroundColor: '#fff',
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 48,
    fontSize: 16,
  },
  searchButton: {
    backgroundColor: '#c41e3a',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 6,
    alignSelf: 'center',
  },
  searchButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  experimentsList: {
    flex: 1,
    padding: 16,
  },
  resultCount: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    textAlign: 'center',
  },
  experimentCard: {
    backgroundColor: '#fff',
    marginBottom: 12,
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cardHeader: {
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  cardMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardSubject: {
    fontSize: 14,
    color: '#c41e3a',
    fontWeight: '600',
  },
  cardGrade: {
    fontSize: 14,
    color: '#666',
  },
  cardDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  schoolType: {
    fontSize: 12,
    color: '#999',
  },
  detailContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#c41e3a',
  },
  backButton: {
    marginRight: 16,
  },
  detailTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  detailScroll: {
    flex: 1,
    padding: 16,
  },
  detailMeta: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
  },
  detailSubject: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#c41e3a',
    marginBottom: 4,
  },
  detailGrade: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  detailSchoolType: {
    fontSize: 14,
    color: '#666',
  },
  detailDescription: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
    marginBottom: 20,
  },
  stepContainer: {
    marginBottom: 16,
  },
  stepBox: {
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#f8f8f8',
  },
  aufgabeBox: {
    backgroundColor: '#e3f2fd',
    borderLeftWidth: 4,
    borderLeftColor: '#2196f3',
  },
  merksatzBox: {
    backgroundColor: '#fff3e0',
    borderLeftWidth: 4,
    borderLeftColor: '#ff9800',
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  stepContent: {
    fontSize: 14,
    lineHeight: 20,
    color: '#333',
  },
  impressumContainer: {
    marginTop: 32,
    padding: 16,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    marginBottom: 32,
  },
  impressumTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  impressumText: {
    fontSize: 12,
    color: '#666',
    lineHeight: 16,
  },
});