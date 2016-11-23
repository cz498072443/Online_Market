/**
 * Created by chen on 2016/11/22.
 */

var express = require("express");
var router = express.Router();

router.get('/',function (req, res) {
    res.send("hello")
});

module.exports = router;