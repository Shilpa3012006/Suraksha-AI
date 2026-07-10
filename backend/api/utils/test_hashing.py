from api.utils.hashing import generate_hash, verify_hash

file_path = "api/utils/test_files/sample.txt"

stored_hash = generate_hash(file_path)

print("Stored Hash:")
print(stored_hash)

print("\nVerification Result:")
print(verify_hash(file_path, stored_hash))