const { AuthenticationError } = require('apollo-server-express');
const {
  Groceries, Meals, Tags, Plans, Users,
} = require('../db/Models');
const { sign } = require('../util/jwt');

async function favorite({ meal, user }) {
  const updatedMeal = await Meals.findByIdAndUpdate({ id: meal }, { $push: { favorites: user } });
  const updatedUser = await Users.findByIdAndUpdate({ id: user }, { $push: { favorites: meal } });
  return {
    meal: updatedMeal,
    user: updatedUser,
  };
}

async function createGrocery({ name, items, user }) {
  const grocery = new Groceries({
    name,
    owner: user.id,
    items,
  });
  return grocery.save();
}

async function createMeals({
  name, items, tags, user,
}) {
  const meal = new Meals({
    name,
    owner: user.id,
    items,
    tags,
  });
  return meal.save().then(async (m) => {
    if (m.tags) {
      m.tags.map(async (tag) => {
        const existingTag = await Tags.findOne({ tag });
        if (existingTag) {
          await Tags.findByIdAndUpdate(existingTag.id, { $push: { meals: m.id } });
        } else {
          const newTag = new Tags({ tag, meals: [m.id] });
          await newTag.save();
        }
      });
    }
    return m;
  });
}

async function createPlans({ name, meals, user }) {
  const plan = new Plans({
    name,
    owner: user.id,
    meals,
  });
  return plan.save();
}

async function createUser({ name: uName, password, email: uEmail }) {
  const hashpass = Users.generateHash(password);
  const user = new Users({
    name: uName,
    password: hashpass,
    email: uEmail,
  });
  const {
    name, email, plans, favorites, id,
  } = await user.save();
  return {
    jwt: sign({
      name, email, plans, favorites, id,
    }),
  };
}

async function loginUser({ name: uName, password }) {
  const thisUser = await Users.findOne({ name: uName });
  const isValid = await Users.validatePassword(password, thisUser.password);
  if (isValid) {
    const {
      name, email, plans, favorites, id,
    } = thisUser;
    return {
      jwt: sign({
        name, email, plans, favorites, id,
      }),
    };
  }
  return {};
}

module.exports = {
  Query: {
    async groceries(parent, args, { user }) {
      if (!user) return [];
      return Groceries.find({
        $or: [
          { owner: user.id }, { users: { $elemMatch: { $eq: user.id } } },
        ],
      });
    },

    async grocery(parent, { key, value }) {
      return Groceries.findOne({ [key]: value });
    },

    async meals(parent, args, { user }) {
      if (!user) return [];
      return Meals.find({ $or: [{ owner: user.id }, { users: { $elemMatch: { $eq: user.id } } }] });
    },

    async meal(parent, { key, value }) {
      return Meals.findOne({ [key]: value });
    },

    async plans(parent, args, { user }) {
      if (!user) return [];
      return Plans.find({ $or: [{ owner: user.id }, { users: { $elemMatch: { $eq: user.id } } }] });
    },

    async plan(parent, { key, value }) {
      return Plans.findOne({ [key]: value });
    },

    async tags() {
      return Tags.find();
    },

    async tag(parent, { key, value }) {
      return Tags.findOne({ [key]: value }).populate('meals');
    },
  },

  Mutation: {
    async addGrocery(parent, args, { user }) {
      if (!user) throw new AuthenticationError('Must be logged in');
      return createGrocery({ ...args, user });
    },

    async addMeal(parent, args, { user }) {
      if (!user) throw new AuthenticationError('Must be logged in');
      return createMeals({ ...args, user });
    },

    async addPlan(parent, args, { user }) {
      if (!user) throw new AuthenticationError('Must be logged in');
      return createPlans({ ...args, user });
    },

    async login(parent, args) {
      return loginUser(args);
    },

    async createUser(parent, args) {
      return createUser(args);
    },

    async favorite(parent, args, { user }) {
      if (!user) throw new AuthenticationError('Must be logged in');
      return favorite(args);
    },
  },
};
