const { default: mongoose } = require("mongoose");


const counterSchema = new mongoose.Schema(
    {
        counter : {
            type: String
        },
        sequence: {
            type: Number,
            default:0
        }
    }
)

module.exports.Counter = mongoose.model("Counter", counterSchema)