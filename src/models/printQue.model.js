const { default: mongoose } = require("mongoose");


const printQueSchema = new mongoose.Schema({
    barcode: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Barcode"
    },
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product"
    },
}, { timestamps: true })

exports.PrintQue = mongoose.model("PrintQue", printQueSchema)