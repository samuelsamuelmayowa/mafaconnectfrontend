"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("invoices", "issue_date", {
      type: Sequelize.DATE,
      allowNull: true,
    });

    await queryInterface.addColumn("invoices", "due_date", {
      type: Sequelize.DATE,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("invoices", "issue_date");
    await queryInterface.removeColumn("invoices", "due_date");
  },
};
