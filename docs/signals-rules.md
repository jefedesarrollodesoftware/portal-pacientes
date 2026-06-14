# Signals Rules

Use:

signal()
computed()
effect()

State management must use signals.

Avoid:

BehaviorSubject
ReplaySubject

unless required by third-party libraries.

---

Computed values must replace template calculations.

Effects only for side effects.

Never use effect for business logic.