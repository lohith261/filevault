"""
FileVault Agent SDK — Python
Zero dependencies beyond the standard library (uses urllib).
Requires Python 3.9+.

Usage:
    from filevault import FileVault

    fv = FileVault("fv_sk_...")
    file = fv.files.upload(open("report.pdf", "rb"), name="report.pdf", index=True)
    results = fv.search("What is the refund policy?")
"""

from __future__ import annotations

import json
import uuid
from io import IOBase
from typing import Any, Iterator, AsyncIterator
from urllib.error import HTTPError
from urllib.request import Request, urlopen


# ── Exceptions ────────────────────────────────────────────────────────────────


class FileVaultError(Exception):
    def __init__(self, status: int, message: str) -> None:
        super().__init__(f"HTTP {status}: {message}")
        self.status = status


# ── Types (dataclasses would add py3.7 dep, use dicts with helpers) ───────────


class FileRecord(dict):
    @property
    def file_id(self) -> str:
        return self["file_id"]

    @property
    def name(self) -> str:
        return self["name"]

    @property
    def size_bytes(self) -> int:
        return self["size_bytes"]

    @property
    def is_indexed(self) -> bool:
        return self["is_indexed"]

    @property
    def url(self) -> str:
        return self["url"]

    @property
    def metadata(self) -> dict[str, Any] | None:
        return self.get("metadata")


class SearchResult(dict):
    @property
    def id(self) -> str:
        return self["id"]

    @property
    def type(self) -> str:
        return self["type"]

    @property
    def content(self) -> str:
        return self["content"]

    @property
    def score(self) -> float:
        return self["score"]

    @property
    def file_id(self) -> str | None:
        return self.get("file_id")

    @property
    def url(self) -> str | None:
        return self.get("url")


class MemoryRecord(dict):
    @property
    def id(self) -> str:
        return self["id"]

    @property
    def content(self) -> str:
        return self["content"]

    @property
    def created_at(self) -> str:
        return self["created_at"]

    @property
    def expires_at(self) -> str | None:
        return self.get("expires_at")


class CollectionRecord(dict):
    @property
    def collection_id(self) -> str:
        return self["collection_id"]

    @property
    def name(self) -> str:
        return self["name"]

    @property
    def file_count(self) -> int:
        return self["file_count"]


class ShareRecord(dict):
    @property
    def share_id(self) -> str:
        return self["share_id"]

    @property
    def grantee_agent_id(self) -> str | None:
        return self.get("grantee_agent_id")

    @property
    def owner_agent_id(self) -> str | None:
        return self.get("owner_agent_id")


class StateRecord(dict):
    @property
    def state_id(self) -> str:
        return self["state_id"]

    @property
    def key(self) -> str:
        return self["key"]

    @property
    def created_at(self) -> str:
        return self["created_at"]

    @property
    def updated_at(self) -> str:
        return self["updated_at"]


# ── Multipart helper ──────────────────────────────────────────────────────────


def _encode_multipart(
    fields: dict[str, str],
    files: list[tuple[str, str, bytes]],
    boundary: str,
) -> bytes:
    """Encode fields and files into multipart/form-data bytes."""
    parts: list[bytes] = []
    b = boundary.encode()

    for name, value in fields.items():
        parts.append(
            b"--" + b + b"\r\n"
            b'Content-Disposition: form-data; name="' + name.encode() + b'"\r\n\r\n'
            + value.encode() + b"\r\n"
        )

    for field_name, filename, data in files:
        parts.append(
            b"--" + b + b"\r\n"
            b'Content-Disposition: form-data; name="' + field_name.encode()
            + b'"; filename="' + filename.encode() + b'"\r\n'
            b"Content-Type: application/octet-stream\r\n\r\n"
            + data + b"\r\n"
        )

    parts.append(b"--" + b + b"--\r\n")
    return b"".join(parts)


# ── Core client ───────────────────────────────────────────────────────────────


