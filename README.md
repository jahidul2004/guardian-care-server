# Guardian Care Server

This is the backend server for the **Guardian Care** project, built with **Node.js**, **Express.js**, and **MongoDB**. It handles meal plans, memberships, transactions, user authentication, and payment processing via **Stripe**.

## Features
- 📦 RESTful API with Express.js
- 🗄️ MongoDB Database
- 🔐 JWT Authentication & Authorization
- 💳 Stripe Payment Integration
- 📊 CRUD Operations for Meals, Memberships, Transactions, and Reviews

## Tech Stack
- **Backend:** Node.js, Express.js
- **Database:** MongoDB, Mongoose
- **Authentication:** JWT, bcrypt
- **Payment:** Stripe

## Installation & Setup

### Prerequisites
Ensure you have the following installed:
- Node.js
- MongoDB

### Clone the Repository
```sh
git clone https://github.com/jahidul2004/guardian-care-server.git
cd guardian-care-server
```

### Install Dependencies
```sh
npm install
```

### Run the Server
```sh
npm run dev
```

## API Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/meals` | Get all meal plans |
| POST | `/api/membership` | Create a new membership |
| POST | `/api/transactions` | Record a transaction |
| POST | `/api/reviews` | Add a user review |

## Deployment
To deploy the server:
```sh
git push heroku main
```
