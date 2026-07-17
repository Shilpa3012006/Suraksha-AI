import os
import shutil


def backup_file(source_path, backup_directory):

    os.makedirs(backup_directory, exist_ok=True)

    destination_path = os.path.join(
        backup_directory,
        os.path.basename(source_path)
    )

    shutil.copy2(source_path, destination_path)

    return destination_path