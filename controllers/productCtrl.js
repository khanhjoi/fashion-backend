 const Products = require('../models/productModel');

 const productCtrl = {
    getProducts: async (req, res,) => {
        try {
            // get all products
            const products = await Products.find()
            res.json(products);
        } catch (err) {
            return res.status(500).json({msg: err.message});
        }
    },
    createProduct: async (req, res,) => {
        try {
            const {product_id, title, price, description, content, images, category} = req.body; 
            //check images 
            if(!images) {
                return res.status(400).json({msg: "No image upload"});
            };
            
            // check product in category
            const product = await Products.findOne({product_id});
            if(product) {
                return res.status(400).json({msg: "This product already exists"});
            };
            //create a new product
            const newProduct = new Products({
                product_id, title: title.toLowerCase(), price, description, content, images, category
            });

            await newProduct.save();
            res.json({message: "created a new Product"});

        } catch (err) {
            return res.status(500).json({msg: err.message});   
        }
    },
    deleteProduct: async (req, res,) => {
        try {
            await Products.findByIdandDelete(req.params.id);
            res.json({message: "delete product"});
        } catch (err) {
            return res.status(500).json({msg: err.message});
        }
    },
    updateProduct: async (req, res,) => {
        try {
            const {title, price, description, content, images, category} = req.body; 
            if(!images) {
                return res.status(400).json({msg: "No image upload"});
            }

            await Products.findOneAndUpdate({_id: req.params.id},{
                title: title.toLowerCase(), price, description, content, images, category
            })

            res.json({message: "Update success"})
        } catch (err) {
            return res.status(500).json({msg: err.message});
        }
    },
 }

 module.exports = productCtrl;