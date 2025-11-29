const { sequelize } = require("./db.js");

await queryInterface.addColumn("invoices", "issue_date", {
  type: sequelize.DATE,
  allowNull: true
});

await queryInterface.addColumn("invoices", "due_date", {
  type: sequelize.DATE,
  allowNull: true
});
