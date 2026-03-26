from io import BytesIO
from zipfile import ZipFile


def parse_zip_logs(log_zip_content: bytes) -> str:
    output_parts: list[str] = []
    with ZipFile(BytesIO(log_zip_content)) as zip_file:
        for name in sorted(zip_file.namelist()):
            if name.endswith("/"):
                continue
            with zip_file.open(name) as file_ref:
                content = file_ref.read().decode("utf-8", errors="ignore")
                output_parts.append(f"===== {name} =====\n{content}")
    return "\n\n".join(output_parts)
