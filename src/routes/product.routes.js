const { Router } = require("express");
const { upload } = require("../middlewares/multer.middleware");
const {
    createProduct,
    generateCode,
    getProducts,
    getCodes,
    deleteProductCode,
    deletProduct,
    updateProduct,
    updateCode,
    getBlanckCodes
} = require("../controllers/product.controller");


const router = Router()

router.route("/createProduct").post(upload.single("image"), createProduct)
router.route("/generateCode").post(generateCode)
router.route("/getProducts").get(getProducts)
router.route("/getCodes").get(getCodes)
router.route("/getBlankCodes").get(getBlanckCodes)
router.route("/deleteProduct").delete(deletProduct)
router.route("/deleteProductCode").delete(deleteProductCode)
router.route("/updateProduct").patch(updateProduct)
router.route("/updateCode").patch(updateCode)


module.exports = router