const USER_ROLES = ['farmer', 'buyer', 'admin'];
const BUYER_TYPES = ['market_vendor', 'resort', 'restaurant', 'hotel', 'supermarket', 'caterer', 'exporter', 'other'];
const LISTING_STATUSES = ['available', 'low_stock', 'sold_out'];
const ORDER_STATUSES = [
  'pending',
  'accepted',
  'counter_offered',
  'rejected',
  'preparing',
  'ready_for_pickup',
  'out_for_delivery',
  'delivered',
  'completed',
  'cancelled'
];
const QUALITY_GRADES = ['premium', 'grade_a', 'grade_b', 'processing'];
const SUPPLY_FREQUENCIES = ['none', 'weekly', 'monthly'];

module.exports = {
  USER_ROLES,
  BUYER_TYPES,
  LISTING_STATUSES,
  ORDER_STATUSES,
  QUALITY_GRADES,
  SUPPLY_FREQUENCIES
};
