import serial
from flask import Flask, render_template, jsonify
import time
from threading import Thread

# Configure serial communication
SERIAL_PORT = 'COM6'  # Update with your Arduino's port
BAUD_RATE = 115200

# Global variables
latest_ecg_value = 0
connection_established = False  # Tracks connection with Arduino

# Flask app
app = Flask(__name__)

# Function to read data from serial
def read_from_serial():
    global latest_ecg_value, connection_established
    try:
        with serial.Serial(SERIAL_PORT, BAUD_RATE, timeout=1) as ser:
            while True:
                line = ser.readline().decode('utf-8').strip()
                if line.isdigit():
                    latest_ecg_value = int(line)
                    if not connection_established:
                        print("Connection established with Arduino!")
                        connection_established = True
    except serial.SerialException as e:
        print(f"Serial error: {e}")
        connection_established = False

# Routes
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/data')
def data():
    global latest_ecg_value
    return jsonify({'ecg': latest_ecg_value, 'timestamp': time.time()})

if __name__ == '__main__':
    # Start serial reading in a separate thread
    serial_thread = Thread(target=read_from_serial, daemon=True)
    serial_thread.start()
    
    # Start Flask server
    app.run(debug=False, host='0.0.0.0', port=5000, threaded=True)
