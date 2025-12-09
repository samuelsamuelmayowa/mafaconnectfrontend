const bcrypt = require("bcrypt");
const { User } = require("../models/user");
const { Order } = require("../models/Order");
const OrderItem = require("../models/OrderItem");
const { Product, LoyaltyAccount } = require("../models");
const assignTierAutomatically = require("./updateTire");
const { LoyaltyTier } = require("../models/LoyaltyTier");