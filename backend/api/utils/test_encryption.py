from api.utils.encryption import encrypt_file, decrypt_file

encrypt_file(
    "api/utils/test_files/sample.txt",
    "api/utils/test_files/sample.encrypted"
)

print("File encrypted successfully.")

decrypt_file(
    "api/utils/test_files/sample.encrypted",
    "api/utils/test_files/sample_decrypted.txt"
)

print("File decrypted successfully.")