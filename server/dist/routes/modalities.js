"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const modalityController_1 = require("../controllers/modalityController");
const router = (0, express_1.Router)();
router.get('/', modalityController_1.listModalities);
exports.default = router;
