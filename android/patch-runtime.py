"""Apply Android-only name, daily reward policy and face masters to a freshly built web runtime.

Native AdMob delivery is supplied by the future Android client. Its showRewarded
promise must resolve true only for a verified earned reward, never merely dismissal.
The existing wardrobe then persists one credit per successful request and unlocks
each daily clipper/cape after two separate, player-initiated video requests.
"""

from pathlib import Path
import sys

TITLE = "Barber Simulator: ASMR Haircut"


def replace_once(text, old, new):
    if text.count(old) != 1:
        raise ValueError(f"Android adaptation expected one occurrence: {old!r}")
    return text.replace(old, new, 1)


def adapt(build_dir):
    build = Path(build_dir)
    customers_path = build / "runtime" / "customers.js"
    index_path = build / "index.html"
    customers = customers_path.read_text()
    index = index_path.read_text()

    customers = replace_once(customers, "const VIDEOS = () => 1;", "const VIDEOS = () => 2;")
    customers = replace_once(
        customers,
        "// every pick is one rewarded video (the premium flag only marks the flashiest designs)",
        "// Android: each daily pick needs two rewarded videos; premium remains cosmetic.",
    )
    customers = replace_once(
        customers,
        "// a countdown to midnight: one rewarded video unlocks it and puts it on. When the day ends the offer is",
        "// a countdown to midnight: two rewarded videos unlock it and put it on. When the day ends the offer is",
    )
    customers = replace_once(
        customers,
        '"Today\'s pick: watch a video to get it"',
        '"Today\'s pick: watch " + (need - done) + " rewarded video" + ((need - done) === 1 ? "" : "s") + " to unlock"',
    )
    customers = replace_once(customers, "const USE_MASTERS = false;", "const USE_MASTERS = true;")
    index = replace_once(index, "<title>ASMR Barber: Fade Master</title>", f"<title>{TITLE}</title>")
    index = replace_once(index, 'aria-label="ASMR Barber: Fade Master"', f'aria-label="{TITLE}"')

    # Validate every marker before writing either output.
    customers_path.write_text(customers)
    index_path.write_text(index)


if __name__ == "__main__":
    if len(sys.argv) != 2:
        raise SystemExit("usage: python3 android/patch-runtime.py BUILD_DIRECTORY")
    adapt(sys.argv[1])
    print("Android name, two-video daily rewards and face masters applied")
