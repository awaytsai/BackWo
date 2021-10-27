const express = require("express");
const router = express.Router();
const breedsList = require("../public/data/breeds.json");

router.use(express.json());
router.use(express.urlencoded({ extended: true }));

// upload page
router.route("/getBreeds").get((req, res) => {
  res.json(breedsList);
});

module.exports = router;
