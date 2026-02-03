import { Router } from 'express';
import { calendarController } from '../controllers/calendar.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = Router();

// All routes are protected
router.use(authMiddleware);

// Calendar events
router.get('/events', calendarController.getEvents.bind(calendarController));
router.post('/events', calendarController.createEvent.bind(calendarController));
router.put('/events/:id', calendarController.updateEvent.bind(calendarController));
router.delete('/events/:id', calendarController.deleteEvent.bind(calendarController));

export default router;
