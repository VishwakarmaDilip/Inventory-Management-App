const { QrCode } = require("../models/qrCode.model");
const { Counter } = require("../models/counter.model");
const { Product } = require("../models/product.model");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const asyncHandler = require("../utils/AsyncHandler");
const { uploadOnCloudinary, deleteFromCloudinary } = require("../utils/Cloudinary");
const { default: mongoose } = require("mongoose");


const createProduct = asyncHandler(async (req, res) => {
    const { productName } = req.body
    const imageLocalPath = req?.file?.path


    if (!imageLocalPath) {
        throw new ApiError(400, "Image is required")
    }

    if (!productName) {
        throw new ApiError(400, "All fields Required")
    }


    const productImage = await uploadOnCloudinary(imageLocalPath)


    if (!productImage) {
        throw new ApiError(500, "Somthing went wrong while uploading the image")
    }

    const counter = await Counter.findOneAndUpdate(
        { counter: "product" },
        { $inc: { sequence: 1 } },
        { upsert: true, returnDocument: "after" }
    )

    const id = counter.sequence
    const formattedId = String(id).padStart(3, "0")

    const newProduct = await Product.create(
        {
            PID: formattedId,
            productName,
            productImage
        }
    )

    return res
        .status(200)
        .json(new ApiResponse(
            200, newProduct, "Product Created Successfully"
        ))

})

const generateCode = asyncHandler(async (req, res) => {
    const { productId, productQuantity } = req.body
    

    if (!productId || !productQuantity) {
        throw new ApiError(400, "All fields Required")
    }

    const product = await Product.findById(productId)

    if (!product) {
        throw new ApiError(404, "No Product Found")
    }

    const counter = await Counter.findOneAndUpdate(
        { counter: "QRCode" },
        { $inc: { sequence: 1 } },
        { upsert: true, returnDocument: "after" }
    )

    const code = `BDL-CD-${String(counter.sequence).padStart(6, "0")}`

    const newCode = await QrCode.create({
        code,
        productQuantity,
        productId: product.PID,
        product: product._id,
    })


    const qrQuantity = await QrCode.countDocuments(
        {
            product: product._id
        }
    )

    if (!qrQuantity) {
        throw new ApiError(404, "No product found")
    }

    product.bundleQty = qrQuantity
    product.stock = (parseInt(product.stock) + parseInt(productQuantity))

    product.save()

    return res
        .status(200)
        .json(new ApiResponse(
            200, newCode, "QR or Bar Code Generated Succesfully"
        ))

})

const getProducts = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType } = req.query

    const pageNumber = parseInt(page, 10)
    const limitNumber = parseInt(limit, 10)
    const skip = (pageNumber - 1) * limitNumber

    const sortOrder = sortType === "descending" ? -1 : 1

    const queryObject = {}
    if (query) {
        queryObject.$or = [
            { PID: { $regex: query, $options: "i" } },
            { productName: { $regex: query, $options: "i" } },
            { description: { $regex: query, $options: "i" } },
        ]
    }

    const totalProduct = await Product.countDocuments(queryObject)

    const fetchProduct = await Product.aggregate([
        { $match: queryObject },
        { $sort: { [sortBy]: sortOrder } },
        { $skip: skip },
        { $limit: limitNumber },
        {
            $project: {
                updatedAt: 0,
                createdAt: 0,
                __v: 0,
            }
        }
    ])

    const pageInfo = {
        page: pageNumber,
        limit: limitNumber,
        totalProduct,
        totalPages: Math.ceil(totalProduct / limitNumber)
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            { fetchProduct, pageInfo }
        )
    )
})

const getCods = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType } = req.query

    const pageNumber = parseInt(page, 10)
    const limitNumber = parseInt(limit, 10)
    const skip = (pageNumber - 1) * limitNumber

    const sortOrder = sortType === "descending" ? -1 : 1

    const queryObject = {}
    if (query) {
        queryObject.$or = [
            { code: { $regex: query, $options: "i" } },
        ]
    }

    const totalCode = await QrCode.countDocuments(queryObject)

    const fetchCode = await QrCode.aggregate([
        { $match: queryObject },
        { $sort: { [sortBy]: sortOrder } },
        { $skip: skip },
        { $limit: limitNumber },
        {
            $lookup: {
                from: "products",
                localField: "product",
                foreignField: "_id",
                as: "product",
                pipeline: [
                    {
                        $project: {
                            PID: 1,
                            productName: 1,
                            productImage: 1,
                        }
                    }
                ]
            }
        },
        {
            $unwind: "$product"
        },
        {
            $project: {
                createdAt: 0,
                updatedAt: 0,
                __v: 0,
            }
        }
    ])

    const pageInfo = {
        page: pageNumber,
        limit: limitNumber,
        totalCode,
        totalPages: Math.ceil(totalCode / limitNumber)
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            { fetchCode, pageInfo }
        )
    )
})

