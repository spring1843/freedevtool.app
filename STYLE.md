# Style Guide

## User Interface and Experience

We strive to:
* Be minimal, do more with less
* Pick good defaults
* Allow meaningful customization
* Do similar things similarly
* Save advanced user's time
* React quickly to user

### Tools

* Tools must have a default value
* Each tool must have a primary action button that processes the user's input.
* Allow uploading data to input, downloading and copying the output
* Allow clearing the input and resetting the input to the default value
* An "Auto-update" checkbox, enabled by default, should be placed near the main action button. When checked, any change to the input automatically triggers the main action.
* Tools should automatically process their default input upon launch. The exception is for tools that produce sound or request browser permissions, which should require user interaction to start.
* For tools with a text input area, the keyboard focus should be set to that area on launch.
* Tools should be keyboard-friendly. Use standard keys like `Enter`, `Space`, and `Escape` for common actions like start, pause, and stop.
* Provide immediate feedback for user actions with a toast notification. This confirms that the action was registered. Toasts can be disabled globally.
* Do not request elevated permissions (e.g., camera access) on launch. Prompt for permissions only when the user explicitly tries to use the feature.
* Updating tools causes changes in the URL of the application, this allows users to share URLs with others and be able to see the same things.

### Buttons

* Buttons should have a tooltip explaining what the button does
* Buttons that do the same thing should look identical in all tools. e.g. a button that copies to clipboard should look exactly the same in every tool

### Menus

* Menus must be collapsible to save space
* Menus must be keyboard friendly allowing efficient navigation by advanced users

## Code Level

### Linters

*   Run all linters with `make lint`.
*   We use ESLint for TypeScript.

### Formatters

*   Format all applicable files with `make format`.
