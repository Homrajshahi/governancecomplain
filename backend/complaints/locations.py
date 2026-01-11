"""Static Nepal location map used for routing complaints to offices."""

from typing import Dict, List

# Province -> District -> Offices
# Simplified to Bagmati Province only
LOCATION_DATA: Dict[str, Dict[str, List[str]]] = {
    "Bagmati": {
        "Kathmandu": [
            "Ward Office",
            "Municipality Office",
            "Electricity Authority",
            "Water Supply",
            "Police (Non-Emergency)",
            "University Administration",
        ],
        "Lalitpur": [
            "Ward Office",
            "Municipality Office",
            "Electricity Authority",
            "Water Supply",
            "Police (Non-Emergency)",
            "University Administration",
        ],
        "Bhaktapur": [
            "Ward Office",
            "Municipality Office",
            "Electricity Authority",
            "Water Supply",
            "Police (Non-Emergency)",
            "University Administration",
        ],
        "Chitwan": [
            "Ward Office",
            "Municipality Office",
            "Electricity Authority",
            "Water Supply",
            "Police (Non-Emergency)",
            "University Administration",
        ],
        "Makwanpur": [
            "Ward Office",
            "Municipality Office",
            "Electricity Authority",
            "Water Supply",
            "Police (Non-Emergency)",
            "University Administration",
        ],
    },
}


def get_provinces() -> List[str]:
    return sorted(LOCATION_DATA.keys())


def get_districts(province: str) -> List[str]:
    return sorted(LOCATION_DATA.get(province, {}).keys())


def get_offices(province: str, district: str) -> List[str]:
    return LOCATION_DATA.get(province, {}).get(district, [])


def is_valid_location(province: str, district: str, office: str) -> bool:
    return office in get_offices(province, district)
