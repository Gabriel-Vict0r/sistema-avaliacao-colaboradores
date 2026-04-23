import { Router } from 'express';
import { UsersController } from '../controllers/users.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/rbac.middleware';
import { validate } from '../middlewares/validation.middleware';
import { createUserSchema, updateUserSchema } from '../schemas/user.schema';

const router = Router();
const ctrl = new UsersController();

router.use(authenticate);

router.get('/', requireRole('ADMIN'), ctrl.findAll.bind(ctrl));
router.get('/:id', requireRole('ADMIN'), ctrl.findById.bind(ctrl));
router.post('/', requireRole('ADMIN'), validate(createUserSchema), ctrl.create.bind(ctrl));
router.put('/:id', requireRole('ADMIN'), validate(updateUserSchema), ctrl.update.bind(ctrl));
router.delete('/:id', requireRole('ADMIN'), ctrl.deactivate.bind(ctrl));

export default router;
