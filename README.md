#  Book Management API

A RESTful API built with **Node.js**, **Express**, and **MySQL**, providing endpoints for managing users, books, collections, and related resources.  
Includes **integration testing** using Jest and Supertest.

---

## Project Setup

### 1️⃣ Clone the repository
```bash
git clone https://github.com/nvbach91/project-book-management-app.git
cd project-book-management-app/book-api
```
2️⃣ Install dependencies
```
yarn install
```
3️⃣ Configure environment variables

Create a `.env` file inside the `book-api/` directory:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=book_management
PORT=3000
```

Create a separate `.env.test` file for automated testing:
```env.test
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=book_management_test
PORT=3000
```
<h2>Create the database</h2>
Use MySQL Workbench:

Create a new schema named (eg: `book_management`)

Import from the `seed/seed.sql` file located in the project

Execute the script to create all tables and sample data


<h2>Run the server</h2>

```server
yarn start
``` 
Expected output:

```
Server is running at http://localhost:3000
```
---
<h2>Run Tests</h2>
Integration tests use Jest and Supertest.

```
yarn test
```

<h2>Linting</h2>

Run ESLint to check for code style and syntax issues:

```
yarn eslint .
```