class _BaseClient:
    def __init__(self, api_key: str, base_url: str) -> None:
        self._api_key = api_key
        self._base_url = base_url.rstrip("/")

    def _url(self, path: str) -> str:
        return f"{self._base_url}/api/v1{path}"

    def _headers(self, extra: dict[str, str] | None = None) -> dict[str, str]:
        h = {"Authorization": f"Bearer {self._api_key}"}
        if extra:
            h.update(extra)
        return h

    def _request(self, method: str, path: str, body: Any = None) -> Any:
        data = json.dumps(body).encode() if body is not None else None
        req = Request(
            self._url(path),
            data=data,
            headers=self._headers({"Content-Type": "application/json"} if data else None),
            method=method,
        )
        try:
            with urlopen(req, timeout=30) as resp:
                raw = resp.read()
                return json.loads(raw) if raw else None
        except HTTPError as e:
            try:
                err = json.loads(e.read())
                msg = err.get("error", e.reason)
            except Exception:
                msg = e.reason
            raise FileVaultError(e.code, str(msg)) from None

    def _multipart(self, path: str, fields: dict[str, str], files: list[tuple[str, str, bytes]]) -> Any:
        boundary = uuid.uuid4().hex
        body = _encode_multipart(fields, files, boundary)
        req = Request(
            self._url(path),
            data=body,
            headers=self._headers({"Content-Type": f"multipart/form-data; boundary={boundary}"}),
            method="POST",
        )
        try:
            with urlopen(req, timeout=60) as resp:
                return json.loads(resp.read())
        except HTTPError as e:
            try:
                err = json.loads(e.read())
                msg = err.get("error", e.reason)
            except Exception:
                msg = e.reason
            raise FileVaultError(e.code, str(msg)) from None


# ── Files sub-client ──────────────────────────────────────────────────────────


class FilesClient(_BaseClient):
    def list(
        self,
        *,
        limit: int = 20,
        cursor: str | None = None,
        indexed: bool | None = None,
    ) -> dict[str, Any]:
        """List files. Returns {"files": [...], "next_cursor": str | None}."""
        params = f"limit={limit}"
        if cursor:
            params += f"&cursor={cursor}"
        if indexed is not None:
            params += f"&indexed={'true' if indexed else 'false'}"
        return self._request("GET", f"/files?{params}")

    def iter(self, *, indexed: bool | None = None) -> Iterator[FileRecord]:
        """Iterate all files, handling pagination automatically."""
        cursor = None
        while True:
            page = self.list(limit=100, cursor=cursor, indexed=indexed)
            for f in page["files"]:
                yield FileRecord(f)
            cursor = page.get("next_cursor")
            if not cursor:
                break

    def get(self, file_id: str) -> FileRecord:
        return FileRecord(self._request("GET", f"/files/{file_id}"))

    def upload(
        self,
        file: IOBase | bytes,
        *,
        name: str,
        index: bool = False,
        metadata: dict[str, Any] | None = None,
    ) -> FileRecord:
        """Upload a single file."""
        data = file.read() if isinstance(file, IOBase) else file
        fields: dict[str, str] = {"index": "true" if index else "false"}
        if metadata:
            fields["metadata"] = json.dumps(metadata)
        return FileRecord(self._multipart("/files", fields, [("file", name, data)]))

    def upload_batch(
        self,
        files: list[tuple[IOBase | bytes, str]],
        *,
        index: bool = False,
        metadata: dict[str, Any] | None = None,
    ) -> list[FileRecord]:
        """Upload up to 10 files at once. Each entry is (file_data, filename)."""
        if len(files) > 10:
            raise ValueError("Maximum 10 files per batch")
        fields: dict[str, str] = {"index": "true" if index else "false"}
        if metadata:
            fields["metadata"] = json.dumps(metadata)
        file_tuples = [
            ("files", name, (f.read() if isinstance(f, IOBase) else f))
            for f, name in files
        ]
        result = self._multipart("/files/batch", fields, file_tuples)
        return [FileRecord(f) for f in result["files"]]

    def index(self, file_id: str) -> dict[str, Any]:
        """Trigger indexing for an existing file."""
        return self._request("POST", f"/files/{file_id}/index")

    def delete(self, file_id: str) -> None:
        """Delete a file and all its embeddings."""
        self._request("DELETE", f"/files/{file_id}")


# ── Memory sub-client ─────────────────────────────────────────────────────────


class MemoryClient(_BaseClient):
    def list(self, *, limit: int = 20, cursor: str | None = None) -> dict[str, Any]:
        params = f"limit={limit}"
        if cursor:
            params += f"&cursor={cursor}"
        return self._request("GET", f"/memory?{params}")

    def iter(self) -> Iterator[MemoryRecord]:
        cursor = None
        while True:
            page = self.list(limit=100, cursor=cursor)
            for m in page["memories"]:
                yield MemoryRecord(m)
            cursor = page.get("next_cursor")
            if not cursor:
                break

    def add(self, content: str, *, ttl_seconds: int | None = None) -> MemoryRecord:
        body: dict[str, Any] = {"content": content}
        if ttl_seconds is not None:
            body["ttl_seconds"] = ttl_seconds
        return MemoryRecord(self._request("POST", "/memory", body))


