import cv2

def test_backends_and_indices():
    backends = {
        "CAP_DSHOW (DirectShow)": cv2.CAP_DSHOW,
        "CAP_MSMF (Media Foundation)": cv2.CAP_MSMF,
        "Default API": None
    }
    
    print("Scanning camera devices and backends...")
    
    for backend_name, backend_api in backends.items():
        print(f"\n=================== Testing Backend: {backend_name} ===================")
        for index in range(10):
            if backend_api is not None:
                cap = cv2.VideoCapture(index, backend_api)
            else:
                cap = cv2.VideoCapture(index)
                
            if cap.isOpened():
                ret, frame = cap.read()
                if ret:
                    filename = f"frame_{backend_name.split()[0]}_idx_{index}.jpg"
                    cv2.imwrite(filename, frame)
                    print(f"SUCCESS: Opened index {index} with {backend_name}. Frame shape: {frame.shape}. Saved as {filename}")
                else:
                    print(f"WARNING: Opened index {index} with {backend_name} but failed to read frame.")
                cap.release()
            else:
                # Silently skip failed opens to keep output clean
                pass

if __name__ == "__main__":
    test_backends_and_indices()
