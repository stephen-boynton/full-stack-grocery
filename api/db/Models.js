/* eslint-disable no-param-reassign */
const { Schema, model } = require('mongoose');
const { pipe, toPairs, map } = require('lodash/fp');
const { promisify } = require('util');
const bcrypt = require('bcryptjs');

const asyncCompare = promisify(bcrypt.compare);

function createModels(name) {
  return pipe(
    obj => new Schema(obj),
    schema => model(name, schema),
  );
}

function createModelsWithMethods(name, statics = {}, methods = {}) {
  return pipe(
    obj => new Schema(obj),
    (schema) => {
      pipe(
        toPairs,
        map(([mName, fx]) => { schema.statics[mName] = fx; }),
      )(statics);
      return schema;
    },
    (schema) => {
      pipe(
        toPairs,
        map(([mName, fx]) => { schema.methods[mName] = fx; }),
      )(methods);
      return schema;
    },
    schema => model(name, schema),
  );
}

exports.Groceries = createModels('Groceries')({
  name: String,
  items: [String],
  owner: { type: Schema.Types.ObjectId, ref: 'Users' },
  users: [{ type: Schema.Types.ObjectId, ref: 'Users' }],
  date_created: { type: Date, default: Date.now() },
  date_updated: { type: Date, default: Date.now() },
});

exports.Meals = createModels('Meals')({
  name: String,
  ingredients: [String],
  description: String,
  owner: { type: Schema.Types.ObjectId, ref: 'Users' },
  date_created: { type: Date, default: Date.now() },
  date_updated: { type: Date, default: Date.now() },
  favorite: [{ type: Schema.Types.ObjectId, ref: 'Users' }],
  tags: { type: [String], default: [] },
});

exports.Tags = createModels('Tags')({
  tag: String,
  meals: [{ type: Schema.Types.ObjectId, ref: 'Meals' }],
  date_created: { type: Date, default: Date.now() },
  date_updated: { type: Date, default: Date.now() },
});

exports.Plans = createModels('Plans')({
  name: String,
  users: [{ type: Schema.Types.ObjectId, ref: 'Users' }],
  owner: { type: Schema.Types.ObjectId, ref: 'Users' },
  meals: [{ type: Schema.Types.ObjectId, ref: 'Meals' }],
  date_created: { type: Date, default: Date.now() },
  date_updated: { type: Date, default: Date.now() },
});

const userStatics = {
  generateHash(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
  },
  async validatePassword(password, dbpassword) {
    return asyncCompare(password, dbpassword);
  },
};

exports.Users = createModelsWithMethods('Users', userStatics)({
  name: { type: String, unique: true },
  email: { type: String, unique: true },
  password: String,
  plans: [{ type: Schema.Types.ObjectId, ref: 'Plans' }],
  favorites: [{ type: Schema.Types.ObjectId, ref: 'Meals' }],
  date_created: { type: Date, default: Date.now() },
  date_updated: { type: Date, default: Date.now() },
});
