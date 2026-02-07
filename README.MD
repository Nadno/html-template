# HTML Template Engine (Legacy Solution)

A lightweight, zero-dependency JavaScript template engine designed to decouple Frontend rendering from Legacy Backend systems.

## 📖 Context & Motivation

**The Engineering Challenge:**
This library was developed to solve a critical architectural bottleneck in a legacy environment (**ASP Classic / VBScript**). The system originally relied on heavy server-side string concatenation to render HTML, which caused:
- **High Coupling:** Frontend changes required Backend deployments.
- **Maintenance Nightmares:** Developers had to navigate through mixed spaghetti code (VBScript + HTML + JS).
- **Security Risks:** Lack of proper output sanitization leading to potential XSS vulnerabilities.

**The Solution:**
Without the ability to introduce modern build tools (Webpack/Vite) or frameworks (React/Vue) due to infrastructure constraints, I engineered this engine to:
1.  **Decouple Architecture:** Move rendering logic entirely to the Client-side, treating the Backend purely as a data API.
2.  **Enforce Security:** Implemented a "secure-by-default" strategy. HTML injection is blocked unless explicitly whitelisted via `acceptHTML`.
3.  **Improve DX:** Standardized component creation, reducing the complexity of maintaining the legacy codebase.

---

## 🚀 Key Features

- **Zero Dependencies:** Pure JavaScript (ES5+), compatible with virtually any browser.
- **Secure by Default:** Uses `insertAdjacentText` by default to prevent XSS.
- **DOM-based Rendering:** Utilizes `cloneNode` and `DocumentFragment` for better performance compared to `innerHTML` replacement.
- **Strict Error Handling:** Throws descriptive errors if data keys are missing or types are invalid, aiding debugging in complex systems.

## 📦 Installation

Simply include the script in your HTML file. No build step required.

```html
<script src="path/to/Template.js"></script>
```
## 🛠 Usage guide

### 1. Creating the Template (HTML)
You can use a `<script type="text/html">` or a standard `<template>` tag.

* Use `data-content="key"` to bind text to an element.
* Use `data-attrs` to list attributes that need dynamic values (e.g., `id`, `href`, `src`).
* Use `{{key}}` syntax inside attributes.

```html
<script type="text/html" id="card-template">
  <div class="card" id="card-{{id}}" data-attrs="id;class">
    <div class="card-header">
      <h3 class="title" data-content="title"></h3>
    </div>
    <div class="card-body" data-content="description"></div>
    <div class="card-footer">
      <a href="{{link}}" class="btn" data-attrs="href">Read More</a>
    </div>
  </div>
</script>
```

### 💻 Rendering with JavaScript
Initialize the Template class with your selector and call createElement passing the data object.
```js
// 1. Initialize
const myTemplate = new Template('#card-template');

// 2. Define Data
const data = {
  id: 101,
  title: 'Architecture Decision',
  description: 'Moving from Server-Side Rendering to Client-Side Templates.',
  link: '/article/101'
};

// 3. Render and Append
try {
  const element = myTemplate.createElement(data);
  document.body.appendChild(element);
} catch (error) {
  console.error('Rendering failed:', error.message);
}
```

### 🔒 Security & XSS Prevention
By default, the engine escapes all HTML content. This is a design choice to prevent Cross-Site Scripting (XSS) when handling user-generated content from the legacy database.

To render raw HTML (e.g., rich text content), you must explicitly opt-in:

```js
const dangerousData = {
  content: '<strong>This is bold</strong> and <script>alert("hack")</script>'
};

// ❌ Safe Mode (Default)
// Result: "<strong>This is bold</strong>..." (rendered as text)
myTemplate.createElement(dangerousData);

// ✅ Unsafe Mode (Explicit Opt-in)
// Result: Bold text is rendered. *Be careful with inputs.*
myTemplate.createElement(dangerousData, { acceptHTML: true });
```

### ⚙️ API Reference

`new Template(selectorOrElement)`
- selectorOrElement: A CSS selector string (e.g., '#my-template') or a direct HTMLElement.
`.createElement(data, options)` Returns a DocumentFragment containing the rendered element.
- data: An object containing the keys referenced in data-content and {{}}.
- options:
  - acceptHTML (Boolean): Defaults to false. If true, allows parsing strings as HTML using insertAdjacentHTML.

## 📝 License
Distributed under the MIT License.
