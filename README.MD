# HTML Template Engine (Advanced Legacy Solution)

A robust, pure JavaScript rendering engine designed to bring component-like behavior and form handling to legacy environments (ASP Classic / Vanilla JS).

## 📖 Architecture & Pattern

Unlike simple string replacers, this engine works by **DOM Manipulation**. It treats HTML elements as blueprints, parses custom directives (`item-*`), and handles form state intelligently.

It was engineered to solve:
1.  **Form Binding:** Automatically handles `value`, `checked`, and `selected` states for inputs.
2.  **DOM Placement:** Controls exactly where elements are injected (`prepend`, `append`, `replace`).
3.  **Clean Syntax:** Uses HTML5-compliant attributes (`item-content`, `item-src`) instead of obscure configuration strings.

## 🚀 Features

- **Smart Form Handling:** Detects checkboxes/radios vs. text inputs automatically.
- **Placement Strategy:** Supports `prepend` (for feeds/logs) and `replace-container` (for swapping skeletons with content).
- **Directives System:**
    - `item-content="key"`: Injects text/HTML.
    - `item-value="key"`: Binds form values.
    - `item-[attr]="{{key}}"`: Sets any attribute (e.g., `item-href`, `item-src`).
- **Memory Efficient:** Includes `Template.once()` to consume and cleanup templates from the DOM.

## 🛠 Usage Guide

### 1. The Template (HTML)
Use standard HTML with `item-*` attributes.

```html
<script type="text/html" id="task-template">
  <div class="task-card" item-class="task-{{status}}">
    
    <div class="header">
        <h3 item-content="title"></h3>
        <input type="checkbox" item-value="isCompleted">
    </div>

    <a item-href="/tasks/{{id}}" class="btn">View Details</a>
  </div>
</script>

<div id="tasks-container"></div>
```

### 2. The Logic (Javascript)

```js
// 1. Initialize
const taskTemplate = new Template('#task-template');

// 2. Data Source
const taskData = {
  id: 404,
  title: 'Refactor Legacy Module',
  status: 'pending',
  isCompleted: false // Automatically unchecks the checkbox
};

// 3. Render
// The 'render' method handles the container injection automatically
taskTemplate.render('#tasks-container', taskData, {
  prepend: true // Adds to the top of the list
});
```

## ⚙️ API Reference

`item-` Directives
The engine scans for any attribute starting with `item-`.
- `item-content="key"`: Sets the innerHTML or innerText.
- `item-value="key"`:
  - For `checkbox`/`radio`: Sets checked property (expects boolean).
  - For `input`/`textarea`: Sets value property.
- `item-any="{{key}}"`: Sets any attribute (e.g., `item-id`, `item-src`). The `item-*` prefix is stripped during rendering.

`Template.render(container, data, options)`
Renders the data directly into a container.
- `container`: Selector or HTMLElement.
- `data`: Object or Array of Objects.
- `options`:
  - `prepend`: If `true`, adds as first child. (Default: append).
  - `replace`: If `true`, replaces the container itself (useful for components).
  - `acceptHTML`: Allow HTML parsing (Security Opt-in).

`Template.once(selector)`
Static helper for one-off templates. Finds the element, removes it from DOM (cleanup), and returns a Template instance.

```js
// Quick usage for single-use templates
Template.once('#modal-template').render(document.body, data);
```

## ✅ Testing & Reliability

Since this engine was deployed in critical legacy systems, reliability was paramount. The library is fully covered by unit tests using **Jest** and **JSDOM** to ensure:
- Correct DOM manipulation (Prepend/Append/Replace strategies).
- Security constraints (HTML injection prevention).
- State consistency in Form Inputs.

## 📝 License
MIT License.
