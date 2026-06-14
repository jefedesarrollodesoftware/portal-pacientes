# HTML Rules

Use semantic HTML.

Preferred:

<header>
<main>
<section>
<article>
<nav>
<footer>

Avoid:

<div> for everything

---

Every form field must have:

- label
- id
- name

Example:

<label for="email">
  Correo
</label>

<input
  id="email"
  name="email"
/>

---

Use:

@if
@for
@switch

Never:

*ngIf
*ngFor
*ngSwitch

---

Never place logic in templates.

Forbidden:

{{ users.filter(x => x.active).length }}

Use computed().