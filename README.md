import os
import time
import hashlib

# Define the shell script content
shell_script_content = """#!/bin/bash
sleep 5
echo "Hello, this message is printed after a 5-second delay!"
"""

# File name for the shell script
script_file = "delayed_print.sh"

# Write the shell script to a file
with open(script_file, "w") as file:
    file.write(shell_script_content)

# Make the script executable
os.chmod(script_file, 0o755)

print(f"Shell script '{script_file}' created and made executable.")
print("Run it using './delayed_print.sh' in your terminal.")

# Function to calculate the hash of a file
def calculate_hash(file_path):
    hash_md5 = hashlib.md5()
    with open(file_path, "rb") as f:
        for chunk in iter(lambda: f.read(4096), b""):
            hash_md5.update(chunk)
    return hash_md5.hexdigest()

# Function to monitor folder for changes
def monitor_folder(folder_path):
    files_state = {}
    for file_name in os.listdir(folder_path):
        file_path = os.path.join(folder_path, file_name)
        if os.path.isfile(file_path):
            files_state[file_name] = calculate_hash(file_path)
    return files_state

# Path to monitor
folder_to_monitor = "."

# Initial state of the folder
previous_state = monitor_folder(folder_to_monitor)

# Python code to run the shell script every 5 seconds
try:
    while True:
        # Run the shell script
        os.system(f"./{script_file}")

        # Monitor the folder for changes
        current_state = monitor_folder(folder_to_monitor)
        if current_state != previous_state:
            print("Changes detected in the folder:")
            for file_name, file_hash in current_state.items():
                if file_name not in previous_state:
                    print(f"New file added: {file_name}")
                elif previous_state[file_name] != file_hash:
                    print(f"File modified: {file_name}")
            for file_name in previous_state:
                if file_name not in current_state:
                    print(f"File removed: {file_name}")
            previous_state = current_state

        # Wait for 5 seconds
        time.sleep(5)
except KeyboardInterrupt:
    print("Stopped running the shell script.")
