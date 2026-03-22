---
name: new-module
description: Scaffold a new Python module following project conventions. Pass the module name as an argument.
argument-hint: <module-name>
allowed-tools: Read, Write, Edit
---

Scaffold a new Python module named `$ARGUMENTS` following the project conventions:

1. Create `app/app/$ARGUMENTS.py` with:
   - Module docstring
   - Logger setup using colorlog (not print statements)
   - A starter function or class appropriate for the module name
   - No multi-line inline comments
   - No emojis

2. Create `app/tests/test_$ARGUMENTS.py` with:
   - At least one unit test for the happy path
   - At least one test for an error/edge case
   - pytest fixtures if needed

3. Show the user what was created and how to import the new module from `main.py`.

Use this logging setup in the new module:

```python
import logging
import colorlog

handler = colorlog.StreamHandler()
handler.setFormatter(colorlog.ColoredFormatter(
    '%(log_color)s%(cyan)s%(asctime)s %(levelname)s%(reset)s:  %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S',
    log_colors={
        'DEBUG': 'white',
        'INFO': 'cyan',
        'WARNING': 'yellow',
        'ERROR': 'red',
        'CRITICAL': 'bold_red',
    }
))
logger = logging.getLogger(__name__)
logger.addHandler(handler)
```
