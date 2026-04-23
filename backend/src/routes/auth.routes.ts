import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validation.middleware';
import { loginSchema } from '../schemas/auth.schema';

const router = Router();
const ctrl = new AuthController();

router.post('/login', validate(loginSchema), ctrl.login.bind(ctrl));
router.get('/me', authenticate, ctrl.me.bind(ctrl));
router.post('/logout', authenticate, ctrl.logout.bind(ctrl));
router.get('/ad-users', authenticate, ctrl.adUsers.bind(ctrl));

export default router;
