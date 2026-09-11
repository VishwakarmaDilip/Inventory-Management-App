const { Router } = require("express");
const { upload } = require("../middlewares/multer.middleware");
const {
    createProduct,
    generateCode,
    getProducts,
    getCods,
    deleteProductCode,
    deletProduct,
    updateProduct,
    updateCode
} = require("../controllers/product.controller");


const router = Router()

router.route("/createProduct").post(upload.single("image"), createProduct)
router.route("/generateCode").post(generateCode)
router.route("/getProducts").get(getProducts)
router.route("/getCodes").get(getCods)
router.route("/deleteProduct").delete(deletProduct)
router.route("/deleteProductCode").delete(deleteProductCode)
router.route("/updateProduct").patch(updateProduct)
router.route("/updateCode").patch(updateCode)


module.exports = router