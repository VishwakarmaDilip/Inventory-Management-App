const { default: mongoose } = require("mongoose");


const printQueSchema = new mongoose.Schema({
    qrCode: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "QrCode"
    },
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product"
    },
}, { timestamps: true })

exports.PrintQue = mongoose.model("PrintQue", printQueSchema)