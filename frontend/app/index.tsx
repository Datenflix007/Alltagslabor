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
import { Picker } from '@react-native-picker/picker';
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

const sanitizeHtml = (value?: string) => (value ? value.replace(/<[^>]*>/g, '') : '');

export default function AlltagsLaborApp() {
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [filteredExperiments, setFilteredExperiments] = useState<Experiment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [selectedExperiment, setSelectedExperiment] = useState<Experiment | null>(null);

  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [selectedSchoolType, setSelectedSchoolType] = useState('Alle');
  const [selectedSubject, setSelectedSubject] = useState('Alle');
  const [selectedGrade, setSelectedGrade] = useState('Alle');
  const [schoolOptions, setSchoolOptions] = useState<string[]>(['Alle']);
  const [subjectOptions, setSubjectOptions] = useState<string[]>(['Alle']);
  const [gradeOptions, setGradeOptions] = useState<string[]>(['Alle']);

  useEffect(() => {
    loadExperiments();
  }, []);

  useEffect(() => {
    if (!experiments.length) {
      setSchoolOptions(['Alle']);
      setSubjectOptions(['Alle']);
      setGradeOptions(['Alle']);
      return;
    }

    const unique = (values: string[]) => (
      Array.from(new Set(values.filter(Boolean))).sort((a, b) =>
        a.localeCompare(b, 'de', { numeric: true, sensitivity: 'base' })
      )
    );

    setSchoolOptions(['Alle', ...unique(experiments.map((exp) => exp.schoolType || ''))]);
    setSubjectOptions(['Alle', ...unique(experiments.map((exp) => exp.subject || ''))]);
    setGradeOptions(['Alle', ...unique(experiments.map((exp) => exp.gradeLevel || ''))]);
  }, [experiments]);

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

  const filterData = (
    searchValue: string,
    schoolTypeFilter: string,
    subjectFilter: string,
    gradeFilter: string
  ) => {
    const normalized = searchValue.trim().toLowerCase();

    const filtered = experiments.filter((experiment) => {
      const sanitizedTitle = experiment.title.toLowerCase();
      const sanitizedShort = sanitizeHtml(experiment.shortDescription).toLowerCase();
      const sanitizedSubject = (experiment.subject || '').toLowerCase();

      const matchesSearch =
        normalized.length === 0 ||
        sanitizedTitle.includes(normalized) ||
        sanitizedShort.includes(normalized) ||
        sanitizedSubject.includes(normalized);

      const matchesSchool =
        schoolTypeFilter === 'Alle' || experiment.schoolType === schoolTypeFilter;
      const matchesSubjectOption =
        subjectFilter === 'Alle' || experiment.subject === subjectFilter;
      const matchesGrade =
        gradeFilter === 'Alle' || experiment.gradeLevel === gradeFilter;

      return matchesSearch && matchesSchool && matchesSubjectOption && matchesGrade;
    });

    setFilteredExperiments(filtered);
    setLoading(false);
  };

  const handleSearchInputChange = (value: string) => {
    setSearchText(value);
    if (value.trim() === '') {
      setLoading(true);
      filterData('', selectedSchoolType, selectedSubject, selectedGrade);
    }
  };

  const handleSearch = () => {
    setLoading(true);
    filterData(searchText, selectedSchoolType, selectedSubject, selectedGrade);
  };

  const handleApplyFilters = () => {
    setFilterModalVisible(false);
    setLoading(true);
    filterData(searchText, selectedSchoolType, selectedSubject, selectedGrade);
  };

  const handleResetFilters = () => {
    setSelectedSchoolType('Alle');
    setSelectedSubject('Alle');
    setSelectedGrade('Alle');
    setLoading(true);
    filterData(searchText, 'Alle', 'Alle', 'Alle');
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
      <Text style={styles.cardDescription}>
        {sanitizeHtml(experiment.shortDescription)}
      </Text>
      <View style={styles.cardFooter}>
        <Text style={styles.schoolType}>{experiment.schoolType}</Text>
        <Ionicons name='chevron-forward' size={20} color='#666' />
      </View>
    </TouchableOpacity>
  );

  const renderExperimentDetail = () => {
    if (!selectedExperiment) return null;

    return (
      <Modal visible animationType='slide'>
        <SafeAreaView style={styles.detailContainer}>
          <View style={styles.detailHeader}>
            <TouchableOpacity onPress={closeExperiment} style={styles.backButton}>
              <Ionicons name='arrow-back' size={22} color='#fff' />
              <Text style={styles.backButtonLabel}>Zurück</Text>
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
              {sanitizeHtml(selectedExperiment.shortDescription)}
            </Text>

            {selectedExperiment.steps.map((step, index) => (
              <View key={index} style={styles.stepContainer}>
                {step.type === 'aufgabe' && (
                  <View style={[styles.stepBox, styles.aufgabeBox]}>
                    <Text style={styles.stepTitle}>Aufgabe:</Text>
                    <Text style={styles.stepContent}>{sanitizeHtml(step.content)}</Text>
                  </View>
                )}
                {step.type === 'merksatz' && (
                  <View style={[styles.stepBox, styles.merksatzBox]}>
                    <Text style={styles.stepTitle}>Merksatz:</Text>
                    <Text style={styles.stepContent}>{sanitizeHtml(step.content)}</Text>
                  </View>
                )}
                {step.type === 'text' && (
                  <View style={styles.stepBox}>
                    <Text style={styles.stepContent}>{sanitizeHtml(step.content)}</Text>
                  </View>
                )}
              </View>
            ))}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    );
  };

  const renderFilterModal = () => (
    <Modal animationType='slide' transparent visible={filterModalVisible}>
      <View style={styles.filterModalContainer}>
        <TouchableOpacity
          style={styles.filterBackdrop}
          activeOpacity={1}
          onPress={() => setFilterModalVisible(false)}
        />
        <View style={styles.filterPanel}>
          <View style={styles.filterHeader}>
            <Text style={styles.filterHeaderTitle}>Erweiterte Suche</Text>
            <TouchableOpacity
              onPress={() => setFilterModalVisible(false)}
              style={styles.filterCloseButton}
            >
              <Ionicons name='close' size={20} color='#fff' />
            </TouchableOpacity>
          </View>

          <View style={styles.filterBody}>
            <View style={styles.filterGroup}>
              <Text style={styles.filterLabel}>Schulform</Text>
              <View style={styles.pickerWrapper}>
                <Picker
                  selectedValue={selectedSchoolType}
                  onValueChange={(value) => setSelectedSchoolType(String(value))}
                  style={styles.picker}
                >
                  {schoolOptions.map((option) => (
                    <Picker.Item label={option || 'Alle'} value={option || 'Alle'} key={`school-${option}`} />
                  ))}
                </Picker>
              </View>
            </View>

            <View style={styles.filterGroup}>
              <Text style={styles.filterLabel}>Fach</Text>
              <View style={styles.pickerWrapper}>
                <Picker
                  selectedValue={selectedSubject}
                  onValueChange={(value) => setSelectedSubject(String(value))}
                  style={styles.picker}
                >
                  {subjectOptions.map((option) => (
                    <Picker.Item label={option || 'Alle'} value={option || 'Alle'} key={`subject-${option}`} />
                  ))}
                </Picker>
              </View>
            </View>

            <View style={styles.filterGroup}>
              <Text style={styles.filterLabel}>Klassenstufe</Text>
              <View style={styles.pickerWrapper}>
                <Picker
                  selectedValue={selectedGrade}
                  onValueChange={(value) => setSelectedGrade(String(value))}
                  style={styles.picker}
                >
                  {gradeOptions.map((option) => (
                    <Picker.Item label={option || 'Alle'} value={option || 'Alle'} key={`grade-${option}`} />
                  ))}
                </Picker>
              </View>
            </View>
          </View>

          <View style={styles.filterFooter}>
            <TouchableOpacity style={styles.filterResetButton} onPress={handleResetFilters}>
              <Text style={styles.filterResetText}>Zurücksetzen</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.filterApplyButton} onPress={handleApplyFilters}>
              <Text style={styles.filterApplyText}>Anwenden</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  const resultLabel = `${filteredExperiments.length} Experimente gefunden`;

  return (
    <SafeAreaView style={styles.container}>
      {renderExperimentDetail()}
      {renderFilterModal()}

      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <View style={styles.logoCircle}>
            <Ionicons name='flask' size={32} color='#fff' />
          </View>
          <Text style={styles.headerTitle}>AlltagsLabor</Text>
        </View>
        <TouchableOpacity
          style={styles.headerHamburger}
          onPress={() => setFilterModalVisible(true)}
        >
          <Ionicons name='menu' size={26} color='#fff' />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Ionicons name='search' size={20} color='#666' style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder='Suchbegriff eingeben'
            value={searchText}
            onChangeText={handleSearchInputChange}
            onSubmitEditing={handleSearch}
            returnKeyType='search'
          />
        </View>

        <View style={styles.searchActions}>
          <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
            <Text style={styles.searchButtonText}>SUCHEN</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.advancedSearchButton}
            onPress={() => setFilterModalVisible(true)}
          >
            <Ionicons name='filter' size={20} color='#c41e3a' style={styles.advancedSearchIcon} />
            <Text style={styles.advancedSearchText}>Erweiterte Suche</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.content}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size='large' color='#c41e3a' />
            <Text style={styles.loadingText}>Experimente werden geladen...</Text>
          </View>
        ) : (
          <ScrollView style={styles.experimentsList}>
            <Text style={styles.resultCount}>{resultLabel}</Text>
            {filteredExperiments.length === 0 && (
              <Text style={styles.noResults}>
                Keine Experimente gefunden. Bitte Filter anpassen.
              </Text>
            )}
            {filteredExperiments.map(renderExperimentCard)}

            <View style={styles.impressumContainer}>
              <Text style={styles.impressumTitle}>AlltagsLabor</Text>
              <Text style={styles.impressumText}>
                Diese App ist ein Prototyp für das AlltagsLabor und dient der Präsentation von Experimentideen.
                Anpassungen und Erweiterungen sind jederzeit möglich.
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
    backgroundColor: '#f2f2f2',
  },
  header: {
    backgroundColor: '#c41e3a',
    paddingVertical: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
  headerHamburger: {
    padding: 4,
  },
  searchContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 20,
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
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 48,
    fontSize: 16,
  },
  searchActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
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
  advancedSearchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 16,
    backgroundColor: '#f8f8f8',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 6,
  },
  advancedSearchIcon: {
    marginRight: 8,
  },
  advancedSearchText: {
    color: '#c41e3a',
    fontWeight: '600',
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
  noResults: {
    textAlign: 'center',
    color: '#c41e3a',
    marginBottom: 24,
    fontSize: 14,
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#c41e3a',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  backButtonLabel: {
    color: '#fff',
    marginLeft: 4,
    fontSize: 16,
    fontWeight: '600',
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
  filterModalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  filterBackdrop: {
    flex: 1,
  },
  filterPanel: {
    width: '80%',
    maxWidth: 360,
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
    overflow: 'hidden',
  },
  filterHeader: {
    backgroundColor: '#0d6efd',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  filterHeaderTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  filterCloseButton: {
    padding: 4,
  },
  filterBody: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  filterGroup: {
    marginBottom: 18,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    overflow: 'hidden',
  },
  picker: {
    height: 48,
  },
  filterFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  filterResetButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  filterResetText: {
    color: '#666',
    fontWeight: '600',
  },
  filterApplyButton: {
    backgroundColor: '#0d6efd',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  filterApplyText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
});
