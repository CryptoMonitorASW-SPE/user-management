# User Management Service

This project implements a user management service for handling user creation, profile management, wallet transactions, and watchlist functions using a hexagonal architecture. The application exposes RESTful endpoints secured with JSON Web Tokens (JWT).

## Table of Contents

- [Features](#features)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [Building the Project](#building-the-project)
- [Running the Application](#running-the-application)
- [Testing](#testing)
- [Docker](#docker)
- [CI/CD](#cicd)
  - [Automatic Releases](#automatic-releases)
  - [CI/CD for Docker](#cicd-for-docker)
  - [Code Quality and Testing](#code-quality-and-testing)
- [Code Quality](#code-quality)
  - [ESLint & Prettier](#eslint--prettier)
  - [Commitlint & Husky](#commitlint--husky)
- [License](#license)

## Features

- **User Creation**: Register new users along with a wallet and watchlist.
- **Profile Management**: Create, update, and retrieve user profiles.
- **Wallet Transactions**: Add and remove transactions within user wallets.
- **Watchlist Management**: Maintain a list of favorite cryptocurrencies.
- **JWT Authentication**: Secure endpoints using JWT tokens.
- **Hexagonal Architecture**: Clean separation between Domain, Application, and Infrastructure layers.
- **Automated Testing**: Unit and integration tests to ensure high quality code.

## Architecture

The project follows a hexagonal architecture:

- **Domain Layer**: Contains the core models (e.g., User, Profile, Wallet, Transaction, Watchlist).
- **Application Layer**: Implements business logic through services such as `UserManagementService`.
- **Infrastructure Adapters**: Provide REST API endpoints (`UserAdapter`, `WalletAdapter`, `WatchlistAdapter`), database connectivity with MongoDB (`MongoUserRepository`), and JWT authentication (`AuthServiceImpl`).

## Getting Started

### Clone the Repository

```bash
git clone git@github.com:CryptoMonitorASW-SPE/user-management.git
cd user-management
```

## Building the Project
This project uses Gradle and Node.js. To build the project, run the following commands:

Install npm dependencies for both the root and app directories:
`./gradlew npmCiAll`

Build the project:
`./gradlew build`

## Running the Application

After building, start the application with:

`./gradlew start`

The server runs on port 3000 by default and exposes the following endpoints:

- **POST /users**: Create a new user.
- **GET /users/profile**: Retrieve the authenticated user's profile.
- **PUT /users/profile**: Update the authenticated user's profile.
- **GET /wallet**: Fetch the wallet details.
- **POST /wallet/transaction**: Add a wallet transaction.
- **DELETE /wallet/transaction/:transactionId**: Remove a wallet transaction.
- **GET /watchlist**: Retrieve the user's watchlist.
- **POST /watchlist**: Add an item to the watchlist.
- **DELETE /watchlist/:itemId**: Remove an item from the watchlist.

## Testing

Unit and integration tests are implemented using Mocha, Chai, Sinon, and Supertest.

To execute the tests run:

```bash
cd app/
npm run test
```

Test reports are generated under the app/reports directory.

## Docker
A Dockerfile is included to build an image of the service. To build using Docker:

Build the Docker image:
```docker build -t user-management .```

## CI/CD

### Automatic Releases

Changes pushed to the main branch automatically trigger a release process that builds the project and creates a new release.

### CI/CD for Docker

Each release builds a Docker image that is pushed to GitHub Container Registry. The image is tagged with both `latest` and the release tag.

### Code Quality and Testing

For every pull request, the CI workflow:

-   Runs ESLint to check for code quality.
-   Executes the test suite to ensure all tests pass.

### Code Quality

ESLint and Prettier enforce a consistent code style. Lint the code by running:

```bash
cd app/
npm run eslint
```

### Commitlint & Husky
Commit messages are standardized using Commitlint. Husky ensures linting and tests run before commits.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)