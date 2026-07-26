import os
import shutil
from django.conf import settings


def create_backup(evidence):

    backup_dir = os.path.join(
        settings.BASE_DIR,
        "backups",
        "evidence"
    )

    os.makedirs(backup_dir, exist_ok=True)

    original_file = evidence.file.path

    backup_filename = os.path.basename(original_file)

    backup_file = os.path.join(
        backup_dir,
        backup_filename
    )

    shutil.copy2(original_file, backup_file)

    evidence.backup_path = backup_file
    evidence.save(update_fields=["backup_path"])

    return backup_file