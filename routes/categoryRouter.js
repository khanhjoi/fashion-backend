const router = require('express').Router();
const categoryCtrl = require('../controllers/categoryCtl');
const auth = require('../middleware/auth');
const authAdmin = require('../middleware/authAdmin');

router.route('/category')
    .get(categoryCtrl.getCategories)
    .post(auth, authAdmin, categoryCtrl.createCategory)

router.route('/category/:id')
    .delete(auth, authAdmin, categoryCtrl.deleteCategory)
    .post(auth, authAdmin, categoryCtrl.updateCategory)

module.exports = router;