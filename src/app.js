const express = require('express')
const cors = require('cors')


const app = express()

// const whiteList = process.env.CORS_ORIGIN_WHITELIST

const whiteList = process.env.CORS_ORIGIN_WHITELIST
    .replace("[", "")
    .replace("]", "")
    .split(",")
    .map(origin => origin.trim())

console.log("CORS ENV:", process.env.CORS_ORIGIN_WHITELIST)
console.log("WHITE LIST:", whiteList)
console.log("IS ARRAY:", Array.isArray(whiteList))

app.use(cors({
    origin: function (origin, callback) {
        if (!origin || whiteList.includes(origin)) {
            callback(null, true)
        } else {
            callback(new Error("Note allowed by CORS"))
        }
    },
    credentials: true
}))

app.use(express.json({ limit: "16kb" }))
app.use(express.urlencoded({ extended: true, limit: "16kb" }))
app.use(express.static("public"))


// Imports Routes
const productRouter = require('./routes/product.routes')

//Routes Declaration
app.use("/api/v1/product", productRouter)



module.exports = app