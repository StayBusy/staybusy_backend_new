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

### Update basic user profile using HTTP PATCH method

- This route will update the user data: { email, firstname, lastname, phone_number }

```javascript
//Endpoint is

/api/v1/users/basic
// Data to be sent
{
  email: tolu@yahoo.com,
  firstname: 'kola',
  lastname: 'jide',
  phone_number: '09098776990'
}

-Response is
-status code is 200 Ok

{
  "status": true,
  "message": "Updated",
  "user": {
    "_id": "63a0c33e9bc6777fd77d2961",
    "email": "tolu@yahoo.com",
    "firstname": "kola",
    "lastname": "jide",
    "phone_number": '09098776990'
      ...
  }
}
```

### Add and update account details using HTTP PATCH method

- This route will allow the user to add or update the account details: { country, bankName, bankAccountNumber, bankAccountName, sortCode, },

```javascript
//Endpoint is

/api/v1/users/add-account
// Data to be sent
{
    "country": "nigeria",
    "bankName": "accessbank",
    "bankAccountNumber": "947437340943",
    "bankAccountName": "tolu kola",
    "sortCode": "5454"
}

-Response is
-status code is 200 Ok

{
  "status": true,
  "message": "Account detail added",
  "accountDetail": {
    "_id": "63a0c33e9bc6777fd77d2961",
    "accountDetail": [
      {
        "country": "nigeria",
        "bankName": "accessbank",
        "bankAccountNumber": "947437340943",
        "bankAccountName": "tolu kola",
        "sortCode": "5454",
        "date": "2022-12-20T12:51:19.449Z",
        "_id": "63a1afc7efa503ed50a2b79f"
      }
    ],
    "country": "nigeria",
    "__v": 1
  }
}
```

### Update tag(categories) using HTTP PATCH method

- This route will allow the user to update the tag
- String with comma separated

```javascript
//Endpoint is

/api/v1/users/update-tag
// Data to be sent
{
  "tags": "frondend,mern,fullstack"
}

-Response is
-status code is 200 Ok

{
  "status": true,
  "message": "Updated",
  "user": [
    "frondend",
    "mern",
    " fullstack"
  ]
}
```

### Update user profile image using HTTP PATCH method

- This route will allow the user to update the tag

````javascript
//Endpoint is

/api/v1/users/change-profile-image
// Data to be sent
{
  "image": ```image here file here```
}

-Response is
-status code is 200 Ok

{
  "status": true,
  "message": "uploaded",
  "user": {
    image: 'upload/hdks...'
    ...
  }
}
````

## All Tasks routes

### Get all tasks using HTTP GET method

- This route will get all tasks for a specific user

```javascript
//Endpoint is

/api/v1/tasks
// No data to be sent except 'request headers'

-Response is
-status code is 200 Ok

{
  status: true,
  message: "Tasks",
  result: tasks.length,
  tasks: [
    ...
  ]
}
```

### Decline task using HTTP PATCH method

- This route will allow the user to decline task

```javascript
//Endpoint is

/api/v1/tasks/<taskId>/decline
// No data to be sent except 'request headers'

-Response is
-status code is 200 Ok

{
  "status": true,
  "message": "Task declined: pleasures of the flesh (etsuraku)",
  "task": {
    "_id": "63a1ad5bacfe6b0772cbf9f1",
  }
}
```

### Accept a task using HTTP PATCH method

- This route will allow the user to accept a task

```javascript
//Endpoint is

/api/v1/tasks/<taskId>/accept
// No data to be sent except 'request headers'

-Response is
-status code is 200 Ok

{
  "status": true,
  "message": "Task Accepted "
}
```

### Complete a task using HTTP PATCH method

- This route will allow the user to accept a task
- The route will accept a url or a file

```javascript
//Endpoint is

/api/v1/tasks/<taskId>/complete
// Data to be sent
{
  "url": "frondend,mern,fullstack"
}

OR

{
  "uploadedFiles": file to be uploaded
}

-Response is
-status code is 200 Ok

{
  status: true,
  message: `Task completed`,
}
```
