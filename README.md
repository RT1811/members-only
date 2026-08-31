# Members Only

A server-rendered membership application built with **Node.js, Express, PostgreSQL, Passport.js, and EJS**.

The project explores authentication, session management, authorization, relational database design, and role-based access control. Users can create accounts, log in, post messages, become members using a secret passcode, and receive different permissions depending on their role.

Built as part of **The Odin Project's Node.js curriculum**.

## Features

### Authentication

* User registration
* Server-side signup validation
* Password confirmation validation
* Password hashing with bcrypt
* Local username/password authentication with Passport.js
* Persistent login sessions with `express-session`
* User serialization and deserialization
* Logout functionality

### Membership and Authorization

The application distinguishes between different levels of access:

| User           | Create Messages | View Author & Date | Delete Messages |
| -------------- | --------------: | -----------------: | --------------: |
| Guest          |               ❌ |                  ❌ |               ❌ |
| Logged-in User |               ✅ |                  ❌ |               ❌ |
| Member         |               ✅ |                  ✅ |               ❌ |
| Admin          |               ✅ |                  ✅ |               ✅ |

Logged-in users can enter a secret membership passcode to become members.

Authorization is enforced on the server rather than relying only on hidden UI controls.

### Messages

Authenticated users can:

* Create messages
* Provide a title and message body
* Associate messages with their user account

Messages are displayed on the homepage in reverse chronological order.

Members and administrators can also see:

* The author of each message
* The creation date

Administrators can delete messages.

## Tech Stack

### Backend

* Node.js
* Express
* Passport.js
* Passport LocalStrategy
* express-session
* bcryptjs
* express-validator

### Database

* PostgreSQL
* `pg` Node.js driver
* Neon PostgreSQL for the deployed database

### Views

* EJS
* Server-side rendering

### Deployment

* Render — Node/Express application
* Neon — PostgreSQL database

## Application Architecture

```text
Browser
   │
   ▼
Express Routes
   │
   ├── Authentication
   │      └── Passport.js
   │
   ├── Authorization
   │      ├── Logged-in user
   │      ├── Member
   │      └── Admin
   │
   ▼
Database Queries
   │
   ▼
PostgreSQL
```

Authentication sessions follow this general flow:

```text
Login
  │
  ▼
Passport LocalStrategy
  │
  ├── Find user in PostgreSQL
  │
  └── Compare password using bcrypt
  │
  ▼
serializeUser()
  │
  ▼
User ID stored in session
  │
  ▼
Future request
  │
  ▼
deserializeUser()
  │
  ▼
Full user loaded from PostgreSQL
  │
  ▼
req.user
```

## Database Relationships

The application uses two primary entities:

```text
User
 │
 │ one-to-many
 ▼
Message
```

Each message stores the ID of its author as a foreign key.

Conceptually:

```text
users
├── id
├── first_name
├── last_name
├── username
├── password
├── membership_status
└── is_admin

messages
├── id
├── title
├── text
├── user_id ──────────► users.id
└── created_at
```

Message queries join the `messages` and `users` tables when author information is needed.

## Security Concepts Used

### Password Hashing

Passwords are never stored directly.

Before a user is inserted into PostgreSQL:

```text
plain-text password
        │
        ▼
      bcrypt
        │
        ▼
password hash
        │
        ▼
   PostgreSQL
```

During login, bcrypt compares the submitted password against the stored hash.

### Parameterized Queries

Database operations use parameterized PostgreSQL queries rather than inserting user-controlled values directly into SQL strings.

Example:

```js
await pool.query(
  "DELETE FROM public.messages WHERE id = $1",
  [id]
);
```

This keeps SQL structure separate from supplied values and helps protect against SQL injection.

### Server-Side Authorization

Restricted operations are validated by the server.

For example, deleting a message requires the authenticated user to have administrator privileges. Hiding the delete button in the UI is not treated as sufficient authorization.

## Local Setup

### 1. Clone the repository

```bash
git clone https://github.com/RT1811/members-only.git
cd members-only
```

### 2. Install dependencies

```bash
npm install
```

### 3. Create a PostgreSQL database

Create PostgreSQL tables for the `users` and `messages` entities described above.

The `messages.user_id` field should reference `users.id`.

### 4. Configure environment variables

Create a `.env` file in the project root:

```env
DATABASE_URL=your_postgresql_connection_string
SESSION_SECRET=your_session_secret
MEMBER_PASSCODE=your_membership_passcode
```

Do not commit `.env` or expose these values publicly.

A random session secret can be generated with:

```bash
openssl rand -base64 32
```

### 5. Start the application

```bash
npm start
```

The application will use port `3000` locally unless a `PORT` environment variable is provided.

## Project Structure

```text
members-only/
├── config/
│   └── passport.js
│
├── db/
│   ├── pool.js
│   └── queries.js
│
├── routes/
│   ├── auth.js
│   ├── index.js
│   └── messages.js
│
├── views/
│   ├── messages/
│   ├── index.ejs
│   ├── sign-up-form.ejs
│   ├── log-in-form.ejs
│   └── join-form.ejs
│
├── app.js
├── package.json
└── package-lock.json
```

## What I Learned

This project was primarily an exercise in backend authentication and authorization.

Key concepts practiced include:

* Hashing passwords instead of storing them directly
* Authenticating users with Passport LocalStrategy
* Understanding the difference between authentication and authorization
* Creating and maintaining login sessions
* Serializing a user ID into a session
* Deserializing users on subsequent requests
* Using `req.user` to represent the authenticated user
* Protecting routes based on authentication state
* Implementing member and administrator permissions
* Modeling one-to-many relationships in PostgreSQL
* Joining related database tables
* Writing parameterized SQL queries
* Validating user input on the server
* Separating application servers from database servers
* Deploying an Express application and PostgreSQL database as separate services
* Handling differences between local and hosted PostgreSQL environments

One particularly useful deployment lesson was that database objects have schema-qualified names such as:

```text
public.users
public.messages
```

Explicit schema qualification prevents queries from relying on environment-specific PostgreSQL `search_path` configuration.

## Future Improvements

This project intentionally stays close to the scope of The Odin Project assignment. Possible improvements for a more production-oriented version could include:

* Improved form and authentication error feedback
* More extensive validation
* Persistent production session storage
* CSRF protection
* More comprehensive automated tests
* Improved UI and responsive styling
* More sophisticated administrator management
* Database migrations

The focus of this version is understanding the underlying authentication, authorization, session, and database concepts rather than production-level feature completeness.

## Acknowledgements

Built as part of **The Odin Project — Full Stack JavaScript / Node.js curriculum**.
