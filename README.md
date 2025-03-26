# Freelancer Toolkit

## Overview
The **Freelancer Toolkit** is a full-stack web application built using the MERN stack. It is designed to help freelancers manage their workflow efficiently by providing features such as currency conversion, workspace locators, time zone scheduling, and a resource library for invoicing and productivity.

## Features
- **User Authentication** using JWT.
- **Currency Converter** with real-time exchange rates.
- **Time Zone Scheduler** to plan meetings across different time zones.
- **Workspace Locator** using Google Places API.
- **Resource Library** for invoice templates and productivity tips.
- **Dashboard Insights** displaying earnings and pending payments.

## Technologies Used
- **Frontend:** React, Redux Toolkit
- **Backend:** Node.js, Express.js
- **Database:** MongoDB with Mongoose
- **APIs Integrated:** Google API (Places, Currency Exchange, Time Zone)
- **Authentication:** JWT (JSON Web Token)

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/)
- [MongoDB](https://www.mongodb.com/)
- API Keys for Google APIs (Places, Currency Exchange, Time Zone)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/ramxnnn/FreelancerToolkit.git
   cd FreelancerToolkit
   ```

2. **Install dependencies**
   ```bash
   npm install
   cd client && npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory and add your MongoDB URI, JWT secret, and API keys.

4. **Start the backend server**
   ```bash
   npm run server
   ```

5. **Start the frontend**
   ```bash
   cd client
   npm start
   ```

### API Documentation
API routes are available for authentication, user management, currency conversion, time zone scheduling, and resource access.

#### **Authentication**
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Log in and receive a JWT token
- `GET /api/auth/user` - Get user details (Protected route)

#### **Currency Conversion**
- `GET /api/currency/convert?from=USD&to=EUR&amount=100` - Convert currency based on exchange rates

#### **Time Zone Scheduler**
- `GET /api/timezone/convert?from=America/New_York&to=Asia/Tokyo&time=10:00` - Convert time across time zones

#### **Workspace Locator**
- `GET /api/places?query=coworking+spaces&location=Toronto` - Find nearby coworking spaces

## Planned Features
- Invoice generator for freelancers
- Payment tracking with financial insights
- AI-powered productivity recommendations
- Dark mode UI for better user experience

### Contributing
Contributions are welcome! Feel free to submit a Pull Request or create an issue for any improvements.

### License
This project is licensed under the MIT License.

## Acknowledgements
Special thanks to the open-source community for their valuable contributions and API providers like Google for their services.
