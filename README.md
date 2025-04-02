# 2FA Broken Logic Penetration Testing Project

## Overview

This project builds an application with a vulnerable two-factor authentication (2FA) system, inspired by the [PortSwigger Web Security Lab: 2FA Broken Logic](https://portswigger.net/web-security/authentication/multi-factor/lab-2fa-broken-logic) and the example application at [auth-lab8.onrender.com](https://auth-lab8.onrender.com). The goal is to create a web application with flawed 2FA logic for educational purposes and to conduct penetration testing to identify and exploit the vulnerability.

The vulnerability in this application mirrors the lab's scenario: the 2FA process uses a `verify` parameter that can be manipulated to generate and brute-force a 2FA code for another user's account (e.g., `ahmed`), allowing unauthorized access.

## Project Purpose

- Build a web application with a 2FA system that has broken logic.
- Conduct penetration testing to demonstrate how the vulnerability can be exploited (e.g., using tools like Burp Suite).
- Educate developers and security enthusiasts about common 2FA implementation flaws.

## Prerequisites

- [Node.js](https://nodejs.org/) (v16 or higher recommended)
- [Bun](https://bun.sh/) (for running the application and scripts)
- [Burp Suite](https://portswigger.net/burp) (for penetration testing)
- A basic understanding of web security and penetration testing concepts

## Installation

1. **Clone the repository**:

   ```bash
   git clone <repository-url>
   cd 2fa-broken-logic
   ```

2. **Install dependencies**:
   Ensure you have Bun installed, then run:

   ```bash
   bun install
   ```

3. **Set up environment variables**:
   Create a `.env` file in the root directory and configure the necessary variables (e.g., email server settings for 2FA codes):
   ```plaintext
   PORT=3000
   SESSION_SECRET=your-secret-key
   EMAIL_USER=your-email@example.com
   EMAIL_PASS=your-email-password
   ```

## Dependencies

The project uses the following npm packages:

- `cookie-parser`: Parse cookies in HTTP requests
- `crypto`: Cryptographic functionality for secure operations
- `dotenv`: Load environment variables from a `.env` file
- `ejs`: Templating engine for rendering HTML
- `express`: Web framework for Node.js
- `express-rate-limit`: Rate limiting middleware to prevent abuse
- `express-session`: Session management for user authentication
- `nodemailer`: Send emails (e.g., 2FA codes)
- `nodemon`: Automatically restart the server during development
- `prettier`: Code formatting tool
- `sqlite3`: Lightweight database for storing user data

Install them using:

```bash
bun install
```

## Scripts

- **`start`**: Run the application in production mode with Bun:
  ```bash
  bun run start
  ```
- **`dev`**: Run the application in development mode with Nodemon (auto-restarts on changes):
  ```bash
  bun run dev
  ```
- **`format`**: Format the codebase using Prettier:
  ```bash
  bun run format
  ```

## Running the Application

1. Start the server in dev mode:
   ```bash
   bun run dev
   ```
2. Open your browser and navigate to `http://localhost:3000` (or the port specified in your `.env` file).

## Vulnerability Description

The application's 2FA system is intentionally flawed, similar to the PortSwigger lab:

- The `POST /login2` endpoint includes a `verify` parameter that determines which user's 2FA code is validated.
- By manipulating the `verify` parameter (e.g., setting it to `ahmed`), an attacker can generate a 2FA code for another user.
- The attacker can then brute-force the `mfa-code` parameter to bypass authentication and access the victim's account.

### Example Exploitation Steps

1. Log in with your own credentials (e.g., `sam:pa$$w0rd`).
2. Observe the `POST /login2` request and note the `verify` parameter.
3. Log out and send a `GET /login2?verify=ahmed` request to generate a 2FA code for `ahmed`.
4. Use Burp Intruder to brute-force the `mfa-code` parameter in the `POST /login2` request with `verify=ahmed`.
5. Once a valid code is found, access Ahmed's account.

## Penetration Testing

To test the vulnerability:

- Use Burp Suite to intercept and manipulate HTTP requests.
- Follow the steps outlined in the [PortSwigger lab solution](https://portswigger.net/web-security/authentication/multi-factor/lab-2fa-broken-logic#solution).
- Verify that you can access the victim's account (`ahmed`) without knowing their password.

## References

- [PortSwigger Lab: 2FA Broken Logic](https://portswigger.net/web-security/authentication/multi-factor/lab-2fa-broken-logic)
- [Example Application](https://auth-lab8.onrender.com)

## License

This project is for educational purposes only and is not licensed for production use.
