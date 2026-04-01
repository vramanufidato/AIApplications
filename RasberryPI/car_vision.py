import cv2
import numpy as np
from PIL import Image
try:
    from google.cloud import vision
except ImportError:
    vision = None

class CarVision:
    def __init__(self):
        self.use_google_vision = False
        self.client = None
        if vision:
            try:
                # Only try to init if credentials might exist, or just catch it
                self.client = vision.ImageAnnotatorClient()
            except Exception as e:
                # Silently fail, we have OpenCV as fallback
                pass


    def toggle_google_vision(self, state: bool):
        self.use_google_vision = state

    def detect_objects(self, image_path):
        if self.use_google_vision and self.client:
            return self._detect_google(image_path)
        else:
            return self._detect_opencv(image_path)

    def _detect_opencv(self, image_path):
        # Basic OpenCV simulation: 
        # In a real app, you'd use Haar Cascades or a pre-trained model.
        # For this PoC, we'll simulate detection based on filename or simple color presence.
        img = cv2.imread(image_path)
        if img is None:
            return ["Unknown"]

        # Dummy logic: Check for dominant colors to simulate detection
        # Red dominant -> Stop, Green dominant -> Forward
        hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
        
        # Red color range
        lower_red = np.array([0, 100, 100])
        upper_red = np.array([10, 255, 255])
        mask_red = cv2.inRange(hsv, lower_red, upper_red)
        
        # Green color range
        lower_green = np.array([40, 40, 40])
        upper_green = np.array([80, 255, 255])
        mask_green = cv2.inRange(hsv, lower_green, upper_green)

        if np.sum(mask_red) > np.sum(mask_green) and np.sum(mask_red) > 5000:
            return ["Red Light", "Stop"]
        elif np.sum(mask_green) > np.sum(mask_red) and np.sum(mask_green) > 5000:
            return ["Green Light", "Forward"]
        
        return ["Clear Path"]

    def _detect_google(self, image_path):
        if not self.client:
            return ["Google Vision Not Configured"]
        
        with open(image_path, "rb") as image_file:
            content = image_file.read()

        image = vision.Image(content=content)
        response = self.client.label_detection(image=image)
        labels = response.label_annotations
        
        detected = [label.description for label in labels]
        return detected

    def get_command(self, detections):
        # Simple mapping
        for d in detections:
            d_lower = d.lower()
            if "stop" in d_lower or "red" in d_lower:
                return "STOP"
            if "green" in d_lower or "forward" in d_lower or "go" in d_lower:
                return "FORWARD"
        return "IDLE"
