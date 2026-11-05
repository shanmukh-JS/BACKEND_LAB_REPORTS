# Lab 3: REST API, query parameters, validation, debugging

**Name:** `SHANMUKH NAGANJAN KADALI` · **Registration number:** `252U1R9050` · **Section:** `CSE GEN AI -  2A , 304`

Backend Development Fundamentals · Year II Term II · Aurora · Faculty: Joel Prashanth D

## Live link

**`<PASTE YOUR PUBLIC URL HERE>`** (example: `https://your-app.onrender.com/books`)

> If the project cannot be deployed, replace the line above with the reason (for example: "Free hosting was unavailable") and rely on the Postman screenshots and `postman/` collection below, which cover every endpoint.

## How to run

Requirements: Node.js 18 or newer.

```bash
cd lab-03
npm install
cp .env.example .env        # Windows: copy .env.example .env
npm run seed                # optional: loads 25 sample books (also happens on start when the table is empty)
npm start                   # server on http://localhost:3000
```

Other commands: `npm run dev` (auto-restart on changes) and `npm test` (56 automated tests, uses an in-memory database).

**Environment variables** (see `.env.example`; the real `.env` is never committed):

| Variable | Meaning | Example |
| --- | --- | --- |
| `PORT` | Port the server listens on | `3000` |
| `DB_PATH` | SQLite database file (created automatically) | `./data/books.db` |
| `AUTO_SEED` | Insert sample books on start when the table is empty | `true` |

**Deploying (Render / Railway):** build command `npm install`, start command `npm start`; the platform sets `PORT` itself. Add `AUTO_SEED=true` so the free instance (whose disk is reset on restart) always has sample data.

## Endpoints

Endpoints are nouns (`/books`); the HTTP method says what to do.

| Method | Path | Description | Success | Failure |
| --- | --- | --- | --- | --- |
| GET | `/books` | List books with search, sort, price filter and pagination | 200 | 400 bad query |
| GET | `/books/:id` | Get one book | 200 | 400 bad id, 404 not found |
| POST | `/books` | Create a book (title, author, price) | 201 | 400 validation |
| PUT | `/books/:id` | Replace title, author and price of a book | 200 | 400 validation / bad id, 404 not found |
| DELETE | `/books/:id` | Delete a book | 200 | 400 bad id, 404 not found |
| GET | `/health` | Health check | 200 | |
| GET | `/` | API information | 200 | |

### Query parameters for `GET /books`

| Parameter | Meaning | Default | Rules |
| --- | --- | --- | --- |
| `search_q` | Partial, case-insensitive title match (`LIKE`) | none (no filter) | `%` and `_` are searched literally |
| `order_by` | Column to sort by | `id` | `id`, `title`, `author` or `price` (whitelist) |
| `order` | Sort direction | `ASC` | `ASC` or `DESC` (any case) |
| `limit` | Rows per page | `10` | integer 1 to 100 |
| `offset` | Rows to skip | `0` | integer >= 0 |
| `min_price` | Lowest price | none | number >= 0 |
| `max_price` | Highest price | none | number >= 0, not less than `min_price` |

When both prices are given the query uses `price BETWEEN ? AND ?`; with only one it uses `>=` or `<=`.
Example: `/books?search_q=sql&min_price=500&max_price=800&order_by=price&order=DESC&limit=5&offset=0`

### Request body for `POST` and `PUT`

```json
{ "title": "Clean Code", "author": "Robert C. Martin", "price": 799 }
```

`title` and `author` must be non-empty strings (max 200 characters); `price` must be a number >= 0 (a numeric string such as `"499"` is accepted). A missing field or a non-numeric price gives `400`.

### Response format

Every response is JSON in one consistent shape.

```jsonc
// success
{ "message": "Book created successfully", "data": { "id": 26, "title": "...", "author": "...", "price": 499 } }
// list (also has pagination)
{ "message": "Books fetched successfully", "data": [ ... ], "pagination": { "total": 25, "count": 10, "limit": 10, "offset": 0 } }
// every error
{ "message": "Validation failed: price must be a number" }
```

| Status | When |
| --- | --- |
| 200 OK | Read, update and delete succeeded |
| 201 Created | Book created (also sends a `Location: /books/:id` header) |
| 400 Bad Request | Invalid body, invalid query parameter, invalid id, malformed JSON |
| 404 Not Found | Valid id but no such book, or unknown route |
| 500 Internal Server Error | Unexpected server problem (details only in the server log) |

## Screenshots

### Search, sort, filters and pagination

