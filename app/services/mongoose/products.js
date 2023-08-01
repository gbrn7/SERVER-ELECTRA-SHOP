const Products = require('../../api/v1/Products/model');
const { NotFoundError, BadRequestError } = require('../../errors');
const { checkingThumbnail, destroyThumbnailById } = require('./thumbnail');
const deleteFiles = require('../../utils/deleteFiles');

const getAllProducts = async (req) => {
  const { keyword, price, status, limit, page } = req.query;

  let condition = {};

  if (keyword) {
    condition = { ...condition, name: { $regex: keyword, $options: 'i' } };
  }
  if (price) {
    condition = { ...condition, name: { $regex: price, $options: 'i' } };
  }
  if (status) {
    condition = { ...condition, name: { $regex: status, $options: 'i' } };
  }

  const result = await Products.find(condition).populate('thumbnail');


  if (!result || result.length === 0) throw new NotFoundError('Product not Found');

  const countProducts = await Products.countDocuments(condition);

  return { product: result, pages: Math.ceil(countProducts / limit), total: countProducts, page }
}

const createProduct = async (req) => {
  const {
    name,
    price,
    stock,
    desc,
    status,
    weight,
    thumbnail } = req.body;

  if (!thumbnail) throw new BadRequestError("The thumbnail is required");

  await checkingThumbnail(thumbnail);

  const result = await Products.create({
    name,
    price,
    stock,
    desc,
    status,
    weight,
    thumbnail
  });

  return result;
}

const updateProduct = async (req) => {
  const { id } = req.params;

  const check = await Products.findById(id).populate('thumbnail');

  if (!check) throw new NotFoundError(`The product with id ${id} not found`);

  const {
    name,
    price,
    stock,
    desc,
    status,
    weight,
    thumbnail } = req.body;

  if (thumbnail) {

    if (thumbnail !== check.thumbnail._id.valueOf()) {
      await destroyThumbnailById(check.thumbnail._id);

      deleteFiles(check.thumbnail.files);
    }
  }

  const result = await Products.findByIdAndUpdate(id, {
    name,
    price,
    stock,
    desc,
    status,
    weight,
    thumbnail
  }, { new: true, runValidators: true });

  return result;
}

const findProduct = async (req) => {
  const { id } = req.params;

  const result = await Products.findById(id).populate('thumbnail');

  if (!result) throw new NotFoundError(`The product with id ${id} not found`);

  return result;
}

const deleteProduct = async (req) => {
  const { id } = req.params;

  const result = await Products.findByIdAndDelete(id).populate('thumbnail');

  if (!result) {
    throw new NotFoundError(`The product with id ${id} not found`);
  }
  else {
    fs.unlinkSync(`public/${result.thumbnail.name}`);
    await destroyThumbnailById(result._id);
  }

  return result;
}

const editStatusProduct = async (req) => {
  const { id } = req.params;
  const { status } = req.body

  const check = await Products.findById(id);

  if (!check) throw new NotFoundError(`the product with id ${id} not found`);

  const result = await Products.findByIdAndUpdate(check._id, {
    status: status
  }, { new: true, runValidators: true })

  return result;
}

const chekingProductvailability = async (req) => {
  const { orderDetails } = req.body;

  const idProducts = orderDetails.map((item) => {
    return item.productId
  });

  const checkingProduct = await Products.find({
    _id: { $in: idProducts },
  });

  if (!checkingProduct) throw new NotFoundError('The product not found');

  let err;
  for (let i = 0; i < checkingProduct.length; i++) {
    if (checkingProduct[i].stock < orderDetails[i].qty) {
      err.push(checkingProduct[i]);
    }

    if (i === checkingProduct.length - 1 && err) {
      throw new BadRequestError(`the stock of product with ${err.map((item) => `id: ${item._id} stock: ${item.stock}`).join(', ')} is less than request`)
    }
  }

  return checkingProduct;
}

const reduceProductStock = async (req) => {
  const { orderDetails } = req.body;

  const result = Products.bulkWrite(
    orderDetails.map((item) => {
      return {
        updateOne: {
          filter: { _id: item.productId },
          update: { $inc: { stock: -item.qty } },
        }
      }
    })
  )

  return result;
}

module.exports = {
  getAllProducts,
  createProduct,
  updateProduct,
  findProduct,
  deleteProduct,
  editStatusProduct,
  chekingProductvailability,
  reduceProductStock,
}