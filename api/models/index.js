const { Product } = require("./products");
const { ProductImage } = require("./productimages");
const { User } = require("./user");
const { ProductLocationStock } = require("./ProductLocationStock");
const { Location } = require("./Location");
const { LocationProductStock } = require("./LocationProductStock");

// Relations
Location.belongsToMany(Product, {
  through: LocationProductStock,
  foreignKey: "location_id",
  as: "products"
});
Product.belongsToMany(Location, {
  through: LocationProductStock,
  foreignKey: "product_id",
  as: "locations"
})

// Product → Images
Product.hasMany(ProductImage, { foreignKey: "product_id", as: "images" });
ProductImage.belongsTo(Product, { foreignKey: "product_id" });

// Product → Creator
Product.belongsTo(User, { foreignKey: "created_by", as: "creator" });
// User → Location
User.belongsTo(Location, { foreignKey: "location_id", as: "location" });
Location.hasMany(User, { foreignKey: "location_id", as: "staff" });

// Product → Location → Stock
Product.hasMany(ProductLocationStock, { foreignKey: "product_id", as: "locationStocks" });
Location.hasMany(ProductLocationStock, { foreignKey: "location_id", as: "stocks" });

ProductLocationStock.belongsTo(Product, { foreignKey: "product_id", as: "product" });
ProductLocationStock.belongsTo(Location, { foreignKey: "location_id", as: "location" });
module.exports = {
  Product,
  ProductImage,
  Location,
  ProductLocationStock,
  User,
};
