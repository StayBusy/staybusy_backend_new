# Stay busy

## Table of Contents

- [Getting Started](#getting-started)
- [Installation](#installation)
- [Features](#features)
<!-- - [Contributing](#contributing)
- [Team](#team)
- [FAQ](#faq)
- [Support](#support)
- [License](#license) -->

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development.

## Installation

This is node.js API. Installation is done using npm install command:

```javascript
npm install //for production
```

### Clone

- Clone this repo to your local machine using `https://github.com/....`

### The HTTP verbs used

- GET: To retrive resources
- POST: TO create resources
- PATCH: To Update resources
- DELETE: To delete resources

## Features

## Authentication and Authorizetion

- For a new User to register

```JAVASCRIPT
//Endpoint is
/api/v1/auth/register
// Data to be sent
{
    "email": "tolufolorunso@yahoo.com",
    "password": "12345678"
}

-Response is
-status code is 201 created

{
    status: true,
    message: "User Created,Email sent, Verify you email",
}
```

- For login

```javascript
//Endpoint is

/api/v1/auth/login
// Data to be sent
{
    "email": "tolufolorunso@yahoo.com",
    "password": "12345678"
}

-Response is
-status code is 200 Ok

{
  "status": true,
  "message": "login successful",
  "user": {
    "_id": "63a0c33e9bc6777fd77d2961",
    "email": "tolufolorunso@yahoo.com",
    "isVerified": true,
    "tags": [],
    "completed": false,
    "taskTaken": [],
    "completedTasks": [],
    "declinedTasks": [],
    "accountDetail": [],
    "__v": 0
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InRvbHVAeWFob28uY29tIiwiaWQiOiI2M2EwYzMzZTliYzY3NzdmZDc3ZDI5NjEiLCJpYXQiOjE2NzE0ODA0MTUsImV4cCI6MTY3MTczOTYxNX0.3hWHEUqpiu_OwUuXlpLD75bYQq-rY0AvywFhukAEL7I"
}
```

### The base Endpoint

```javascript

```

### Request Header for loggedIn user

```javascript
    headers: { authorization: `Bearer ${token}` },
```

### Completing user profile Using HTTP PATCH method

- User must complete his/her profile before having full access to the app.
- Only a loggedIn user can complete his/her profile

```javascript
//Endpoint is

/api/v1/users/complete-profile
// Data to be sent
{
  image: `image file here`
  firstname: 'tolu',
  lastname: 'folorunso',
  city: 'lagos',
  country: 'nigeria',
  period_available: 'weekdays',
  prefered_currency: 'Euro',
  tags: 'Riffwire,Skinte,Yadel,Livetube'
}

-Response is
-status code is 200 Ok

{
    "status": true,
    "message": "Profile completed",
    "user": {
        "_id": "63a0c33e9bc6777fd77d2961",
        "email": "tolufolorunso@yahoo.com",
        "isVerified": true,
        "tags": [
            "Riffwire",
            "Skinte",
            "Yadel",
            "Livetube"
        ],
        "completed": true,
        "taskTaken": [],
        "completedTasks": [],
        "declinedTasks": [],
        "accountDetail": [],
        "__v": 0,
        "city": "lagos",
        "country": "nigeria",
        "firstname": "tolu",
        "image": "uploads/5a69d935-812e-4b7e-810f-9462c345f5e6-tolulope-node_modules.png",
        "lastname": "folorunso",
        "period_available": "weekdays",
        "prefered_currency": "naira"
    }
}
```

### Get user profile using HTTP GET method

- This route will get the user data

```javascript
//Endpoint is

/api/v1/users/me 
// No data to be sent except 'request headers'

-Response is
-status code is 200 Ok

{
  "status": true,
  "message": "User data",
  "user": {
    "_id": "63a0c33e9bc6777fd77d2961",
    "email": "tolu@yahoo.com",
    "isVerified": true,
    "tags": [
      "Riffwire",
      "Skinte",
      "Yadel",
      "Livetube"
    ],
    "completed": true,
    "taskTaken": [],
    "completedTasks": [],
    "declinedTasks": [],
    "accountDetail": [],
    "__v": 0,
    "city": "lagos",
    "country": "nigeria",
    "firstname": "tolulope",
    "image": "uploads/5a69d935-812e-4b7e-810f-9462c345f5e6-tolulope-node_modules.png",
    "lastname": "kola",
    "period_available": "weekdays",
    "prefered_currency": "naira"
  }
}
```
