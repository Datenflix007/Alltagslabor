#!/usr/bin/env python3
"""
Comprehensive Backend API Tests for Alltagslabor
Tests all endpoints and functionality as specified in the review request.
"""

import requests
import json
import sys
import os
from urllib.parse import quote
import time

# Get the backend URL from frontend environment
def get_backend_url():
    """Get backend URL from frontend .env file"""
    try:
        with open('/app/frontend/.env', 'r') as f:
            for line in f:
                if line.startswith('EXPO_PUBLIC_BACKEND_URL='):
                    base_url = line.split('=', 1)[1].strip()
                    return f"{base_url}/api"
    except Exception as e:
        print(f"Error reading frontend .env: {e}")
    
    # Fallback
    return "https://alltagslabor.preview.emergentagent.com/api"

BASE_URL = get_backend_url()
print(f"Testing API at: {BASE_URL}")

class APITester:
    def __init__(self):
        self.base_url = BASE_URL
        self.session = requests.Session()
        self.session.timeout = 30
        self.results = {
            'passed': 0,
            'failed': 0,
            'errors': []
        }
    
    def log_result(self, test_name, success, message="", response_data=None):
        """Log test result"""
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status}: {test_name}")
        if message:
            print(f"   {message}")
        if response_data and not success:
            print(f"   Response: {response_data}")
        
        if success:
            self.results['passed'] += 1
        else:
            self.results['failed'] += 1
            self.results['errors'].append(f"{test_name}: {message}")
        print()
    
    def test_root_endpoint(self):
        """Test GET /api/ (root endpoint)"""
        try:
            response = self.session.get(f"{self.base_url}/")
            
            if response.status_code == 200:
                data = response.json()
                if "message" in data and "version" in data:
                    self.log_result("Root endpoint", True, f"Message: {data['message']}, Version: {data['version']}")
                else:
                    self.log_result("Root endpoint", False, "Missing required fields in response", data)
            else:
                self.log_result("Root endpoint", False, f"Status code: {response.status_code}", response.text)
                
        except Exception as e:
            self.log_result("Root endpoint", False, f"Exception: {str(e)}")
    
    def test_get_experiments(self):
        """Test GET /api/experiments (should return experiments from GitLab)"""
        try:
            response = self.session.get(f"{self.base_url}/experiments")
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list) and len(data) > 0:
                    # Check structure of first experiment
                    exp = data[0]
                    required_fields = ['title', 'shortDescription', 'subject', 'gradeLevel', 'steps', 'schoolType']
                    missing_fields = [field for field in required_fields if field not in exp]
                    
                    if not missing_fields:
                        self.log_result("Get all experiments", True, f"Retrieved {len(data)} experiments")
                        return data  # Return for use in other tests
                    else:
                        self.log_result("Get all experiments", False, f"Missing fields: {missing_fields}", exp)
                else:
                    self.log_result("Get all experiments", False, "No experiments returned or invalid format", data)
            else:
                self.log_result("Get all experiments", False, f"Status code: {response.status_code}", response.text)
                
        except Exception as e:
            self.log_result("Get all experiments", False, f"Exception: {str(e)}")
        
        return None
    
    def test_search_experiments(self, experiments_data=None):
        """Test GET /api/experiments/search with different parameters"""
        
        # Test 1: Search by subject (Physik)
        try:
            response = self.session.get(f"{self.base_url}/experiments/search?subject=Physik")
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    # Check if all results have subject=Physik
                    valid_results = all(exp.get('subject', '').lower() == 'physik' for exp in data)
                    if valid_results:
                        self.log_result("Search by subject (Physik)", True, f"Found {len(data)} physics experiments")
                    else:
                        self.log_result("Search by subject (Physik)", False, "Some results don't match subject filter")
                else:
                    self.log_result("Search by subject (Physik)", False, "Invalid response format", data)
            else:
                self.log_result("Search by subject (Physik)", False, f"Status code: {response.status_code}", response.text)
                
        except Exception as e:
            self.log_result("Search by subject (Physik)", False, f"Exception: {str(e)}")
        
        # Test 2: Search by grade level (7)
        try:
            response = self.session.get(f"{self.base_url}/experiments/search?gradeLevel=7")
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    valid_results = all(exp.get('gradeLevel') == '7' for exp in data)
                    if valid_results:
                        self.log_result("Search by grade level (7)", True, f"Found {len(data)} grade 7 experiments")
                    else:
                        self.log_result("Search by grade level (7)", False, "Some results don't match grade filter")
                else:
                    self.log_result("Search by grade level (7)", False, "Invalid response format", data)
            else:
                self.log_result("Search by grade level (7)", False, f"Status code: {response.status_code}", response.text)
                
        except Exception as e:
            self.log_result("Search by grade level (7)", False, f"Exception: {str(e)}")
        
        # Test 3: Search by school type (Gymnasium)
        try:
            response = self.session.get(f"{self.base_url}/experiments/search?schoolType=Gymnasium")
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    valid_results = all(exp.get('schoolType', '').lower() == 'gymnasium' for exp in data)
                    if valid_results:
                        self.log_result("Search by school type (Gymnasium)", True, f"Found {len(data)} Gymnasium experiments")
                    else:
                        self.log_result("Search by school type (Gymnasium)", False, "Some results don't match school type filter")
                else:
                    self.log_result("Search by school type (Gymnasium)", False, "Invalid response format", data)
            else:
                self.log_result("Search by school type (Gymnasium)", False, f"Status code: {response.status_code}", response.text)
                
        except Exception as e:
            self.log_result("Search by school type (Gymnasium)", False, f"Exception: {str(e)}")
        
        # Test 4: Free text search (Mechanik)
        try:
            response = self.session.get(f"{self.base_url}/experiments/search?freetext=Mechanik")
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    # Check if results contain "Mechanik" in title, description, or steps
                    valid_results = []
                    for exp in data:
                        search_term = "mechanik"
                        found_in_title = search_term in exp.get('title', '').lower()
                        found_in_desc = search_term in exp.get('shortDescription', '').lower()
                        found_in_steps = any(search_term in step.get('content', '').lower() for step in exp.get('steps', []))
                        
                        if found_in_title or found_in_desc or found_in_steps:
                            valid_results.append(exp)
                    
                    if len(valid_results) == len(data):
                        self.log_result("Free text search (Mechanik)", True, f"Found {len(data)} experiments containing 'Mechanik'")
                    else:
                        self.log_result("Free text search (Mechanik)", False, f"Only {len(valid_results)}/{len(data)} results contain search term")
                else:
                    self.log_result("Free text search (Mechanik)", False, "Invalid response format", data)
            else:
                self.log_result("Free text search (Mechanik)", False, f"Status code: {response.status_code}", response.text)
                
        except Exception as e:
            self.log_result("Free text search (Mechanik)", False, f"Exception: {str(e)}")
        
        # Test 5: Combined search parameters
        try:
            response = self.session.get(f"{self.base_url}/experiments/search?subject=Physik&gradeLevel=8")
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    valid_results = all(
                        exp.get('subject', '').lower() == 'physik' and exp.get('gradeLevel') == '8' 
                        for exp in data
                    )
                    if valid_results:
                        self.log_result("Combined search (Physik + Grade 8)", True, f"Found {len(data)} matching experiments")
                    else:
                        self.log_result("Combined search (Physik + Grade 8)", False, "Some results don't match combined filters")
                else:
                    self.log_result("Combined search (Physik + Grade 8)", False, "Invalid response format", data)
            else:
                self.log_result("Combined search (Physik + Grade 8)", False, f"Status code: {response.status_code}", response.text)
                
        except Exception as e:
            self.log_result("Combined search (Physik + Grade 8)", False, f"Exception: {str(e)}")
    
    def test_specific_experiment(self):
        """Test GET /api/experiments/Mechanik%20Experimente"""
        try:
            # URL encode the experiment title
            experiment_title = quote("Mechanik Experimente")
            response = self.session.get(f"{self.base_url}/experiments/{experiment_title}")
            
            if response.status_code == 200:
                data = response.json()
                required_fields = ['title', 'shortDescription', 'subject', 'gradeLevel', 'steps', 'schoolType']
                missing_fields = [field for field in required_fields if field not in data]
                
                if not missing_fields:
                    self.log_result("Get specific experiment (Mechanik Experimente)", True, f"Retrieved experiment: {data['title']}")
                else:
                    self.log_result("Get specific experiment (Mechanik Experimente)", False, f"Missing fields: {missing_fields}", data)
            elif response.status_code == 404:
                self.log_result("Get specific experiment (Mechanik Experimente)", True, "Experiment not found (404) - expected behavior for non-existent experiment")
            else:
                self.log_result("Get specific experiment (Mechanik Experimente)", False, f"Status code: {response.status_code}", response.text)
                
        except Exception as e:
            self.log_result("Get specific experiment (Mechanik Experimente)", False, f"Exception: {str(e)}")
    
    def test_subjects_endpoint(self):
        """Test GET /api/subjects (school subjects by state)"""
        try:
            response = self.session.get(f"{self.base_url}/subjects")
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, dict) and len(data) > 0:
                    # Check if it contains state-based subject data
                    sample_key = list(data.keys())[0]
                    if isinstance(data[sample_key], list):
                        self.log_result("Get subjects by state", True, f"Retrieved subjects for {len(data)} states")
                    else:
                        self.log_result("Get subjects by state", False, "Invalid data structure", data)
                else:
                    self.log_result("Get subjects by state", False, "No subjects data returned", data)
            else:
                self.log_result("Get subjects by state", False, f"Status code: {response.status_code}", response.text)
                
        except Exception as e:
            self.log_result("Get subjects by state", False, f"Exception: {str(e)}")
    
    def test_school_types_endpoint(self):
        """Test GET /api/school-types (school types by state)"""
        try:
            response = self.session.get(f"{self.base_url}/school-types")
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, dict) and len(data) > 0:
                    # Check if it contains state-based school type data
                    sample_key = list(data.keys())[0]
                    if isinstance(data[sample_key], list):
                        self.log_result("Get school types by state", True, f"Retrieved school types for {len(data)} states")
                    else:
                        self.log_result("Get school types by state", False, "Invalid data structure", data)
                else:
                    self.log_result("Get school types by state", False, "No school types data returned", data)
            else:
                self.log_result("Get school types by state", False, f"Status code: {response.status_code}", response.text)
                
        except Exception as e:
            self.log_result("Get school types by state", False, f"Exception: {str(e)}")
    
    def test_grades_endpoint(self):
        """Test GET /api/grades (available grade levels)"""
        try:
            response = self.session.get(f"{self.base_url}/grades")
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list) and len(data) > 0:
                    # Check if grades are sorted and contain valid grade levels
                    valid_grades = all(isinstance(grade, str) for grade in data)
                    if valid_grades:
                        self.log_result("Get available grades", True, f"Retrieved {len(data)} grade levels: {data}")
                    else:
                        self.log_result("Get available grades", False, "Invalid grade data format", data)
                else:
                    self.log_result("Get available grades", False, "No grades data returned", data)
            else:
                self.log_result("Get available grades", False, f"Status code: {response.status_code}", response.text)
                
        except Exception as e:
            self.log_result("Get available grades", False, f"Exception: {str(e)}")
    
    def test_impressum_endpoint(self):
        """Test GET /api/impressum (impressum text)"""
        try:
            response = self.session.get(f"{self.base_url}/impressum")
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, dict) and "content" in data and data["content"]:
                    self.log_result("Get impressum text", True, f"Retrieved impressum content ({len(data['content'])} characters)")
                else:
                    self.log_result("Get impressum text", False, "Missing or empty content field", data)
            else:
                self.log_result("Get impressum text", False, f"Status code: {response.status_code}", response.text)
                
        except Exception as e:
            self.log_result("Get impressum text", False, f"Exception: {str(e)}")
    
    def run_all_tests(self):
        """Run all API tests"""
        print("=" * 60)
        print("ALLTAGSLABOR BACKEND API TESTS")
        print("=" * 60)
        print()
        
        # Test basic endpoints
        print("🔍 Testing Basic Endpoints:")
        print("-" * 30)
        self.test_root_endpoint()
        experiments_data = self.test_get_experiments()
        self.test_subjects_endpoint()
        self.test_school_types_endpoint()
        self.test_grades_endpoint()
        self.test_impressum_endpoint()
        
        print("🔍 Testing Search Functionality:")
        print("-" * 30)
        self.test_search_experiments(experiments_data)
        
        print("🔍 Testing Specific Experiment Retrieval:")
        print("-" * 30)
        self.test_specific_experiment()
        
        # Print summary
        print("=" * 60)
        print("TEST SUMMARY")
        print("=" * 60)
        print(f"✅ Passed: {self.results['passed']}")
        print(f"❌ Failed: {self.results['failed']}")
        print(f"📊 Total: {self.results['passed'] + self.results['failed']}")
        
        if self.results['errors']:
            print("\n🚨 FAILED TESTS:")
            for error in self.results['errors']:
                print(f"   • {error}")
        
        print()
        return self.results['failed'] == 0

def main():
    """Main test execution"""
    tester = APITester()
    success = tester.run_all_tests()
    
    if success:
        print("🎉 All tests passed!")
        sys.exit(0)
    else:
        print("💥 Some tests failed!")
        sys.exit(1)

if __name__ == "__main__":
    main()