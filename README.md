<div align="center">
<img src="app/assets/logo-gradient.svg" width="200" />
<h1><a target="_blank" href="https://loan-wolf.r7.cx">LOAN WOLF</a></h1>

### Track loan payments like you're on the hunt!

https://loan-wolf.r7.cx

## About

Loan Wolf is a simple loan tracker that allows you to create loans and manage payments. It's built with [Remix](https://remix.run), [Prisma](https://prisma.io), and [Mantine](https://mantine.dev).

Create a shareable loan that only you can manage with basic password protection.

![](docs/demo.gif)

</div>

### Running Loan Wolf

#### Docker

To run the application yourself, I recommend using Docker:

```sh
docker run -d -p 3000:3000 ghcr.io/ryan-willis/loan-wolf:latest
```

Then visit [http://localhost:3000](http://localhost:3000) in your browser.

#### Docker Compose

You can also use Docker Compose (if you've checked out the repo):

```sh
docker-compose up -d
```

Here's a minimal configuration for `docker-compose.yml`:

```yaml
services:
  loan-wolf:
    image: ghcr.io/ryan-willis/loan-wolf:latest
    ports:
      - 3000:3000
```

The SQLite database will be stored in a volume at `/data/loan-wolf` within the container so data will persist between container restarts.
You can add your own volume to the `loan-wolf` service to persist the data on the host machine:

```sh
docker run -d -p 3000:3000 -v ~/.loan-wolf:/data/loan-wolf ghcr.io/ryan-willis/loan-wolf:latest
```


```yaml
volumes:
  loan_wolf:
services:
  loan-wolf:
    image: ghcr.io/ryan-willis/loan-wolf:latest
    ports:
      - 3000:3000
    volumes:
      - loan_wolf:/data/loan-wolf
```

### Environment Variables

If any of the `_SECRET` environment variables are not specified, randomly generated values will be placed in the `/data/loan-wolf` directory when the container is first run. (If you're running the built application locally, these files will be placed in the operating system's temporary directory.)

- `SESSION_SECRET`
  - A secure string for signing session cookies.
- `PASSWORD_SECRET`
  - A secure string for hashing passwords in the database (uses `argon2` under the hood).
- `DATABASE_URL`
  - The connection string for the SQLite database (defaults to `file:/data/loan-wolf/sqlite3.db`).

## Local Development

Run the Vite dev server (full stack):

```sh
npm run dev
```
