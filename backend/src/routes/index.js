const express = require('express');
const router = express.Router();

const auth = require('../controllers/authController');
const product = require('../controllers/productController');
const sub = require('../controllers/subscriptionController');
const msg = require('../controllers/messageController');
const review = require('../controllers/reviewController');
const order = require('../controllers/orderController');
const seller = require('../controllers/sellerController');
const admin = require('../controllers/adminController');

const { authRequired, requireRole, requireActiveSeller } = require('../middleware/auth');

// --- Auth ---
router.post('/auth/register', auth.register);
router.post('/auth/otp/request', auth.requestOtpCtrl);
router.post('/auth/otp/verify', auth.verifyOtpCtrl);
router.post('/auth/login', auth.login);
router.post('/auth/refresh', auth.refresh);
router.get('/auth/me', authRequired, auth.me);
router.patch('/auth/me', authRequired, auth.updateMe);

// --- Categories ---
router.get('/categories', product.categories);

// --- Products ---
router.get('/products', product.list);
router.get('/products/mine', authRequired, product.mine);
router.get('/products/:id', product.detail);
router.post('/products', authRequired, requireActiveSeller, product.create);
router.patch('/products/:id', authRequired, product.update);
router.delete('/products/:id', authRequired, product.remove);
router.post('/products/:id/promote', authRequired, product.promote);

// --- Subscriptions ---
router.get('/subscriptions/plans', sub.plans);
router.post('/subscriptions', authRequired, sub.subscribe);
router.get('/subscriptions/me', authRequired, sub.mine);
router.post('/subscriptions/cancel', authRequired, sub.cancel);

// --- Webhooks ---
router.post('/webhooks/payment', sub.webhook);

// --- Conversations & Messages ---
router.get('/conversations', authRequired, msg.listConversations);
router.post('/conversations', authRequired, msg.openConversation);
router.get('/conversations/:id/messages', authRequired, msg.listMessages);
router.post('/conversations/:id/messages', authRequired, msg.send);
router.post('/conversations/:id/read', authRequired, msg.markRead);

// --- Orders ---
router.post('/orders', authRequired, order.create);
router.get('/orders/mine', authRequired, order.mine);
router.get('/orders/:id', authRequired, order.detail);
router.post('/orders/:id/confirm', authRequired, order.confirm);
router.post('/orders/:id/dispute', authRequired, order.dispute);

// --- Reviews & Reports ---
router.post('/reviews', authRequired, review.create);
router.get('/users/:userId/reviews', review.listForUser);
router.post('/reports', authRequired, review.report);

// --- Seller dashboard ---
router.get('/seller/stats', authRequired, requireActiveSeller, seller.stats);
router.get('/seller/revenue', authRequired, requireActiveSeller, seller.revenue);

// --- Admin ---
const adminGuard = [authRequired, requireRole('ADMIN')];
router.get('/admin/users', adminGuard, admin.listUsers);
router.patch('/admin/users/:id', adminGuard, admin.updateUser);
router.get('/admin/subscriptions', adminGuard, admin.listSubscriptions);
router.get('/admin/products', adminGuard, admin.moderateProducts);
router.post('/admin/products/:id/approve', adminGuard, admin.approveProduct);
router.post('/admin/products/:id/reject', adminGuard, admin.rejectProduct);
router.get('/admin/reports', adminGuard, admin.listReports);
router.get('/admin/stats', adminGuard, admin.globalStats);
router.patch('/admin/config', adminGuard, admin.updateConfig);

module.exports = router;
