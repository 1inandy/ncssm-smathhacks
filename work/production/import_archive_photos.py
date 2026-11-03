"""Carry over the old public event galleries as local, optimized photo assets."""
from concurrent.futures import ThreadPoolExecutor
from html.parser import HTMLParser
from io import BytesIO
from pathlib import Path
import json
import re
import subprocess
from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parents[2]
SOURCE = "https://smathhacks.ncssm.edu/past-events"


class Archive(HTMLParser):
    def __init__(self):
        super().__init__()
        self.year = None
        self.section = None
        self.caption = False
        self.sections = []

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == "section":
            self.section = {"year": self.year, "images": [], "captions": []}
        if tag == "a":
            href = attrs.get("href", "")
            for marker, year in [("smathhacks2025", 2025), ("smathhacks-2024", 2024),
                                 ("unihacks-2023", 2023), ("unihacks-2022", 2022),
                                 ("unihacks-2021", 2021)]:
                if marker in href:
                    self.year = year
                    if self.section is not None:
                        self.section["year"] = year
        if self.section is not None:
            if attrs.get("aria-label") == "Carousel image":
                url = re.search(r"url\((.*?)\)", attrs.get("style", ""))
                if url:
                    self.section["images"].append(url[1])
            if attrs.get("jsname") == "vM03ic":
                self.caption = True

    def handle_endtag(self, tag):
        if tag == "span":
            self.caption = False
        if tag == "section" and self.section is not None:
            if self.section["images"]:
                self.sections.append(self.section)
            self.section = None

    def handle_data(self, data):
        if self.caption and self.section is not None:
            self.section["captions"].append(data)


def download(record):
    target = ROOT / record["src"]
    target.parent.mkdir(parents=True, exist_ok=True)
    url = re.sub(r"=w\d+$", "=w1280", record["source"])
    raw = subprocess.check_output(["curl", "-fLsS", "--retry", "2", url])
    image = ImageOps.exif_transpose(Image.open(BytesIO(raw))).convert("RGB")
    image.thumbnail((1280, 1280))
    image.save(target, "WEBP", quality=82)
    return {**record, "width": image.width, "height": image.height}


if __name__ == "__main__":
    parser = Archive()
    parser.feed(subprocess.check_output(["curl", "-fLsS", SOURCE], text=True))
    records = []
    for section in parser.sections:
        if not section["year"]:
            raise ValueError("An archive gallery has no year")
        for index, url in enumerate(section["images"]):
            campus = section["captions"][index] if index < len(section["captions"]) else "Event"
            year = section["year"]
            records.append({"year": year, "campus": campus,
                            "src": f"assets/past-events/{year}-{index + 1:02d}.webp",
                            "alt": f"{campus} photo {index + 1} from the {year} hackathon.",
                            "source": url})
    with ThreadPoolExecutor(max_workers=6) as pool:
        photos = list(pool.map(download, records))
    (ROOT / "archive-photos.json").write_text(json.dumps(photos, indent=2) + "\n")
    counts = {year: sum(p["year"] == year for p in photos) for year in sorted({p["year"] for p in photos}, reverse=True)}
    print(f"Imported {len(photos)} original photos: {counts}")
