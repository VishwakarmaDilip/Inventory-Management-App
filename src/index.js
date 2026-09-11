const dotenv = require('dotenv').config()
const app = require('./app')
const connectDB = require("./db/db")


connectDB()
    .then(() => {
        app.on("Error", (error) => {
            console.log(("Error : ", error));
            throw error
        })
        app.listen(process.env.PORT || 3000, () => {
            console.log((`server is running on port : ${process.env.PORT}`));
        })
    })
    .catch((err) => {
        console.log("MONGO DB connection failled !!!", err);
    })