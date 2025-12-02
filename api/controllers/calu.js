function calculatePointsFromOrder(order) {
  let totalPoints = 0;

  if (!order.items || order.items.length === 0) return 0;

  for (const item of order.items) {
    const kg = item.product?.bag_size_kg || 0;
    const qty = item.quantity || 0;
    totalPoints += kg * qty;
  }

  return totalPoints;
}

module.exports = { calculatePointsFromOrder };

// function calculatePointsFromOrder(order) {
//   let totalPoints = 0;

//   if (!order.items || order.items.length === 0) return 0;

//   for (const item of order.items) {
//     const kg = item.product?.bag_size_kg || 0;
//     const qty = item.quantity || 0;
//     totalPoints += kg * qty;
//   }

//   return totalPoints;
// }

// module.exports = { calculatePointsFromOrder };

// /**
//  * Calculate loyalty points based on product bag sizes.
//  * 
//  * - 3kg → 3 points
//  * - 5kg → 5 points
//  * - 25kg → 25 points
//  * - 50kg → 50 points
//  */
// function calculatePointsFromOrderItems(orderItems) {
//   let totalPoints = 0;

//   if (!Array.isArray(orderItems)) {
//     console.error("orderItems is not an array:", orderItems);
//     return 0;
//   }

//   for (const item of orderItems) {
//     const product = item.product;

//     if (!product) continue;

//     const kg = product.bag_size_kg || 0;
//     const qty = item.quantity || 0;

//     totalPoints += kg * qty; // 🎯 points = kg × quantity
//   }

//   return totalPoints;
// }

// module.exports = { calculatePointsFromOrderItems };
