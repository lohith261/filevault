# filevault · Python SDK

Zero-dependency Python client for the [FileVault](https://filevault.host) Agent Storage API.

```bash
pip install filevault
```

## Quickstart

```python
from filevault import FileVault

fv = FileVault("fv_sk_...")

# Upload and index a file
with open("handbook.pdf", "rb") as f:
    file = fv.files.upload(f, name="handbook.pdf", index=True)

# Semantic search
results = fv.search("What is the refund policy?")
for r in results:
    print(f"{r.score:.2f}  {r.content[:80]}")

# Store a memory
fv.memory.add("User prefers metric units", ttl_seconds=86400 * 30)

# Usage stats
stats = fv.usage()
print(f"{stats['files']['count']} files · {stats['files']['storage_bytes']:,} bytes")
```

## API

### `FileVault(api_key, base_url="https://filevault.host")`

| Method | Description |
|---|---|
| `fv.search(query, *, type, file_id, metadata, limit)` | Semantic search |
| `fv.usage()` | Storage and activity metrics |
| `fv.set_webhook(url)` | Register webhook URL |
| `fv.get_webhook()` | Get current webhook URL |
| `fv.delete_webhook()` | Remove webhook |

### `fv.files`

| Method | Description |
|---|---|
| `fv.files.upload(file, *, name, index, metadata)` | Upload one file |
| `fv.files.upload_batch([(file, name), ...], *, index, metadata)` | Upload up to 10 |
| `fv.files.list(*, limit, cursor, indexed)` | List files (one page) |
| `fv.files.iter(*, indexed)` | Iterate all files (auto-paginated) |
| `fv.files.get(file_id)` | Single file metadata |
| `fv.files.index(file_id)` | Trigger indexing |
| `fv.files.delete(file_id)` | Delete file + embeddings |

### `fv.memory`

| Method | Description |
|---|---|
| `fv.memory.add(content, *, ttl_seconds)` | Store a memory |
| `fv.memory.list(*, limit, cursor)` | List memories (one page) |
| `fv.memory.iter()` | Iterate all memories (auto-paginated) |

## Requirements

Python 3.9+ · No third-party dependencies
