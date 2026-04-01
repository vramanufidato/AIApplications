from flask import Flask, render_template, request, jsonify, send_from_directory
import os
from car_controller import CarController
from car_vision import CarVision
from werkzeug.utils import secure_filename

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = 'uploads'
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

car = CarController()
vision = CarVision()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/status')
def status():
    return jsonify(car.get_status())

@app.route('/toggle_vision', methods=['POST'])
def toggle_vision():
    data = request.json
    state = data.get('enabled', False)
    vision.toggle_google_vision(state)
    return jsonify({"google_vision": vision.use_google_vision})

@app.route('/process_image', methods=['POST'])
def process_image():
    if 'image' not in request.files:
        return jsonify({"error": "No image uploaded"}), 400
    
    file = request.files['image']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400
    
    filename = secure_filename(file.filename)
    filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    file.save(filepath)
    
    # Analyze image
    detections = vision.detect_objects(filepath)
    command = vision.get_command(detections)
    
    # Trigger car logic
    if command == "FORWARD":
        car.forward()
    elif command == "STOP":
        car.stop()
    
    return jsonify({
        "detections": detections,
        "command": command,
        "car_status": car.status
    })

@app.route('/stop', methods=['POST'])
def stop_car():
    car.stop()
    return jsonify({"status": car.status})

if __name__ == '__main__':
    app.run(debug=True, port=5000)
