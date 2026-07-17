from api.utils.backup import backup_file

source = "media/evidence_files/RSD-2.png.encrypted"

destination = backup_file(
    source,
    "backups"
)

print("Backup created successfully!")

print(destination)