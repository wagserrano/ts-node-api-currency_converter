import express from 'express';
import controller from '../controllers/converter';
const router = express.Router();

router.get('/converter', controller.getStatus);
router.post('/converter', controller.postCurrency);

export = router;