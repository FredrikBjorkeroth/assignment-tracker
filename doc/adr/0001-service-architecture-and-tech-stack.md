# 1. Service Architecture and Tech Stack

Date: 2026-09-22

## Status

Accepted

## Context

This service tracks career development within a consulting job: past assignments and potential
future ones, regardless of whether an application was ever made. For each opportunity it records
a link to the job posting, metadata such as requested technologies, and personal 1–5 scores for
both skill match and interest. The data needs to be entered easily, stored durably, and visualised
so patterns in skills and interests can be reviewed over time.

## Decision

The service is built as two parts:

- **Backend**: Spring Boot 3.x on Java 21, built with Gradle (Kotlin DSL). Persistence uses
  Spring Data JPA with Hibernate, backed by a local SQLite file via the `sqlite-jdbc` driver and
  the `hibernate-community-dialects` SQLite dialect. The backend exposes a REST API for reading
  and creating entries.
- **Frontend**: A React single-page app, written in TypeScript and scaffolded with Vite. It
  visualises stored entries and provides a form for adding new ones, consuming the backend's REST
  API.

Java and Node toolchain versions are managed with `mise`, pinned per-project via a `mise.toml` in
the repository root rather than installed globally.

The database is local SQLite for now. A future migration to an AWS-hosted store (e.g. RDS or
DynamoDB) is planned once the service is otherwise stable.

## Consequences

- Choosing Spring Data JPA over hand-written JDBC couples the data layer to Hibernate's ORM
  semantics. This is acceptable now but should be revisited in a dedicated ADR when the AWS
  migration is designed, since a document-oriented store like DynamoDB would not fit the same
  entity-mapping model.
- Per-project toolchain pinning via `mise` means running the backend or frontend outside this
  repo requires no global Java/Node install, at the cost of each new project needing its own
  `mise.toml`.
