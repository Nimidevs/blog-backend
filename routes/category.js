const express = require("express");
const router = express.Router();

const category_controller = require("../controllers/category-controller");

router.get("/", category_controller.allCategoriesGet);
router.get("/:id", category_controller.categoryGet);
router.get('/:id/posts', category_controller.categoryPostsGet)
module.exports = router;
