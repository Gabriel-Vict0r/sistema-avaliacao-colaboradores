import { Router } from 'express';
import { EmployeesController } from '../controllers/employees.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/rbac.middleware';
import { validate } from '../middlewares/validation.middleware';
import { createEmployeeSchema, updateEmployeeSchema } from '../schemas/employee.schema';

const router = Router();
const ctrl = new EmployeesController();

router.use(authenticate);

// Rota /pending deve vir antes de /:id para não conflitar
router.get('/pending', ctrl.findPending.bind(ctrl));
router.get('/', ctrl.findAll.bind(ctrl));
router.get('/:id', ctrl.findById.bind(ctrl));
router.post('/', validate(createEmployeeSchema), ctrl.create.bind(ctrl));
router.put('/:id', validate(updateEmployeeSchema), ctrl.update.bind(ctrl));
router.delete('/:id', requireRole('ADMIN'), ctrl.deactivate.bind(ctrl));

export default router;
