const express = require("express");
const router = express.Router();

const author_controllers = require("../controllers/author-controller");

router.get("/", author_controllers.allAuthorsGet);
router.get("/top-authors", author_controllers.topAuthorsGet);
router.get("/:authorId", author_controllers.authorGet);

module.exports = router;
