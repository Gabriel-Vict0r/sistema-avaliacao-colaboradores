import { Router } from 'express';
import { StatsController } from '../controllers/stats.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();
const ctrl = new StatsController();

router.use(authenticate);

router.get('/dashboard', ctrl.getDashboard.bind(ctrl));
router.get('/employee/:id', ctrl.getEmployeeHistory.bind(ctrl));

export default router;
