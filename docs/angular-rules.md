# Angular Rules

Use Angular 17+ features.

## Components

All new components must be:

- standalone: true
- OnPush change detection
- signal-based inputs and outputs

## RxJS

Use signals instead of:

- BehaviorSubject (for state)
- async pipe with NgIf
- @Input/@Output decorators

Only use RxJS for:

- HTTP calls
- form valueChanges
- route params

Use DestroyRef + takeUntilDestroyed.

Never use ngOnDestroy for cleanup.

## Control Flow

Use new control flow:

@if
@for
@switch

Never use:

*ngIf
*ngFor
*ngSwitch

## Forms

Use typed Reactive Forms only.

Never use ngModel.

## Dependency Injection

Use inject() function.

Avoid constructor injection.

## State

Use signals + computed.

Store data in services with providedIn: 'root'.
