import { Hono } from 'hono';
import * as controller from './shipments.controller.js';
import { auth } from '../../middleware/auth.middleware.js';

const router = new Hono();

router.get('/', auth, controller.getShipments);
router.get('/:id', auth, controller.getShipmentById);
router.get('/evg/:evgCode', controller.getShipmentByEvgCode);
router.post('/', auth, controller.createShipment);
router.put('/:id', auth, controller.updateShipment);
router.delete('/:id', auth, controller.deleteShipment);

export default router;