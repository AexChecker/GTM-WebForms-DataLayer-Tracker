# GTM-WebForms-DataLayer-Tracker

A lightweight jQuery-based script that automatically tracks user interactions with web forms and pushes events to the Google Tag Manager (GTM) `dataLayer`.

## ✅ Features

- Tracks form starts, field interactions, and form submissions
- Captures field values and interaction counts
- Works with dynamically inserted forms (MutationObserver)
- Adds `path` and `timestamp` metadata to every event
- Designed for plug-and-play integration with GTM

## 📦 Installation

1. Include the script on your site:
   ```html
   <script src="path/to/gtm-form-tracker.js"></script>
   ```

2. Or paste the full script inside a **Custom HTML Tag** in GTM.

3. Ensure jQuery is loaded on the page (version 3.x or compatible).

## 📊 Events Pushed to `dataLayer`

### `form_start`
Triggered when a user starts interacting with a form (first field touched).

```js
{
  event: 'form_start',
  path: '/contact',
  timestamp: '2025-09-10T15:00:00.000Z'
}
```

### `form_field_interaction`
Triggered on every change to a form field.

```js
{
  event: 'form_field_interaction',
  field: 'email',
  value: 'user@example.com',
  count: 1,
  path: '/contact',
  timestamp: '2025-09-10T15:00:01.000Z'
}
```

### `form_submit`
Triggered when a form is submitted.

```js
{
  event: 'form_submit',
  data: {
    name: 'John',
    email: 'john@example.com',
    agree: 'on'
  },
  path: '/contact',
  timestamp: '2025-09-10T15:00:10.000Z'
}
```

## 🔍 Customization

- Modify the list of tracked elements (`input`, `textarea`, `select`) inside the script if needed.
- Extend the event payloads with custom logic before sending to GTM.

## 📂 Repository Structure

```
/src   - Source JavaScript file
/dist  - Optional minified production build
```

## 📄 License

MIT – free for personal and commercial use.
