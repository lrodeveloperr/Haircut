"""Validate all ten Google Play listings and their canonical text files."""

import json
from pathlib import Path
import unicodedata

root = Path(__file__).resolve().parent / "store-listing"
metadata = json.loads((root / "metadata.json").read_text())
assert len(metadata["localizations"]) == 10
assert len({item["locale"] for item in metadata["localizations"]}) == 10
for item in metadata["localizations"]:
    for field, filename, limit in (
        ("title", "title.txt", 30),
        ("shortDescription", "short_description.txt", 80),
        ("fullDescription", "full_description.txt", 4000),
    ):
        value = item[field]
        assert value == unicodedata.normalize("NFC", value), (item["locale"], field)
        assert 0 < len(value) <= limit, (item["locale"], field, len(value))
        assert len(value) == item["characterCounts"][field], (item["locale"], field)
        assert (root / item["locale"] / filename).read_text() == value + "\n", (item["locale"], filename)
    assert "ASMR" in item["title"], item["locale"]
    assert item["title"] in item["fullDescription"], item["locale"]
english = next(item for item in metadata["localizations"] if item["locale"] == "en-US")
for field in ("title", "shortDescription", "fullDescription"):
    assert metadata[field] == english[field], field
assert metadata["dailyUnlocks"]["videosPerDailyItem"] == 2
seo = json.loads((root / "seo.json").read_text())
assert seo["appName"] == metadata["title"] == seo["h1"]
assert "aggregateRating" not in seo["structuredDataDraft"]
print("PASS: 10 languages / 30 listing fields, published limits, NFC, ASMR, canonical copy and reward policy.")
