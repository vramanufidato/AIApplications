import os

# Set the pin factory to MockFactory BEFORE importing gpiozero if you want to use it globally.
# However, it's safer to configure it explicitly.
os.environ['GPIOZERO_PIN_FACTORY'] = 'mock'

from gpiozero import LED, Device
from gpiozero.pins.mock import MockFactory

class CarController:
    def __init__(self):
        # Using LEDs to represent motors for simplicity in simulation
        # Pin 17: Forward, Pin 18: Backward, Pin 22: Left, Pin 23: Right
        self.motor_f = LED(17)
        self.motor_b = LED(18)
        self.motor_l = LED(22)
        self.motor_r = LED(23)
        self.status = "Stopped"

    def forward(self):
        self.stop()
        self.motor_f.on()
        self.status = "Moving Forward"
        print("Car: Forward")

    def stop(self):
        self.motor_f.off()
        self.motor_b.off()
        self.motor_l.off()
        self.motor_r.off()
        self.status = "Stopped"
        print("Car: Stopped")

    def turn_left(self):
        self.stop()
        self.motor_l.on()
        self.status = "Turning Left"
        print("Car: Turning Left")

    def turn_right(self):
        self.stop()
        self.motor_r.on()
        self.status = "Turning Right"
        print("Car: Turning Right")

    def get_status(self):
        return {
            "status": self.status,
            "pins": {
                "17 (F)": self.motor_f.value,
                "18 (B)": self.motor_b.value,
                "22 (L)": self.motor_l.value,
                "23 (R)": self.motor_r.value
            }
        }

if __name__ == "__main__":
    # Test simulation
    car = CarController()
    car.forward()
    print(car.get_status())
    car.stop()
    print(car.get_status())
