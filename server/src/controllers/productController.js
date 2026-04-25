import Product from "../models/Product.js";

export const createProduct = async (req, res) => {
  try {
    const productData = { ...req.body };

    if (req.files && req.files.length > 0) {
      productData.images = req.files.map((file) => `/uploads/${file.filename}`);
    }

    const product = await Product.create(productData);
    return res.status(201).json(product);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getProducts = async (req, res) => {
  try {
    const { status } = req.query;
    let pQuery = {};

    if (status === "published") {
      pQuery.isPublished = true;
    } else if (status === "unpublished") {
      pQuery.isPublished = false;
    }

    const products = await Product.find(pQuery);
    return res.status(200).json(products);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const productData = { ...req.body };

    if (req.files && req.files.length > 0) {
      productData.images = req.files.map((file) => `/uploads/${file.filename}`);
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      productData,
      { new: true, runValidators: true },
    );

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    return res.status(200).json(product);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    return res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const toggleProductPublish = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    product.isPublished = !product.isPublished;
    await product.save();

    return res.status(200).json(product);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
