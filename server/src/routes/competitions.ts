import { Router } from 'express';
import { createCompetition, listCompetitions, getCompetition, uploadRegulation, generateFixture, registerTeam, drawGroups, getFixture } from '../controllers/competitionController';
import { addAthleteToTeam, listTeamAthletes, removeAthleteFromTeam } from '../controllers/athleteController';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';

const router = Router();

router.get('/', listCompetitions); // Public list? Or authenticated? Let's make it public for now or basic auth.
router.get('/:id', getCompetition);
router.post('/', authenticate, authorize(['ADMIN']), createCompetition);
router.post('/:id/regulation', authenticate, authorize(['ADMIN']), uploadRegulation);
router.post('/:id/fixture', authenticate, authorize(['ADMIN']), generateFixture);
router.post('/:id/register-team', authenticate, authorize(['ADMIN']), registerTeam);
router.post('/:id/draw-groups', authenticate, authorize(['ADMIN']), drawGroups);
router.get('/:id/fixture', getFixture); // Public or authenticated?

// Athlete management routes (for TeamRegistration)
// Note: These use /team-registrations prefix but are in competitions router for now
// TODO: Consider creating separate team-registrations router if it grows
router.post('/team-registrations/:id/athletes', authenticate, authorize(['ADMIN']), addAthleteToTeam);
router.get('/team-registrations/:id/athletes', authenticate, authorize(['ADMIN']), listTeamAthletes);
router.delete('/team-registrations/:id/athletes/:athleteId', authenticate, authorize(['ADMIN']), removeAthleteFromTeam);

export default router;
