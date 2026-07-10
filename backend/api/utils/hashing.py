import hashlib


def generate_hash(file_path):

    sha256 = hashlib.sha256()

    with open(file_path, "rb") as file:

        while True:

            chunk = file.read(4096)

            if not chunk:
                break

            sha256.update(chunk)

    return sha256.hexdigest()

def verify_hash(file_path, stored_hash):

    new_hash = generate_hash(file_path)

    return new_hash == stored_hash