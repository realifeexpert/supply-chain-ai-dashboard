# server/app/utils/report_store.py

from typing import Dict, Any

# Yeh shared in-memory storage hai jise inventory aur orders, dono use karenge
error_reports: Dict[str, Dict[str, Any]] = {}