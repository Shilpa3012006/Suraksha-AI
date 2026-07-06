import os

from cryptography.fernet import Fernet
from dotenv import load_dotenv

load_dotenv()

key = os.getenv("ENCRYPTION_KEY")

if key is None:
    raise ValueError("ENCRYPTION_KEY not found in .env")

cipher = Fernet(key.encode())


def encrypt_data(data: bytes):

    return cipher.encrypt(data)


def decrypt_data(data: bytes):

    return cipher.decrypt(data)

def encrypt_file(input_path, output_path):

    with open(input_path, "rb") as file:

        original_data = file.read()

    encrypted_data = encrypt_data(original_data)

    with open(output_path, "wb") as file:

        file.write(encrypted_data)


def decrypt_file(input_path, output_path):

    with open(input_path, "rb") as file:

        encrypted_data = file.read()

    decrypted_data = decrypt_data(encrypted_data)

    with open(output_path, "wb") as file:

        file.write(decrypted_data)