# ── Collections sub-client ────────────────────────────────────────────────────


class CollectionsClient(_BaseClient):
    def list(self) -> dict[str, Any]:
        return self._request("GET", "/collections")

    def create(self, name: str) -> CollectionRecord:
        return CollectionRecord(self._request("POST", "/collections", {"name": name}))

    def get(self, collection_id: str) -> dict[str, Any]:
        return self._request("GET", f"/collections/{collection_id}")

    def delete(self, collection_id: str) -> None:
        self._request("DELETE", f"/collections/{collection_id}")

    def add_file(self, collection_id: str, file_id: str) -> None:
        self._request("POST", f"/collections/{collection_id}/files", {"file_id": file_id})

    def remove_file(self, collection_id: str, file_id: str) -> None:
        self._request("DELETE", f"/collections/{collection_id}/files/{file_id}")


# ── Shares sub-client ─────────────────────────────────────────────────────────


class SharesClient(_BaseClient):
    def list(self) -> dict[str, Any]:
        return self._request("GET", "/shares")

    def grant(self, agent_id: str) -> ShareRecord:
        return ShareRecord(self._request("POST", "/shares", {"agent_id": agent_id}))

    def revoke(self, grantee_id: str) -> None:
        self._request("DELETE", f"/shares/{grantee_id}")


# ── State sub-client ──────────────────────────────────────────────────────────


class StateClient(_BaseClient):
    def list(self, *, limit: int = 20, cursor: str | None = None, key: str | None = None) -> dict[str, Any]:
        params = f"limit={limit}"
        if cursor:
            params += f"&cursor={cursor}"
        if key:
            params += f"&key={key}"
        return self._request("GET", f"/state?{params}")

    def iter(self) -> Iterator[StateRecord]:
        cursor = None
        while True:
            page = self.list(limit=100, cursor=cursor)
            for s in page["states"]:
                yield StateRecord(s)
            cursor = page.get("next_cursor")
            if not cursor:
                break

    def get(self, state_id: str) -> dict[str, Any]:
        return self._request("GET", f"/state/{state_id}")

    def set(self, key: str, data: dict[str, Any]) -> StateRecord:
        return StateRecord(self._request("POST", "/state", {"key": key, "data": data}))

    def delete(self, state_id: str) -> None:
        self._request("DELETE", f"/state/{state_id}")


# ── Main client ───────────────────────────────────────────────────────────────


class FileVault(_BaseClient):
    """
    FileVault agent client.

    Args:
        api_key: Your agent API key (starts with fv_sk_).
        base_url: API base URL (default: https://filevault.host).
    """

    def __init__(self, api_key: str, base_url: str = "https://filevault.host") -> None:
        super().__init__(api_key, base_url)
        self.files = FilesClient(api_key, base_url)
        self.memory = MemoryClient(api_key, base_url)
        self.collections = CollectionsClient(api_key, base_url)
        self.shares = SharesClient(api_key, base_url)
        self.state = StateClient(api_key, base_url)

    def search(
        self,
        query: str,
        *,
        type: str = "all",
        file_id: str | None = None,
        metadata: dict[str, Any] | None = None,
        limit: int = 5,
    ) -> list[SearchResult]:
        """
        Semantic search over files and/or memory.

        Args:
            query: Natural language query.
            type: "all", "files", or "memory".
            file_id: Restrict to a single file's embeddings.
            metadata: Filter by file metadata key/value pairs.
            limit: Max results (1-20).
        """
        filter_: dict[str, Any] = {"type": type}
        if file_id:
            filter_["file_id"] = file_id
        if metadata:
            filter_["metadata"] = metadata

        data = self._request("POST", "/search", {"query": query, "filter": filter_, "limit": limit})
        return [SearchResult(r) for r in data["results"]]

    def usage(self) -> dict[str, Any]:
        """Return storage and activity metrics for this agent."""
        return self._request("GET", "/usage")

    def get_webhook(self) -> str | None:
        data = self._request("GET", "/webhooks")
        return data.get("webhook_url")

    def set_webhook(self, url: str) -> None:
        self._request("PUT", "/webhooks", {"url": url})

    def delete_webhook(self) -> None:
        self._request("DELETE", "/webhooks")
