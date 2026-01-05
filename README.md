# A Scrabble Computer Player Project

### Prerequisites

- Node.js (v14+)

You can download Node.js from [here](https://nodejs.org/)

### 1. Install the necessary dependencies

Navigate to the project directory in the terminal (Command prompt - CMD)

Run the following command in the terminal to install all the dependencies listed in the package.json file
    > npm install

### 2. Run the project

In the terminal run this command:
    > node server.js

The server will run on http://localhost:5000

### 3. View the website page

Open a web browser of your choice

Type in the URL: http://localhost:5000

### 4. Exit out the server

To end the project from running in the terminal use the shortcut CTRL + C

### Extra: Set up the database from scratch

If you don't want pre-existing data on the website follow these steps

1. Delete the database.db file
2. Run this command in the terminal: sqlite3 database.db < Users.sql
3. Run the project as usual