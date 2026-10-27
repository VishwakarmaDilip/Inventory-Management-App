const { Aggregate } = require("mongoose");
const { PrintQue } = require("../models/printQue.model");
const { QrCode } = require("../models/qrCode.model");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const asyncHandler = require("../utils/AsyncHandler");


const addInQueue = asyncHandler(async (req, res) => {
    const { codeId } = req.body;

    if (!codeId) {
        throw new ApiError(400, "codeId is required");
    }

    const existingEntry = await PrintQue.findOne({ qrCode: codeId });

    if (existingEntry) {
        throw new ApiError(400, "This code is already in the print queue");
    }

    const printQue = await PrintQue.create({
        qrCode: codeId
    })

    if (!printQue) {
        throw new ApiError(500, "Failed to add in print queue");
    }

    const qrCode = await QrCode.findByIdAndUpdate(codeId, {
        inPrintQueue: true
    }, { returnDocument: "after" });

    res.
        status(201)
        .json(new ApiResponse(201, "Added to print queue", printQue));
})

const removeFromQueue = asyncHandler(async (req, res) => {
    const { codeId } = req.body;

    if (!codeId) {
        throw new ApiError(400, "codeId is required");
    }

    const deletedEntry = await PrintQue.findOneAndDelete({ qrCode: codeId });

    if (!deletedEntry) {
        throw new ApiError(404, "This code is not in the print queue");
    }

    const qrCode = await QrCode.findByIdAndUpdate(codeId, {
        inPrintQueue: false
    }, { returnDocument: "after" });

    res.
        status(200)
        .json(new ApiResponse(200, "Removed from print queue", deletedEntry));
})

const getPrintQueue = asyncHandler(async (req, res) => {
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

    const totalCodesInQueue = await PrintQue.countDocuments(queryObject)

    const printQueue = await PrintQue.aggregate([
        {
            $match: queryObject
        },
        { $sort: { [sortBy]: sortOrder } },
        { $skip: skip },
        { $limit: limitNumber },
        {
            $lookup: {
                from: "qrcodes",
                localField: "code",
                foreignField: "_id",
                as: "qrCode",
                pipeline: [
                    {
                        $lookup: {
                            from: "products",
                            localField: "product",
                            foreignField: "_id",
                            as: "product",
                            pipeline: [
                                {
                                    $project: {
                                        _id: 1,
                                        PID: 1,
                                        productName: 1,
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $unwind: {
                            path: "$product",
                            preserveNullAndEmptyArrays: true
                        }
                    },
                    {
                        $project: {
                            createdAt: 0,
                            updatedAt: 0,
                            __v: 0
                        }
                    }
                ]
            },
        },
        {
            $unwind: {
                path: "$qrCodes",
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $project: {
                id: 1,
                qrCode: 1,
            }
        },
    ])

    if (!printQueue) {
        throw new ApiError(404, "No entries in print queue");
    }

    const pageInfo = {
        page: pageNumber,
        limit: limitNumber,
        totalCodesInQueue,
        totalPages: Math.ceil(totalCodesInQueue / limitNumber)
    }

    res.
        status(200).json(new ApiResponse(200, "Print queue retrieved successfully", { printQueue, pageInfo }))
})

module.exports = {
    addInQueue,
    removeFromQueue,
    getPrintQueue
}