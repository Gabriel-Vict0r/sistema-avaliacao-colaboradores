import { Router } from 'express';
import { EvaluationsController } from '../controllers/evaluations.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validation.middleware';
import { createEvaluationSchema, updateEvaluationSchema } from '../schemas/evaluation.schema';

const router = Router();
const ctrl = new EvaluationsController();

router.use(authenticate);

router.get('/', ctrl.findAll.bind(ctrl));
router.get('/:id', ctrl.findById.bind(ctrl));
router.post('/', validate(createEvaluationSchema), ctrl.create.bind(ctrl));
router.put('/:id', validate(updateEvaluationSchema), ctrl.update.bind(ctrl));
router.delete('/:id', ctrl.delete.bind(ctrl));

export default router;
