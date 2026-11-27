# Creddit-JS

How to run:
  1- Get Database access (Create a MongoDB account, and then give me your email address)
  2- Create .env file in server folder (Do not commit to github), it should contain this:
    PORT=5000
    MONGO_URI=mongodb+srv://<db_username>:<db_password>@creddit.2jcodnj.mongodb.net/
    JWT_SECRET={any random string}

  You will find your db_username and db_password in:
  -> MongoDB left sidebar
  -> database & network access
  -> edit (make sure you are editing your db_user not someone else)
  -> Edit password
  -> Autogenerate Secure Password (Here you can copy both your db_username and db_password and put them in your .env file)
  -> Update User

  The random string can literally be anything, for cleanliness, run this command in your terminal
    { node -e "console.log(require('crypto').randomBytes(64).toString('hex'))" }
  It will generate it for you.

  3- open a terminal in your server path and run the following commands (Note: The install commands are for first time only):
    npm install express mongoose dotenv cors jsonwebtoken bcryptjs
    npm install --save-dev nodemon

    npm run dev

  4- open a terminal in your client path and run the following commands (Note: The install commands are for first time only):
    npm install
    npm install react-router-dom axios

    npm run dev

  5- The client one will give you a localhost url which you can open in any browser.
