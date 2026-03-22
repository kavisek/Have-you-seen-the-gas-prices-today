---
name: format
description: Format the codebase with black and isort using uv. Use when the user wants to format or lint code.
allowed-tools: Bash
---

Format all Python code in the `app/` directory:

```bash
cd app && uv run black . && isort .
```

Report which files were reformatted (if any), and confirm the run completed successfully.
