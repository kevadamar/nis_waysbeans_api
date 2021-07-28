'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert(
      'user',
      [
        {
          fullname: 'administrator mantap',
          email: 'admin@gmail.com',
          password:
            '$2b$10$BgavYsAap0YsuxjQCymVv.icp76/qx6Wf6nzkWCqXYiaL2sX7QOHu', // 12345678
          role_id: 1,
        },
        {
          fullname: 'Keva Damar Galih',
          email: 'kevadamarg@gmail.com',
          password:
            '$2b$10$BgavYsAap0YsuxjQCymVv.icp76/qx6Wf6nzkWCqXYiaL2sX7QOHu', // 12345678
          role_id: 2,
        },
      ],
      {},
    );
  },

  down: async (queryInterface, Sequelize) => {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
  },
};
