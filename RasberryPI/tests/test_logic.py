import unittest
import os
import cv2
import numpy as np
from car_controller import CarController
from car_vision import CarVision

class TestCarSimulation(unittest.TestCase):
    def setUp(self):
        self.car = CarController()
        self.vision = CarVision()

    def test_car_movement(self):
        """Test if car controller updates status correctly"""
        self.car.forward()
        self.assertEqual(self.car.status, "Moving Forward")
        self.car.stop()
        self.assertEqual(self.car.status, "Stopped")

    def test_opencv_detection_green(self):
        """Test OpenCV logic with a generated green image"""
        # Create a green image
        img = np.zeros((100, 100, 3), dtype=np.uint8)
        img[:] = (0, 255, 0) # Green in BGR
        cv2.imwrite("test_green.png", img)
        
        detections = self.vision._detect_opencv("test_green.png")
        self.assertIn("Green Light", detections)
        
        command = self.vision.get_command(detections)
        self.assertEqual(command, "FORWARD")
        
        if os.path.exists("test_green.png"):
            os.remove("test_green.png")

    def test_opencv_detection_red(self):
        """Test OpenCV logic with a generated red image"""
        # Create a red image
        img = np.zeros((100, 100, 3), dtype=np.uint8)
        img[:] = (0, 0, 255) # Red in BGR
        cv2.imwrite("test_red.png", img)
        
        detections = self.vision._detect_opencv("test_red.png")
        self.assertIn("Red Light", detections)
        
        command = self.vision.get_command(detections)
        self.assertEqual(command, "STOP")
        
        if os.path.exists("test_red.png"):
            os.remove("test_red.png")

if __name__ == "__main__":
    unittest.main()
