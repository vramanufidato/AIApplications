# Autonomous Electric Car Simulation (Raspberry Pi PoC)

This project simulates an autonomous electric car that uses computer vision (OpenCV/Google Vision) to make movement decisions. It features a web-based dashboard and a mock hardware controller.

## 🚀 Features
- **OpenCV Integration**: Local color-based object detection (Default).
- **Google Cloud Vision**: Optional cloud-based label detection (Toggleable).
- **Raspberry Pi Mocking**: Simulates GPIO pins using `gpiozero` without physical hardware.
- **Web Dashboard**: Control and monitor the car via a Flask-based interface.

## 🛠️ Setup Instructions

### 1. Prerequisites
- Python 3.8+
- OpenCV and Flask dependencies (installed via pip)

### 2. Environment Setup
```bash
# Create and activate virtual environment
python -m venv venv
.\venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### 3. Running the Application
```bash
python app.py
```
Visit `http://127.0.0.1:5000` in your browser.

### 4. Running Tests
```bash
python -m unittest discover tests
```

## 🎮 How to Use
1. **Open the Dashboard**: You'll see the current car status (Stopped).
2. **Simulate Camera**: Click "Capture Image" and upload a photo.
   - **Green objects** will trigger the car to move **FORWARD**.
   - **Red objects** will trigger the car to **STOP**.
3. **Toggle Vision**: Use the checkbox to switch to Google Cloud Vision (requires standard Google Cloud authentication).
4. **Active Pins**: Watch the "Pins Active" section to see which simulated GPIO pins are being fired.

## 🔧 Project Structure
- `app.py`: Flask server and API endpoints.
- `car_controller.py`: Logic for hardware simulation.
- `car_vision.py`: Image processing and command generation.
- `templates/`: HTML frontend.
- `tests/`: Automated test suite.
