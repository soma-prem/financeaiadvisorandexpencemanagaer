import cv2
import os

def convert_to_grayscale(image_path, output_folder="processed_images"):
    # 1. Load the color image
    img = cv2.imread(image_path)
    
    if img is None:
        print("Error: Could not read image.")
        return
    
    # 2. Convert to Grayscale
    # This reduces 3 color channels (RGB) to 1 (Luminance)
    gray_img = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    
    # 3. Create output directory if it doesn't exist
    if not os.path.exists(output_folder):
        os.makedirs(output_folder)
        
    # 4. Save the result locally
    filename = os.path.basename(image_path)
    output_path = os.path.join(output_folder, f"gray_{filename}")
    cv2.imwrite(output_path, gray_img)
    
    print(f"✅ Conversion complete! saved to: {output_path}")
    
    # 5. Optional: Show the image in a window (press any key to close)
    cv2.imshow("Grayscale Result", gray_img)
    cv2.waitKey(0)
    cv2.destroyAllWindows()

# Test it with one of your images
convert_to_grayscale("googlepay_recipt1.jpeg")