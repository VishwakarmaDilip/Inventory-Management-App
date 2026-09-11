const { default: mongoose } = require("mongoose");


const scanSummarySchema = new mongoose.Schema({
    barcode: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Barcode"
    },
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product"
    },
}, { timestamps: true })

exports.ScanSummary = mongoose.model("ScanSummary", scanSummarySchema)