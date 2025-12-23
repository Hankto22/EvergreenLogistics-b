import { Hono } from 'hono';
import * as controller from './gallery.controller.js';
import { auth } from '../../middleware/auth.middleware.js';

const router = new Hono();

router.get('/', controller.getGalleryItems);
router.get('/:id', controller.getGalleryItemById);
router.post('/', auth, controller.createGalleryItem);
router.put('/:id', auth, controller.updateGalleryItem);
router.delete('/:id', auth, controller.deleteGalleryItem);

export default router;