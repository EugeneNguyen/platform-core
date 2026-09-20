"""Reads the consuming platform's `modules.yaml` - the list of modules
composed into whatever platform this kernel is running inside.

platform-core is a reusable submodule (see AGENTS.md/README.md) - it does
not know, at authoring time, where the consuming platform puts its own
`modules.yaml` (GoalNexa keeps it at its repo root, a different platform
could put it anywhere). The path is therefore always read from the
`MODULES_MANIFEST_PATH` env var, never hardcoded/guessed from this
package's own location - an unset var means "no manifest available",
handled gracefully (empty list), not an error.
"""

from __future__ import annotations

import os
from pathlib import Path
from typing import Literal

import yaml
from pydantic import BaseModel


class ModuleConfig(BaseModel):
    name: str
    kind: Literal["kernel", "module"]
    path: str
    repo: str
    enabled: bool = True
    # Path this module is mounted at behind the single-port gateway
    # (nginx proxies "{url_prefix}/" to the module's frontend and
    # "{url_prefix}/api/" to its backend) - the platform-core frontend
    # shell links to this rather than trying to render the module's UI
    # itself (no module federation). Optional: a backend-only module (or
    # platform-core itself, served at the root "/") has none.
    url_prefix: str | None = None


def _manifest_path() -> Path | None:
    raw = os.environ.get("MODULES_MANIFEST_PATH")
    return Path(raw) if raw else None


def load_modules() -> list[ModuleConfig]:
    manifest_path = _manifest_path()
    if manifest_path is None or not manifest_path.is_file():
        return []
    data = yaml.safe_load(manifest_path.read_text())
    return [ModuleConfig(**entry) for entry in (data or {}).get("modules", [])]


def get_enabled_modules() -> list[ModuleConfig]:
    return [module for module in load_modules() if module.enabled]
