# Module 3 · Q — putting the API itself in a box.
#
# Read it top to bottom: each line is one instruction, and each one makes a layer.
#
#   docker build -f 03_auth_deploy_ship/Dockerfile -t course-api .
#   docker run -p 8000:8000 course-api

# 1 · Start from a box that already has Python. "slim" = no compilers, no docs.
FROM python:3.12-slim

# 2 · Where our code will live inside the box.
WORKDIR /app

# 3 · Copy the dependency list FIRST, on its own.
#     Why not copy everything at once? Docker caches each layer. Your code changes
#     twenty times an hour; your dependencies change once a week. Copying them
#     separately means a code edit does not re-run the install.
COPY pyproject.toml uv.lock ./

# 4 · Install uv, then the dependencies. --frozen means "use the lock file exactly".
RUN pip install --no-cache-dir uv && uv sync --frozen --no-dev

# 5 · NOW copy the application code.
COPY 03_auth_deploy_ship/secure_api ./secure_api

# 6 · Documentation for humans. It does not actually publish the port -
#     that is what -p does on `docker run`.
EXPOSE 8000

# 7 · The command that runs when the container starts.
#     --host 0.0.0.0 is NOT optional: 127.0.0.1 means "this machine", and inside
#     a container that means the container itself, so nothing outside could reach it.
#     This is the single most common Docker mistake in a FastAPI app.
CMD ["uv", "run", "fastapi", "run", "secure_api/main.py", "--host", "0.0.0.0", "--port", "8000"]
