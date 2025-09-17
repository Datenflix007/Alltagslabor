import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Image,
  Alert,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';

const { width } = Dimensions.get('window');

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
  const [selectedSubject, setSelectedSubject] = useState('Alle');
  const [selectedGrade, setSelectedGrade] = useState('Alle');
  const [selectedSchoolType, setSelectedSchoolType] = useState('Alle');
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [selectedExperiment, setSelectedExperiment] = useState<Experiment | null>(null);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [grades, setGrades] = useState<string[]>([]);
  const [schoolTypes, setSchoolTypes] = useState<string[]>([]);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);

      // Load experiments
      const experimentsResponse = await fetch(`${BACKEND_URL}/api/experiments`);
      const experimentsData = await experimentsResponse.json();
      setExperiments(experimentsData);
      setFilteredExperiments(experimentsData);

      // Load grades
      const gradesResponse = await fetch(`${BACKEND_URL}/api/grades`);
      const gradesData = await gradesResponse.json();
      setGrades(gradesData);

      // Extract unique subjects and school types from experiments
      const uniqueSubjects = [...new Set(experimentsData.map((exp: Experiment) => exp.subject))];
      const uniqueSchoolTypes = [...new Set(experimentsData.map((exp: Experiment) => exp.schoolType))];
      
      setSubjects(uniqueSubjects);
      setSchoolTypes(uniqueSchoolTypes);

    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Fehler', 'Daten konnten nicht geladen werden');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams();
      if (selectedSubject !== 'Alle') params.append('subject', selectedSubject);
      if (selectedGrade !== 'Alle') params.append('gradeLevel', selectedGrade);
      if (selectedSchoolType !== 'Alle') params.append('schoolType', selectedSchoolType);
      if (searchText.trim()) params.append('freetext', searchText.trim());

      const response = await fetch(`${BACKEND_URL}/api/experiments/search?${params.toString()}`);
      const data = await response.json();
      setFilteredExperiments(data);
    } catch (error) {
      console.error('Error searching:', error);
      Alert.alert('Fehler', 'Suche konnte nicht durchgeführt werden');
    } finally {
      setLoading(false);
    }
  };

  const clearSearch = () => {
    setSearchText('');
    setSelectedSubject('Alle');
    setSelectedGrade('Alle');
    setSelectedSchoolType('Alle');
    setFilteredExperiments(experiments);
    setShowAdvancedSearch(false);
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
      <Text style={styles.cardDescription}>{experiment.shortDescription}</Text>
      <View style={styles.cardFooter}>
        <Text style={styles.schoolType}>{experiment.schoolType}</Text>
        <Ionicons name="chevron-forward" size={20} color="#666" />
      </View>
    </TouchableOpacity>
  );

  const renderExperimentDetail = () => {
    if (!selectedExperiment) return null;

    return (
      <View style={styles.experimentDetailContainer}>
        <SafeAreaView style={styles.detailContent}>
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

            <Text style={styles.detailDescription}>{selectedExperiment.shortDescription}</Text>

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
      </View>
    );
  };

  if (selectedExperiment) {
    return renderExperimentDetail();
  }

  return (
    <SafeAreaView style={styles.container}>
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

        <View style={styles.searchButtons}>
          <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
            <Text style={styles.searchButtonText}>SUCHEN</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.advancedButton}
            onPress={() => setShowAdvancedSearch(!showAdvancedSearch)}
          >
            <Text style={styles.advancedButtonText}>Erweiterte Suche</Text>
          </TouchableOpacity>
        </View>

        {showAdvancedSearch && (
          <View style={styles.filtersContainer}>
            <View style={styles.filterGroup}>
              <Text style={styles.filterLabel}>Fach:</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={selectedSubject}
                  onValueChange={setSelectedSubject}
                  style={styles.picker}
                >
                  <Picker.Item label="Alle" value="Alle" />
                  {subjects.map((subject, index) => (
                    <Picker.Item key={index} label={subject} value={subject} />
                  ))}
                </Picker>
              </View>
            </View>

            <View style={styles.filterGroup}>
              <Text style={styles.filterLabel}>Klassenstufe:</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={selectedGrade}
                  onValueChange={setSelectedGrade}
                  style={styles.picker}
                >
                  <Picker.Item label="Alle" value="Alle" />
                  {grades.map((grade, index) => (
                    <Picker.Item key={index} label={grade} value={grade} />
                  ))}
                </Picker>
              </View>
            </View>

            <View style={styles.filterGroup}>
              <Text style={styles.filterLabel}>Schulform:</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={selectedSchoolType}
                  onValueChange={setSelectedSchoolType}
                  style={styles.picker}
                >
                  <Picker.Item label="Alle" value="Alle" />
                  {schoolTypes.map((type, index) => (
                    <Picker.Item key={index} label={type} value={type} />
                  ))}
                </Picker>
              </View>
            </View>

            <TouchableOpacity style={styles.clearButton} onPress={clearSearch}>
              <Text style={styles.clearButtonText}>Filter zurücksetzen</Text>
            </TouchableOpacity>
          </View>
        )}
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
  searchButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  searchButton: {
    backgroundColor: '#c41e3a',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 6,
  },
  searchButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  advancedButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  advancedButtonText: {
    color: '#c41e3a',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  filtersContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  filterGroup: {
    marginBottom: 12,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
    color: '#333',
  },
  pickerContainer: {
    backgroundColor: '#f8f8f8',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  picker: {
    height: 50,
  },
  clearButton: {
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginTop: 8,
  },
  clearButtonText: {
    color: '#666',
    fontSize: 14,
    textDecorationLine: 'underline',
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
  experimentDetailContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  detailContent: {
    flex: 1,
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