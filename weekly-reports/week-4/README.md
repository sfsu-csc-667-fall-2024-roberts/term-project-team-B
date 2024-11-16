# Tank Game Project - Week 4 Milestone

## Links

1. [GitHub Repository](https://github.com/sfsu-csc-667-fall-2024-roberts/term-project-team-B)
2. [GitHub Project Board](https://github.com/orgs/sfsu-csc-667-fall-2024-roberts/projects/14)
--------------------------------------------------------------------------------------------------------

Authentication Setup Progress:
This week, we focused on implementing user authentication for our project. The main tasks included modularizing the server logic for maintainability and setting up user registration and login functionality. Here's a detailed breakdown:

Server Configuration Updates:

1. Created a manifest file in src/server/routes to streamline route imports in index.ts.
2. Moved live reload setup into src/server/config/livereload.ts, allowing dynamic reloading during development.
3. Designed and implemented register and login views using EJS templates, ensuring they meet project requirements for user authentication.
4. Created routes to render the forms (/auth/register and /auth/login) and tested them for functionality.


[] Add user management capabilities with functions to register users (using bcrypt for password encryption) and validate login credentials.
[] Organized SQL queries into dedicated files for clarity and reusability.

1. Configured session handling with express-session and connect-pg-simple to maintain user authentication state.
2. Set up flash messages for user feedback during authentication.

Developed an authentication middleware to restrict access to authenticated pages, enhancing security.

[] Complete registration and login functionality with error handling and feedback mechanisms.
[] Finalize and validate the database schema for storing user credentials securely.
[] Implement logout functionality and test session cleanup.

Notes:

[] Verify that the authentication middleware effectively restricts access to protected routes.
[] Focus on improving the user experience for registration and login flows, including handling common errors gracefully.
[] Prepare for the next milestone by outlining plans for integrating authentication with other project features.
