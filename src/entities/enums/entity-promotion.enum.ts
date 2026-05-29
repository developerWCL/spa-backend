export enum PromotionDiscountType {
  PERCENTAGE = 'percentage',
  FIXED = 'fixed',
}

export enum PromotionActiveDay {
  SUNDAY = 'sunday',
  MONDAY = 'monday',
  TUESDAY = 'tuesday',
  WEDNESDAY = 'wednesday',
  THURSDAY = 'thursday',
  FRIDAY = 'friday',
  SATURDAY = 'saturday',
}

export enum PromotionDayActivated {
  BOOKING_DAY = 'booking_day',
  SERVICE_DAY = 'service_day',
}

export enum PromotionGuestType {
  ALL_GUESTS = 'all_guests',
  AUTHENTICATED_ONLY = 'authenticated_only',
}
