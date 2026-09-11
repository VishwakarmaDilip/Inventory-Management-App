const { default: mongoose } = require("mongoose");

const productSchema = new mongoose.Schema({
    PID: {
        type: String,
        require: true,
        unique: true
    },
    productName: {
        type: String,
        require: true,
    },
    productImage: {
        type: String,
        require: true, 
    },
    stock: {
        type: Number,
        require: true,
        default: 0,
    },
    bundleQty: {
        type: Number,
        require: true,
        default: 0,
    },
}, { timestamps: true })

exports.Product = mongoose.model("Product", productSchema)