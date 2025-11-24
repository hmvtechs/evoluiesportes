"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const competitionController_1 = require("../controllers/competitionController");
// import { addAthleteToTeam, listTeamAthletes, removeAthleteFromTeam } from '../controllers/athleteController';  // Temporariamente desabilitado
const authenticate_1 = require("../middleware/authenticate");
const authorize_1 = require("../middleware/authorize");
const router = (0, express_1.Router)();
router.get('/', competitionController_1.listCompetitions); // Public list? Or authenticated? Let's make it public for now or basic auth.
router.get('/:id', competitionController_1.getCompetition);
router.post('/', authenticate_1.authenticate, (0, authorize_1.authorize)(['ADMIN']), competitionController_1.createCompetition);
router.post('/:id/regulation', authenticate_1.authenticate, (0, authorize_1.authorize)(['ADMIN']), competitionController_1.uploadRegulation);
router.post('/:id/fixture', authenticate_1.authenticate, (0, authorize_1.authorize)(['ADMIN']), competitionController_1.generateFixture);
router.post('/:id/register-team', authenticate_1.authenticate, (0, authorize_1.authorize)(['ADMIN']), competitionController_1.registerTeam);
router.post('/:id/draw-groups', authenticate_1.authenticate, (0, authorize_1.authorize)(['ADMIN']), competitionController_1.drawGroups);
router.get('/:id/fixture', competitionController_1.getFixture); // Public or authenticated?
// Athlete management routes (for TeamRegistration)
// Note: These use /team-registrations prefix but are in competitions router for now
// TODO: Consider creating separate team-registrations router if it grows
// TEMPORARIAMENTE DESABILITADO - controller não implementado ainda
// router.post('/team-registrations/:id/athletes', authenticate, authorize(['ADMIN']), addAthleteToTeam);
// router.get('/team-registrations/:id/athletes', authenticate, authorize(['ADMIN']), listTeamAthletes);
// router.delete('/team-registrations/:id/athletes/:athleteId', authenticate, authorize(['ADMIN']), removeAthleteFromTeam);
exports.default = router;
