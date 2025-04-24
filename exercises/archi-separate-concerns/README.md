Architecture Understanding & Separation of Concerns Exercise

This archi-separate-component-front violates proper architecture principles by:
1. Mixing data fetching, business logic, and UI rendering all in one place
2. Performing multiple responsibilities within a single component
3. Lacking proper separation between API calls, data processing, and UI
4. Containing both data fetching and state updates for unrelated features

Your task: Refactor the archi-separate-component-front by:
1. Separating API calls into a dedicated service
2. Breaking down the UI into smaller, focused components
3. Properly separating business logic from presentation
4. Creating a proper architecture with clear separation of concerns

Be careful there could be a few mistakes in the code