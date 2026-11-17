# Python Code Quality & Review Rules Catalog

This catalog outlines the core rules, patterns, and anti-patterns Alex inspects during Python code reviews.

---

## 1. Type Annotations & Static Typing (PEP 484 / PEP 585 / PEP 604)

### PY-TYPE-01: Comprehensive Function Signatures
- **Rule**: All public functions and methods must have full type annotations for parameters and return types.
- **Why**: Enhances IDE auto-completion, clarifies architectural contracts, and enables static validation via `mypy` or `pyright`.
- **Anti-Pattern**:
  ```python
  def fetch_user(user_id, active=True):
      ...
  ```
- **Remediation**:
  ```python
  def fetch_user(user_id: str, active: bool = True) -> User | None:
      ...
  ```

### PY-TYPE-02: Modern Type Hinting Syntax
- **Rule**: For Python 3.10+, prefer built-in generics and union operators (`list[str]`, `dict[str, Any]`, `int | None`) over importing `List`, `Dict`, `Optional`, or `Union` from `typing`.
- **Anti-Pattern**:
  ```python
  from typing import List, Optional, Union
  def process_items(items: List[str]) -> Optional[Union[int, float]]: ...
  ```
- **Remediation**:
  ```python
  def process_items(items: list[str]) -> int | float | None: ...
  ```

---

## 2. Idiomatic Style & PEP 8 (PY-STYLE)

### PY-STYLE-01: Mutable Default Arguments
- **Rule**: Never use mutable objects (lists, dictionaries, sets) as default argument values. Default values are evaluated once when the function is defined.
- **Anti-Pattern**:
  ```python
  def append_to_cache(key: str, data: list = []):
      data.append(key)
      return data
  ```
- **Remediation**:
  ```python
  def append_to_cache(key: str, data: list[str] | None = None) -> list[str]:
      if data is None:
          data = []
      data.append(key)
      return data
  ```

### PY-STYLE-02: Idiomatic Collections & Comprehensions
- **Rule**: Use list/dict/set comprehensions for transformations, but avoid overly nested or convoluted expressions that impede readability.
- **Anti-Pattern**:
  ```python
  squares = []
  for x in range(10):
      if x % 2 == 0:
          squares.append(x * x)
  ```
- **Remediation**:
  ```python
  squares = [x * x for x in range(10) if x % 2 == 0]
  ```

---

## 3. Resource Management & Context Managers (PY-RES)

### PY-RES-01: Deterministic Resource Cleanup
- **Rule**: All I/O resources (file handles, network sockets, database sessions, mutex locks) must be managed using `with` context managers.
- **Anti-Pattern**:
  ```python
  f = open("data.json", "r")
  content = f.read()
  f.close()
  ```
- **Remediation**:
  ```python
  with open("data.json", "r", encoding="utf-8") as f:
      content = f.read()
  ```

---

## 4. Robust Exception Handling (PY-ERR)

### PY-ERR-01: No Bare or Overly Broad Excepts
- **Rule**: Catch specific exceptions. Never use bare `except:` or catch `BaseException` without re-raising. Avoid silently swallowing errors (`except Exception: pass`).
- **Anti-Pattern**:
  ```python
  try:
      record = db.query(User).get(uid)
  except:
      pass
  ```
- **Remediation**:
  ```python
  try:
      record = db.query(User).get(uid)
  except DatabaseConnectionError as err:
      logger.error("Failed to query user %s: %s", uid, err)
      raise ServiceUnavailableError("User service temporarily offline") from err
  ```

---

## 5. Security & Secure Coding (PY-SEC)

### PY-SEC-01: Safe Execution & Deserialization
- **Rule**: Avoid `eval()`, `exec()`, and unconstrained `pickle.loads()`. When parsing YAML, always use `yaml.safe_load()` instead of `yaml.load()`.
- **Anti-Pattern**:
  ```python
  import yaml
  config = yaml.load(raw_data, Loader=yaml.Loader)
  ```
- **Remediation**:
  ```python
  import yaml
  config = yaml.safe_load(raw_data)
  ```

### PY-SEC-02: Subprocess Injection Prevention
- **Rule**: Never pass `shell=True` to `subprocess.run` or `subprocess.Popen` when interpolating dynamic user input. Pass commands as argument lists.
- **Anti-Pattern**:
  ```python
  subprocess.run(f"grep {pattern} {filename}", shell=True)
  ```
- **Remediation**:
  ```python
  subprocess.run(["grep", pattern, filename], check=True, capture_output=True)
  ```

---

## 6. Performance & Architecture (PY-PERF)

### PY-PERF-01: Generator Efficiency & Large Payloads
- **Rule**: Use generator expressions (`(x for x in ...)` or `yield`) when dealing with large sequences to prevent loading massive datasets into memory.
- **Anti-Pattern**:
  ```python
  total = sum([record["amount"] for record in large_stream])
  ```
- **Remediation**:
  ```python
  total = sum(record["amount"] for record in large_stream)
  ```

### PY-PERF-02: Modern Data Modeling
- **Rule**: Use `@dataclass(slots=True, frozen=True)` or Pydantic `BaseModel` for structured data entities instead of loose dictionaries or plain classes with boilerplate `__init__`.
- **Anti-Pattern**:
  ```python
  class Coordinates:
      def __init__(self, x, y):
          self.x = x
          self.y = y
  ```
- **Remediation**:
  ```python
  from dataclasses import dataclass

  @dataclass(slots=True, frozen=True)
  class Coordinates:
      x: float
      y: float
  ```
