"""Give changed runtime bytes new URLs without changing their execution order or contents."""
from pathlib import Path
import hashlib
import re


def version_asset_urls(directory):
    directory = Path(directory)
    def version_reference(match):
        url = match[2]
        name, _, query = url.partition('?')
        digest = hashlib.sha256((directory / name.removeprefix('./')).read_bytes()).hexdigest()[:16]
        # Preserve existing parameters, including the engine's entry=src/main.js.
        parameters = [part for part in query.split('&') if part and part.partition('=')[0] != 'v']
        parameters.append('v=' + digest)
        return match[1] + name + '?' + '&'.join(parameters) + match[3]

    html = directory / 'index.html'
    html.write_text(re.sub(r'((?:src|href)=")([.]/[^"]+)(")', version_reference, html.read_text()))
