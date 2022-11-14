 const Products = require('../models/productModel');

// Filtering, sorting and paginating

class APIfeatures {
    constructor(query, queryString){
        this.query = query;
        this.queryString = queryString;
    }

    filtering() {
        const queryObj = {...this.queryString}; // queryStringq = req.query
        
        // console.log({before: queryObj}); //before delete page

        const excludedFields = ['page' , 'sort', 'limit']; // clear Fields to query
        excludedFields.forEach(el => delete(queryObj[el]));

        // console.log({after: queryObj}); //after deletePage

        let queryStr = JSON.stringify(queryObj);
        queryStr = queryStr.replace(/\b(gte|gt|lt|lte|regex)\b/g, match => '$' + match); // define query in mongoose

        // gte = greater than or equal
        // lte = lesser than or equal
        // lt = lesser than 
        // gt = greater than 
        // regex = find characters in string

        this.query.find(JSON.parse(queryStr)); // find query in mongooseDB

        return this;
    }

    sorting(){
        if(this.queryString.sort) {
            const sortBy = this.queryString.sort.split(',').join(' ');
            console.log(sortBy)
            this.query = this.query.sort(sortBy);
        }else {
            this.query = this.query.sort('-createdAt')
        }
        return this;
    }

    paginating(){
        // define page and skip page
        const page = this.queryString.page * 1 || 1;
        const limit = this.queryString.limit *1 || 6;
        const skip = (page - 1) * limit;
        this.query = this.query.skip(skip).limit(limit);
        return this;
    }
}

const productCtrl = {
    getProducts: async (req, res,) => {
        try {
            const features = new APIfeatures(Products.find(), req.query).filtering().sorting().paginating()
            // get all products
            const products = await features.query;
            res.json({
                status: 'success',
                result: products.length,
                products: products
            });
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