![GET /books with default values](screenshots/02-get-books-default.png)
![Search with search_q](screenshots/03-search-q.png)
![Sorting by price descending](screenshots/04-sort-price-desc.png)
![Pagination with limit and offset](screenshots/05-pagination.png)
![Price range filter](screenshots/06-price-range.png)
![Combined search, price filter and sort](screenshots/07-combined-filters.png)

### Create, update, delete (success cases)

![POST returns 201](screenshots/08-post-201.png)
![PUT returns 200](screenshots/10-put-200.png)
![DELETE returns 200, then 404](screenshots/11-delete-200-then-404.png)

### Failure cases

![POST validation errors return 400](screenshots/09-post-400-validation.png)
![404 for missing record, 400 for bad id](screenshots/12-404-and-400-id.png)
![Invalid query parameters return 400](screenshots/13-query-errors-400.png)
![Malformed JSON and unknown route](screenshots/14-malformed-json-and-unknown-route.png)
![SQL injection text is treated as data](screenshots/15-sql-injection-safe.png)

### Database, tests and Postman

![Database view](screenshots/16-database-view.png)
![Automated tests (56 passing)](screenshots/17-automated-tests.png)
![Postman collection run (34 requests, 91 assertions)](screenshots/24-postman-collection-run.png)

### Debugging exercise

![Wrong import path](screenshots/18-debug-1-wrong-import-path.png)
![Import path fixed](screenshots/19-debug-1-fixed.png)
![EADDRINUSE port conflict](screenshots/20-debug-2-eaddrinuse.png)
![no such table](screenshots/21-debug-3-no-such-table.png)
![Missing await](screenshots/22-debug-4-missing-await.png)
![After all fixes](screenshots/23-debug-after-fix.png)

## Postman test list

Import `postman/Lab03_Books_API.postman_collection.json` into Postman and run it with the Collection Runner (server running on `http://localhost:3000`, sample data loaded).
It has 34 requests (12 success, 22 failure) with test scripts; the full table is in [`docs/POSTMAN_TESTS.md`](docs/POSTMAN_TESTS.md).

## Notes: problems faced and how I solved them

The full write-up with error messages is in [`docs/DEBUGGING.md`](docs/DEBUGGING.md). The broken project and the exact changes are in [`debugging/`](debugging/).

| # | Problem | Error seen | Cause | Fix |
| --- | --- | --- | --- | --- |
| 1 | Port conflict | `Error: listen EADDRINUSE: address already in use :::3000` | Another copy of the server was already using port 3000 | Stopped the old process (or used another `PORT`); `server.js` now prints a clear message |
| 2 | Wrong import path | `Error: Cannot find module './route/books'` | The folder is `routes`, not `route` | `require("./routes/books")` |
| 3 | Table-name typo | `SQLITE_ERROR: no such table: book` (500 response) | Query used `book`; the table is `books` | Corrected the table name in the SQL |
| 4 | Missing `await` | `200 OK` with `"data": {}`; 404 never returned | `db.get()` returns a Promise; without `await` the route used the Promise | Added `await` before `db.get(...)` |

Other things I learned while building it:

- **Whitelist for `order_by`.** A `?` placeholder can hold a value but not a column name, so `order_by` and `order` are checked against a fixed list before being placed in the SQL. All values (search text, prices, limit, offset, id) use `?` parameters.
- **`LIKE` wildcards.** `%` and `_` typed by the user are escaped (`ESCAPE '\'`), so `search_q=50%` searches for the literal text.
- **Sorting text.** SQLite sorts upper case before lower case by default, so `title` and `author` use `COLLATE NOCASE` to give a real A-Z order.
- **Stable pages.** Results are ordered by the chosen column, then by `id`, so rows never move between pages.
- **400 vs 404.** An id such as `abc` is bad input (400); a valid id that is not in the table is a missing record (404). The id format is checked before the database is touched.
- **Port conflicts on Express 5.** Express 5 passes a listen error to the callback instead of crashing, so `server.js` checks it there (and on the `error` event for Express 4).

## Project structure

```text
lab-03/
├── server.js              # start-up: .env, database, listen, port-conflict handling
├── app.js                 # Express app, JSON 404 and error handler
├── db.js                  # SQLite connection and table creation
├── seed.js                # sample data (npm run seed)
├── routes/books.js        # the /books endpoints
├── middleware/validate.js # body, id and query validation
├── utils/respond.js       # consistent response helpers
├── tests/books.test.js    # 56 automated tests
├── postman/               # Postman collection
├── docs/                  # Postman test list, debugging notes, viva answers
├── debugging/             # broken project + fixes.diff
├── screenshots/
├── .env.example
└── .gitignore
```

Viva preparation: [`docs/VIVA.md`](docs/VIVA.md).
