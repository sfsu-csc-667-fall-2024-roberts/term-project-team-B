# Tank Game Project - Week 3 Milestone

## Links

1. [GitHub Repository](https://github.com/sfsu-csc-667-fall-2024-roberts/term-project-team06)
2. [GitHub Project Board]
--------------------------------------------------------------------------------------------------------
3. This week, we began the setup of our front-end development environment, laying the work for handling client-side game logic. We followed along with what is needed in the Milestone 3 document. 

- Frontend Initialization: We established the src/client directory structure, organizing our code for better maintenance and future scalability.
- Webpack Setup: Configured webpack to bundle our TypeScript code efficiently. This will simplify our development workflow by automating file aggregation into a single, manageable main.js.
- Ensured TypeScript compatibility for our front-end modules, making the codebase robust and easier to debug.
- Added a simple script in main.ts that logs to the console, verifying our setup works as intended.
- Integrated EJS templates with LiveReload to automatically refresh our browser when changes are made.
- Configured dotenv to differentiate between development and production environments, setting up a cleaner and more flexible project structure.

Meetings:
Our team has scheduled another in-person meeting to review our front-end implementation and discuss game logic requirements.

Milestones Assigned for the Week
Frontend Setup:

[] Ensure webpack is properly configured to handle TypeScript and bundle client-side code.
[] Confirm that main.ts and other modules load correctly using the bundled main.js.

Notes for the meeting: 

EJS Template Integration:
[] Verify that the templates render successfully with the new main.js script.
[] Add basic placeholders for upcoming game features, such as tank movements and combat functionality.
[] Update scripts in package.json to use concurrently for parallel process handling.
[] Test and validate the development environment setup, ensuring seamless code changes and live server updates.

Notes for the Team (Important!!!):
* Remember to focus on front-end functionalities, including modular TypeScript code for game mechanics.
* Plan and implement routes for all wireframe pages:
* Unauthenticated landing page
* Authenticated landing page (to house the game list and global chat)
* Login and registration pages
* Game lobby and main game page
