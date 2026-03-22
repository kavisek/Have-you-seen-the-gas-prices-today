---
name: test
description: Run the test suite with coverage using uv. Use when the user wants to run tests or check test coverage.
allowed-tools: Bash
---

Run the project tests from the `app/` directory using uv:

```bash
cd app && uv run pytest --cov=./tests --black -rAP -s -vvv
```

Report the results clearly:
- How many tests passed / failed
- Coverage percentage
- Any failures with the relevant error output
