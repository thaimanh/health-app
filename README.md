# Health App API - Project Scope

## 🎯 Project Overview

A comprehensive health app API that enables users to monitor their health and fitness journey through various tracking features with secure role-based access control.

## 📋 Core Features Scope

### ✅ **Implemented Features**

#### 1. **Authentication & Authorization**

- **JWT-based authentication system**
- **Role-based access control (USER, ADMIN)**
- Secure password hashing
- Token refresh mechanism

#### 2. **User Management**

- **Admin-only CRUD operations**

#### 3. **Diary Management**

- **User-scoped CRUD operations**

#### 4. **Body Measurement Tracking**

- **User-scoped CRUD operations**

#### 5. **Exercise Record Management**

- **User-scoped CRUD operations**

#### 6. **Meal Management**

- **User-scoped CRUD operations**

#### 7. **Article Management**

- **Admin-only CRUD operations**
- Fitness content publishing
- Article categorization
- Featured content management

### 🚧 **Planned Features**

#### 8. **Goal Management**

- Goal setting and tracking system
- Progress daily
- Achievement system
- Milestone celebrations
- _Status: TODO (Not implemented due to time constraints)_

## 🛠️ Technical Scope

### **Backend Infrastructure**

- **Node.js** with **TypeScript**
- **Prisma ORM** with **MongoDB**
- **Docker** containerization
- **JWT** for authentication

### **API Architecture**

- RESTful API design
- Middleware-based authentication
- Input validation with class-validator
- Error handling and logging
- Pagination and filtering

### **Database Schema**

- User management with roles
- Diary entries with user association
- Body measurements with caching strategy
- Exercise records with user association
- Meal tracking user association
- Article management with admin controls

### **Authentication**

- Secure JWT token management
- Password hashing with bcrypt
- Token expiration and refresh
- Secure HTTP headers

### **Authorization**

- **USER Role**: Personal data management only
- **ADMIN Role**: Full system access

### **Development Environment**

- Docker-based MongoDB
- Hot-reload development server
- Environment-based configuration
- Database seeding for testing

## 🚀 Quick Start

### Prerequisites

- Node.js (v18 or higher)
- Docker and Docker Compose
- npm or yarn

### 1. Database Setup

```bash
# Start MongoDB using Docker
./scripts/init-mongodb.sh
```

### 2. Environment Configuration

```bash
# Copy environment template
cp .env.example .env.development

# Edit the file with your configuration
nano .env.development
```

### 3. Database Migration & Seeding

```bash
# Push database schema
npm run db:dev

# Generate Prisma client
npm run db:generate

# Seed initial data (creates admin/user accounts)
npm run db:seed:dev
```

## 🛠️ Available Scripts

```bash
# Development
npm run dev              # Start development server
npm run build           # Build the application
npm run start           # Start production server

# Database
npm run db:dev          # Push database schema
npm run db:generate     # Generate Prisma client
npm run db:seed:dev     # Seed development data
npm run db:reset        # Reset database

# Code Quality
npm run lint           # Run ESLint
npm run lint:fix       # Fix ESLint issues
npm run format         # Format code with Prettier
```
