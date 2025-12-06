"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const competitionController_1 = require("../controllers/competitionController");
const athleteController_1 = require("../controllers/athleteController");
const authenticate_1 = require("../middleware/authenticate");
const authorize_1 = require("../middleware/authorize");
const router = (0, express_1.Router)();
router.get('/', competitionController_1.listCompetitions); // Public list? Or authenticated? Let's make it public for now or basic auth.
router.get('/:id', competitionController_1.getCompetition);
router.post('/', authenticate_1.authenticate, (0, authorize_1.authorize)(['ADMIN']), competitionController_1.createCompetition);
router.delete('/:id', authenticate_1.authenticate, (0, authorize_1.authorize)(['ADMIN']), competitionController_1.deleteCompetition);
router.post('/:id/regulation', authenticate_1.authenticate, (0, authorize_1.authorize)(['ADMIN']), competitionController_1.uploadRegulation);
router.post('/:id/fixture', authenticate_1.authenticate, (0, authorize_1.authorize)(['ADMIN']), competitionController_1.generateFixture);
router.post('/:id/register-team', authenticate_1.authenticate, competitionController_1.registerTeam);
router.delete('/:id/registrations/:teamRegId', authenticate_1.authenticate, (0, authorize_1.authorize)(['ADMIN']), competitionController_1.unregisterTeam);
router.put('/:id/registrations/:teamRegId', authenticate_1.authenticate, (0, authorize_1.authorize)(['ADMIN']), competitionController_1.updateTeamRegistration);
router.post('/:id/draw-groups', authenticate_1.authenticate, (0, authorize_1.authorize)(['ADMIN']), competitionController_1.drawGroups);
router.post('/:id/generate-bracket', authenticate_1.authenticate, (0, authorize_1.authorize)(['ADMIN']), competitionController_1.generateBracketKnockout);
router.get('/:id/fixture', competitionController_1.getFixture); // Public or authenticated?
// Athlete management routes (for TeamRegistration)
// Note: These use /team-registrations prefix but are in competitions router for now
// TODO: Consider creating separate team-registrations router if it grows
router.post('/team-registrations/:team_registration_id/athletes', authenticate_1.authenticate, (0, authorize_1.authorize)(['ADMIN']), athleteController_1.addAthleteToTeam);
router.get('/team-registrations/:team_registration_id/athletes', authenticate_1.authenticate, (0, authorize_1.authorize)(['ADMIN']), athleteController_1.listTeamAthletes);
router.delete('/team-registrations/:team_registration_id/athletes/:athlete_id', authenticate_1.authenticate, (0, authorize_1.authorize)(['ADMIN']), athleteController_1.removeAthleteFromTeam);
exports.default = router;
