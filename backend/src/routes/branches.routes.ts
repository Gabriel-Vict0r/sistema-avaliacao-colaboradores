import { Router } from 'express';
import { BranchesController } from '../controllers/branches.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/rbac.middleware';
import { validate } from '../middlewares/validation.middleware';
import { createBranchSchema, updateBranchSchema } from '../schemas/branch.schema';

const router = Router();
const ctrl = new BranchesController();

router.use(authenticate);

router.get('/', ctrl.findAll.bind(ctrl));
router.get('/:id', ctrl.findById.bind(ctrl));
router.post('/', requireRole('ADMIN'), validate(createBranchSchema), ctrl.create.bind(ctrl));
router.put('/:id', requireRole('ADMIN'), validate(updateBranchSchema), ctrl.update.bind(ctrl));
router.delete('/:id', requireRole('ADMIN'), ctrl.deactivate.bind(ctrl));

export default router;
