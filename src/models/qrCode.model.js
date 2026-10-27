const { default: mongoose } = require("mongoose");

const qrCodeSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
        unique: true
    },
    productQuantity: {
        type: Number,
        required: true,
        default: 0,
    },
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product"
    },
    inPrintQueue: {
        type: Boolean,
        default: false
    }
    
},{timestamps:true})

exports.QrCode = mongoose.model("QrCode", qrCodeSchema)