const { StatusCodes } = require('http-status-codes');

const index = async (req, res, next) => {
  try {
    const result = await getAllProduct(req);

    res.status(StatusCodes.OK).json({
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

const create = async (req, res, next) => {
  try {
    const result = await createProduct(req);

    res.status(StatusCodes.CREATED).json({
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

const find = async (req, res, next) => {
  try {
    const result = await findProduct(req);

    res.status(StatusCodes.OK).json({
      data: result,
    })
  } catch (error) {
    next(error);
  }
}

const update = async (req, res, next) => {
  try {
    const result = await updateProduct(req);

    res.status(StatusCodes.OK).json({
      data: result,
    })
  } catch (error) {
    next(error);
  }
}

const destroy = async (req, res, next) => {
  try {
    const result = await deleteProduct(req);

    res.status(StatusCodes.OK).json({
      data: result,
    })
  } catch (error) {
    next(error);
  }
}

const editStatus = async (req, res, next) => {
  try {
    const result = await editStatusProduct(req);

    res.status(StatusCodes.OK).json({
      data: result,
    })
  } catch (error) {
    next(error);
  }
}

module.exports = {
  index,
  create,
  find,
  update,
  destroy,
  editStatus
}