const deletProduct = asyncHandler(async (req, res) => {
    const { productId } = req.body

    if (!productId) {
        throw new ApiError(400, "Something went Wrong")
    }

    const deletedProduct = await Product.findByIdAndDelete(productId)

    if (!deletedProduct) {
        throw new ApiError(500, "product Deletion Failed")
    }

    const productImage = deletedProduct.productImage

    const deleteAllCodes = await QrCode.deleteMany({
        product: productId
    })

    await deleteFromCloudinary(productImage)

    return res
        .status(200)
        .json(new ApiResponse(
            200, { deletedProduct, deleteAllCodes }, "Product Deleted Succesfully"
        ))

})

const deleteProductCode = asyncHandler(async (req, res) => {
    const { codeId } = req.body

    if (!codeId) {
        throw new ApiError(400, "Something went Wrong")
    }

    const deletedProductCode = await QrCode.findByIdAndDelete(codeId)

    if (!deletedProductCode) {
        throw new ApiError(500, "product Deletion Failed")
    }

    const product = await Product.findById(deletedProductCode.product)

    const qrQuantity = await QrCode.countDocuments(
        {
            product: product._id
        }
    )

    if (!qrQuantity) {
        throw new ApiError(404, "No product found")
    }

    product.bundleQty = qrQuantity
    product.stock = parseInt(product.stock) - parseInt(deletedProductCode.productQuantity)

    product.save()

    return res
        .status(200)
        .json(new ApiResponse(
            200, deletedProductCode, "Code Deleted Succesfully"
        ))
})

const updateProduct = asyncHandler(async (req, res) => {
    const { productName, productId } = req.body

    if (!productName || !productId) {
        throw new ApiError(400, "All feild required")
    }

    const product = await Product.findByIdAndUpdate(
        productId,
        {
            productName
        },
        { new: true }
    )

    if (!product) {
        throw new ApiError(500, "Something went wrong")
    }


    return res
        .status(200)
        .json(new ApiResponse(200, product, "Product Updated"))
})

const updateCode = asyncHandler(async (req, res) => {
    const { codeId, productQuantity, decreaseProduct, increaseProduct } = req.body

    if (!codeId) {
        throw new ApiError(400, "All feild required")
    }

    let code;
    let deletedCode

    code = await QrCode.findById(codeId)
    const product = await Product.findById(code.product)



    if (!code || !product) {
        throw new ApiError(404, "No Code and Product Found")
    }

    if (productQuantity) {
        product.stock = parseInt(product.stock) - parseInt(code.productQuantity) + parseInt(productQuantity)

        code.productQuantity = productQuantity
    }

    if (decreaseProduct) {
        if (decreaseProduct > code.productQuantity) {
            throw new ApiError(406, "Imposible Operation")
        }

        if (decreaseProduct == code.productQuantity) {
            deletedCode = await QrCode.findByIdAndDelete(codeId)

            const qrQuantity = await QrCode.countDocuments(
                {
                    product: product._id
                }
            )

            product.bundleQty = qrQuantity
            product.stock = parseInt(product.stock) - parseInt(decreaseProduct)
        }

        if (decreaseProduct < code.productQuantity) {
            code.productQuantity = parseInt(code.productQuantity) - parseInt(decreaseProduct)

            product.stock = parseInt(product.stock) - parseInt(decreaseProduct)
        }

    }

    if (increaseProduct) {
        code.productQuantity = parseInt(code.productQuantity) + parseInt(increaseProduct)

        product.stock = parseInt(product.stock) + parseInt(increaseProduct)
    }


    product.save()

    if (!deletedCode) {
        code.save()        
    }


    return res
        .status(200)
        .json(new ApiResponse(200, { code, deletedCode }, "code Updated"))
})


module.exports = {
    createProduct,
    generateCode,
    getProducts,
    getCods,
    deletProduct,
    deleteProductCode,
    updateProduct,
    updateCode,
}