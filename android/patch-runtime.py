"""Apply the Android-only name and migrate the retired two-video daily reward policy.

Native AdMob delivery resolves true only for a verified earned reward, never merely
dismissal. Each daily clipper or cape now needs one completed, player-initiated video.
An existing saved credit from the former two-video policy immediately owns that item.
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

    if customers.count("const VIDEOS = () => 1;") != 1:
        raise ValueError("Android adaptation expected the one-video reward policy")
    customers = replace_once(
        customers,
        "    if (d.progress && typeof d.progress === 'object') for (const [k, n] of Object.entries(d.progress)) if (C().byKey.has(k) && Number.isSafeInteger(n) && n > 0) out.progress[k] = n;\n    return out;",
        "    if (d.progress && typeof d.progress === 'object') for (const [k, n] of Object.entries(d.progress)) if (C().byKey.has(k) && Number.isSafeInteger(n) && n > 0) out.progress[k] = n;\n"
        "    // A credit earned under Android's retired two-video rule now satisfies the one-video rule.\n"
        "    for (const [k, n] of Object.entries(out.progress)) if (n >= C().VIDEOS(C().byKey.get(k))) {\n"
        "      delete out.progress[k]; setOwned(k); out.recent = out.recent.filter((x) => x !== k).concat(k);\n"
        "    }\n"
        "    return out;",
    )
    index = replace_once(index, "<title>ASMR Barber: Fade Master</title>", f"<title>{TITLE}</title>")
    index = replace_once(index, 'aria-label="ASMR Barber: Fade Master"', f'aria-label="{TITLE}"')

    # Validate every marker before writing either output.
    customers_path.write_text(customers)
    index_path.write_text(index)


if __name__ == "__main__":
    if len(sys.argv) != 2:
        raise SystemExit("usage: python3 android/patch-runtime.py BUILD_DIRECTORY")
    adapt(sys.argv[1])
    print("Android name and one-video daily rewards applied")
