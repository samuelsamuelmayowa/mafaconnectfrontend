await LoyaltyActivity.create({
  customer_id,
  type: "earned",
  points: +pointsAwarded,
  description: `${kg}KG Rice Purchase`
});

await LoyaltyActivity.create({
  customer_id,
  type: "redemption",
  points: -pointsUsed,
  description: `Redeemed for product ${productName}`
});

await LoyaltyActivity.create({
  customer_id,
  type: "refund",
  points: +pointsUsed,
  description: `Refunded — redemption not approved`
});




my order showing overview  ... on my order dashboard , status 
// total earnd point ,collect lifetime








I can generate the full backend loyalty API to match this dashboard:

✅ /api/loyalty/:id
✅ /api/loyalty/redeem-request
✅ /api/loyalty/admin/pending
✅ /api/loyalty/admin/approve/:id
✅ /api/loyalty/admin/reject/:id
✅ /api/loyalty/history/:id



Admin 
GET     /api/loyalty/tiers
POST    /api/loyalty/tiers
PUT     /api/loyalty/tiers/:id
DELETE  /api/loyalty/tiers/:id
PATCH   /api/loyalty/tiers/:id/status

Your React Hook expects these Node.js routes:

1️⃣ GET all redemptions

GET /api/loyalty/redemptions

2️⃣ Mark redemption as used

PUT /api/loyalty/redemptions/:id/use

3️⃣ Cancel redemption + refund points

PUT /api/loyalty/redemptions/:id/cancel




Your Node.js API needs:

GET config
GET /api/loyalty/config

UPDATE config
PUT /api/loyalty/config

Backend API You Need

Your React hook expects this backend route:

GET
GET /api/loyalty/expiring-points/:customerId




📌 Your Backend Endpoints (Expected)

Your API must have endpoints like:

GET /api/loyalty/history?accountId=123&type=earn&startDate=...&endDate=...&page=0&pageSize=20

→ returns paginated transactions

GET /api/loyalty/history/summary?accountId=123

→ returns lifetime stats

If you haven’t created them, I can generate them after this.


Want the backend code too?

I can generate:

✅ /loyalty/history
✅ /loyalty/history/recent
✅ /loyalty/history/summary



What Backend Routes You Need
GET User’s Past Redemptions
GET /loyalty/rewards/redemptions/:customerId











exports.approveRedemption = async (req, res) => {
  const { id } = req.params;

  const redemption = await RewardRedemption.findByPk(id, { include: [Reward] });
  if (!redemption) return res.status(404).json({ message: "Redemption not found" });

  redemption.status = "approved";
  redemption.used_at = new Date();

  await redemption.save();
  return res.json({ success: true, message: "Redemption approved", redemption });
};


exports.rejectRedemption = async (req, res) => {
  const { id } = req.params;

  const redemption = await RewardRedemption.findByPk(id);
  if (!redemption) return res.status(404).json({ message: "Not found" });

  const account = await LoyaltyAccount.findByPk(redemption.loyalty_account_id);

  account.points_balance += redemption.points_spent;
  await account.save();

  redemption.status = "rejected";
  redemption.used_at = null;
  await redemption.save();

  return res.json({ success: true, message: "Redemption rejected — points refunded", redemption });
};
