const mongoose = require('mongoose')
const {DB_NAME} = require('../constants')

const connectDB = async () => {
    try {
        const ConnectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)

        console.log(`\n Mongo DB connected !! DB Host: ${ConnectionInstance.connection.host}`);
        
    } catch (error) {
        console.log("'MONGODB Connection Failed..!", error);
        process.exit(1) 
    }
}

module.exports = connectDB