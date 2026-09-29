# 📚 Library Management API

A modern RESTful API for managing library books, authors, categories, and borrowings. Built with performance, scalability, and clean architecture in mind.

---

## 🌟 Overview

The **Library Management API** provides core backend functionalities to support library cataloging, search, member records, and book issuing systems. 

- **Data Source:** Seeded using data harvested from the [Open Library Data Retrieval and Normalization](https://github.com/ameerajamaludin/openlibrary-data-retrieval-and-normalization) pipeline, curated and optimized down to a representative subset of **2,109 book records** for local development and testing.

---

## 🚀 Features & Development Roadmap

Development for this project follows the plan outlined in [`docs/development-roadmap.md`](./docs/development-roadmap.md).

### Key Highlights
- 📖 **Catalog Management**: CRUD operations for books, authors, genres, and publishers.
- 🔍 **Search & Filtering**: Filter books by author, category, ISBN, and availability status.
- 🔄 **Borrowing & Returns**: Lifecycle management for book loans, due dates, and renewals.
- 👤 **User & Access Management**: Role-based access control (Admin, Librarian, Member).
- 🗄️ **Seeded Environment**: Pre-populated database with 2,109 normalized Open Library entries.

---

## 🛠️ Tech Stack

- **Runtime / Framework:** Node.js / Express *(or update based on your language, e.g., Python/FastAPI, Go, C#)*
- **Database:** PostgreSQL / MongoDB *(or update based on your DB choice)*
- **Data Pipeline:** Python / OpenLibrary API Normalizer

---

## 🏁 Getting Started (Local Setup)

Follow these instructions to get a copy of the project up and running on your local machine for development and testing.

### Prerequisites

Ensure you have the following installed locally:
- [Git](https://git-scm.com/)
- [Node.js](https://nodejs.org/) (v18+ recommended) *(or your specific runtime)*
- [Docker](https://www.docker.com/) & Docker Compose *(optional / if applicable)*

---

### 1. Clone the Repository

```bash
git clone [https://github.com/ameerajamaludin/library-management-api.git](https://github.com/ameerajamaludin/library-management-api.git)
cd library-management-api
