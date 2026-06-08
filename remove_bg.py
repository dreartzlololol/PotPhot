import time
import sys
from PIL import Image

try:
    from rembg import remove
except ImportError:
    print('Waiting for rembg/onnxruntime...')
    time.sleep(10)
    from rembg import remove

print('Removing background...')
input_img = Image.open('dist/mascot.png')
output_img = remove(input_img)
output_img.save('public/mascot.png')
print('Done!')
