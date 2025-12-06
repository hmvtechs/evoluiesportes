"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const organizationController_1 = require("../controllers/organizationController");
const authenticate_1 = require("../middleware/authenticate");
const authorize_1 = require("../middleware/authorize");
const router = (0, express_1.Router)();
// TEMP: Removed auth from organization list and create to fix team registration
router.get('/', organizationController_1.listOrganizations);
router.get('/:id', organizationController_1.getOrganization);
router.post('/', organizationController_1.createOrganization);
router.put('/:id', authenticate_1.authenticate, (0, authorize_1.authorize)(['ADMIN']), organizationController_1.updateOrganization);
router.delete('/:id', authenticate_1.authenticate, (0, authorize_1.authorize)(['ADMIN']), organizationController_1.deleteOrganization);
exports.default = router;
