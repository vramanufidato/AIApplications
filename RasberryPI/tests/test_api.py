import unittest
import io
import sys
import os

# Add parent directory to path to import app
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app import app


class TestDashboardAPI(unittest.TestCase):
    def setUp(self):
        app.config['TESTING'] = True
        self.client = app.test_client()

    def test_index(self):
        """Test dashboard index page"""
        response = self.client.get('/')
        self.assertEqual(response.status_code, 200)
        self.assertIn(b'Autonomous Car Dashboard', response.data)

    def test_status(self):
        """Test status endpoint"""
        response = self.client.get('/status')
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertIn('status', data)
        self.assertIn('pins', data)

    def test_process_image_no_file(self):
        """Test error handling when no file is sent"""
        response = self.client.post('/process_image')
        self.assertEqual(response.status_code, 400)

if __name__ == "__main__":
    unittest.main()
