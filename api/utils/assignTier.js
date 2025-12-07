async function updateTier(loyaltyAccount, LoyaltyTier) {
  const tiers = await LoyaltyTier.findAll({
    order: [["min_points", "ASC"]]
  });

  for (const tier of tiers) {
    const withinMin = loyaltyAccount.points_balance >= tier.min_points;
    const withinMax = tier.max_points === null || loyaltyAccount.points_balance <= tier.max_points;

    if (withinMin && withinMax) {
      if (loyaltyAccount.tier_id !== tier.id) {
        loyaltyAccount.tier_id = tier.id;   // <--- updates DB column tier_id
        await loyaltyAccount.save();
      }
      return tier.name;
    }
  }

  return "No Tier";
}

module.exports = { updateTier };