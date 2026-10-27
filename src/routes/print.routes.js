const { Router } = require("express");
const { addInQueue, removeFromQueue, getPrintQueue } = require("../controllers/print.controller");


const router = Router()

router.route("/addInQueue").post(addInQueue)
router.route("/removeFromQueue").delete(removeFromQueue)
router.route("/getPrintQueue").get(getPrintQueue)

module.exports = router