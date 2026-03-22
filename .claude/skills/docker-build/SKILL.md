---
name: docker-build
description: Build and optionally run the Docker image for this project. Use when the user wants to build or test the Docker container.
allowed-tools: Bash
---

Build the Docker image from the `app/` directory:

```bash
cd app && docker build -t gcr.io/kavi-dummy-project-123/template .
```

If $ARGUMENTS contains "run", also run the container after building:

```bash
docker run -it --name template gcr.io/kavi-dummy-project-123/template
```

If $ARGUMENTS contains "test", run tests inside the container:

```bash
docker run --rm template-test pytest --cov=app --cov-report=term-missing -v
```

Report the build output and any errors clearly.
