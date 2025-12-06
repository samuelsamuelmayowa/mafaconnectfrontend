const { User } = require('./models/user');
(async () => {
  const user = await User.findOne({ where: { account_number: '00000032' } });
  console.log(user ? user.toJSON() : 'not found');
})();




ALTER TABLE reward_redemptions 
MODIFY COLUMN status ENUM('pending','used','cancelled','expired') DEFAULT 'pending';


ALTER TABLE loyalty_accounts 
ADD COLUMN tier_id INT UNSIGNED NULL AFTER points_balance;


ALTER TABLE loyalty_accounts 
ADD COLUMN tier_id INT UNSIGNED NULL AFTER points_balance;


UPDATE loyalty_accounts SET tier_id = 1 WHERE points_balance BETWEEN 1 AND 500;
UPDATE loyalty_accounts SET tier_id = 2 WHERE points_balance BETWEEN 501 AND 1000;
UPDATE loyalty_accounts SET tier_id = 3 WHERE points_balance >= 1001;
