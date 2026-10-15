"""Check the extracted YouTube upload's content-addressed startup URLs.

Run from the repository root; RELEASE_DIR can point at an extracted ZIP. This
does not rebuild or mutate the release. Each referenced payload is also changed
in memory to prove its existing URL would fail the content-hash check.
"""

from hashlib import sha256
from html.parser import HTMLParser
import json
import os
from pathlib import Path
import re
from urllib.parse import parse_qsl, unquote, urlsplit


OFFICIAL_SDK = "https://www.youtube.com/game_api/v1"


class ReleaseHTML(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.references = []
        self.scripts = []
        self.links = []

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == "script":
            self.scripts.append(attrs)
        if tag == "link":
            self.links.append(attrs)
        for name in ("src", "href"):
            if name in attrs:
                self.references.append(attrs[name])


def check(condition, message):
    if not condition:
        raise AssertionError(message)


def content_hash_matches(url, payload):
    versions = [value for key, value in parse_qsl(urlsplit(url).query) if key == "v"]
    if len(versions) != 1 or not re.fullmatch(r"[0-9a-f]{12,64}", versions[0]):
        return False
    return versions[0] == sha256(payload).hexdigest()[: len(versions[0])]


def main():
    root = Path(os.environ.get("RELEASE_DIR", "source/build-youtube")).resolve()
    parser = ReleaseHTML()
    parser.feed((root / "index.html").read_text())
    check(bool(parser.scripts), "No startup scripts found")
    first = parser.scripts[0]
    check(first.get("src") == OFFICIAL_SDK, "The unchanged official SDK must be the first script")
    check("async" not in first and "defer" not in first,
          "The official SDK must remain a blocking first script")
    external = [url for url in parser.references if urlsplit(url).scheme or urlsplit(url).netloc]
    check(external == [OFFICIAL_SDK], "Unexpected external resource or packaged SDK substitute")

    local = [url for url in parser.references if url not in external]
    check(bool(local), "No local startup resources found")
    checked = []
    for url in local:
        parts = urlsplit(url)
        check(parts.path.startswith("./") and not parts.fragment,
              f"Expected a relative release asset without a fragment: {url}")
        asset = (root / unquote(parts.path)).resolve()
        check(asset.is_relative_to(root) and asset.is_file(), f"Missing release asset: {url}")
        payload = asset.read_bytes()
        check(content_hash_matches(url, payload), f"Asset URL does not identify its actual bytes: {url}")
        # A changed response at an old URL must be rejected. No files are changed.
        changed = payload + b"\ncache-url-regression-mutation\n"
        check(not content_hash_matches(url, changed), f"Changed bytes retained a valid old URL: {url}")
        bare = parts._replace(query="").geturl()
        check(not content_hash_matches(bare, payload), f"An unversioned URL was accepted: {url}")
        checked.append({"path": parts.path, "sha256": sha256(payload).hexdigest()})

    local_scripts = [item["src"] for item in parser.scripts[1:]]
    check(all(url in local for url in local_scripts), "A nonlocal script follows the official SDK")
    game_urls = [url for url in local_scripts if urlsplit(url).path == "./runtime/game.js"]
    check(len(game_urls) == 1, "Expected exactly one game entry script")
    game_query = parse_qsl(urlsplit(game_urls[0]).query)
    check([value for key, value in game_query if key == "entry"] == ["src/main.js"],
          "The existing game entry parameter was lost or changed")
    for url in local_scripts:
        payload = (root / unquote(urlsplit(url).path)).read_text()
        check(not re.search(r"\b(?:window|globalThis)\.ytgame\s*=(?!=)", payload),
              f"A release script replaces the official SDK: {url}")
        check("strict-test-fixture" not in payload, f"A test SDK was packaged: {url}")

    lighting = [item["href"] for item in parser.links
                if item.get("rel") == "preload" and item.get("as") == "fetch"
                and urlsplit(item.get("href", "")).path == "./runtime/room-env.dat"]
    check(len(lighting) == 1, "Expected one versioned reflection-lighting preload")
    geo = (root / "runtime/youtube-geo.js").read_text()
    fetched = re.findall(r"\bfetch\(\s*(['\"])([^'\"]+)\1\s*,", geo)
    check([url for _, url in fetched] == lighting,
          "Reflection preload and fetch must use the exact same versioned URL")
    print(json.dumps({"status": "PASS", "releaseDir": str(root),
                      "contentAddressedAssets": len(checked),
                      "changedPayloadRejections": len(checked),
                      "unversionedURLRejections": len(checked),
                      "officialSDKFirst": True, "gameEntryPreserved": True,
                      "lightingPreloadMatchesFetch": True}, indent=2))


if __name__ == "__main__":
    main()
