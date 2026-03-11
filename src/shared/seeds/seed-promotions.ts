import { dataSource } from '../../config/typeorm';
import { Promotion } from '../../entities/promotions.entity';
import { Branch } from '../../entities/branch.entity';
import { PromotionDiscountType } from '../../entities/enums/entity-promotion.enum';

export async function seedPromotions() {
  const promotionRepo = dataSource.getRepository(Promotion);
  const branchRepo = dataSource.getRepository(Branch);

  const branch = await branchRepo.findOne({ where: {} });

  if (!branch) {
    console.log('No branch found. Please run seed-branches first.');
    return;
  }

  const today = new Date();
  const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
  const nextMonth = new Date(
    today.getFullYear(),
    today.getMonth() + 1,
    today.getDate(),
  );
  const endOfYear = new Date(today.getFullYear(), 11, 31);

  const promotions = [
    {
      code: 'WELCOME20',
      name: 'Welcome Discount 20%',
      description: 'Get 20% off on your first booking',
      discountType: PromotionDiscountType.PERCENTAGE,
      discountValue: '20',
      startDate: tomorrow.toISOString().split('T')[0],
      endDate: nextMonth.toISOString().split('T')[0],
      minPurchaseAmount: '500',
      maxUsed: 100,
      isActive: true,
    },
    {
      code: 'SUMMER50',
      name: 'Summer Package 50% Off',
      description: 'Summer special - get 50% off on packages',
      discountType: PromotionDiscountType.PERCENTAGE,
      discountValue: '50',
      startDate: new Date(today.getFullYear(), 4, 1)
        .toISOString()
        .split('T')[0],
      endDate: new Date(today.getFullYear(), 7, 31).toISOString().split('T')[0],
      minPurchaseAmount: '1000',
      maxUsed: 200,
      isActive: true,
    },
    {
      code: 'SAVE200',
      name: 'Save 200 Baht',
      description: 'Save 200 baht on purchases over 1000 baht',
      discountType: PromotionDiscountType.FIXED,
      discountValue: '200',
      startDate: tomorrow.toISOString().split('T')[0],
      endDate: endOfYear.toISOString().split('T')[0],
      minPurchaseAmount: '1000',
      maxUsed: 300,
      isActive: true,
    },
    {
      code: 'LOYALTY15',
      name: 'Loyalty Member 15% Off',
      description: 'Special discount for loyal customers',
      discountType: PromotionDiscountType.PERCENTAGE,
      discountValue: '15',
      startDate: tomorrow.toISOString().split('T')[0],
      endDate: endOfYear.toISOString().split('T')[0],
      minPurchaseAmount: null,
      maxUsed: 500,
      isActive: true,
    },
    {
      code: 'GROUPBOOKING25',
      name: 'Group Booking Discount 25%',
      description: 'Get 25% off for group bookings of 5 or more',
      discountType: PromotionDiscountType.PERCENTAGE,
      discountValue: '25',
      startDate: tomorrow.toISOString().split('T')[0],
      endDate: endOfYear.toISOString().split('T')[0],
      minPurchaseAmount: '2500',
      maxUsed: 150,
      isActive: true,
    },
  ];

  for (const promotionData of promotions) {
    const existingPromotion = await promotionRepo.findOne({
      where: { code: promotionData.code },
    });

    if (!existingPromotion) {
      const promotion = promotionRepo.create({
        ...promotionData,
        branch,
        used: 0,
      });
      await promotionRepo.save(promotion);
      console.log(
        `Promotion '${promotionData.name}' (${promotionData.code}) seeded successfully`,
      );
    } else {
      console.log(`Promotion '${promotionData.code}' already exists`);
    }
  }
}
