const express = require('express');
const { StatusCodes } = require('http-status-codes');
const authenticateUser = require('../../middlewares/authentication');
const Tag = require('../../models/Tags');

const tagRouter = express.Router();

async function getTags(req, res) {
  const tags = await Tag.find({});

  res.status(StatusCodes.OK).json({
    status: true,
    message: 'success',
    tags,
  });
}

tagRouter.get('/', getTags);

module.exports = tagRouter;
