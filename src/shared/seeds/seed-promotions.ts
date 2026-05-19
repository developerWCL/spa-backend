import { dataSource } from '../../config/typeorm';
import { Promotion } from '../../entities/promotions.entity';
import { Branch } from '../../entities/branch.entity';
import { PromotionDiscountType } from '../../entities/enums/entity-promotion.enum';

export async function seedPromotions() {
  const promotionRepo = dataSource.getRepository(Promotion);
  const branchRepo = dataSource.getRepository(Branch);

  const branches = await branchRepo.find();

  if (!branches.length) {
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

  // Define promotions for each branch
  const branchPromotionsConfig: {
    [branchName: string]: {
      code: string;
      name: string;
      description: string;
      discountType: PromotionDiscountType;
      discountValue: string;
      startDate: string;
      endDate: string;
      minPurchaseAmount: string | null;
      maxUsed: number;
      isActive: boolean;
    }[];
  } = {
    // 'Deevana Patong Resort & Spa': [
    //   {
    //     code: 'WELCOME20',
    //     name: 'Welcome Discount 20%',
    //     description: 'Get 20% off on your first booking',
    //     discountType: PromotionDiscountType.PERCENTAGE,
    //     discountValue: '20',
    //     startDate: tomorrow.toISOString().split('T')[0],
    //     endDate: nextMonth.toISOString().split('T')[0],
    //     minPurchaseAmount: '500',
    //     maxUsed: 100,
    //     isActive: true,
    //   },
    //   {
    //     code: 'SUMMER50',
    //     name: 'Summer Package 50% Off',
    //     description: 'Summer special - get 50% off on packages',
    //     discountType: PromotionDiscountType.PERCENTAGE,
    //     discountValue: '50',
    //     startDate: new Date(today.getFullYear(), 4, 1)
    //       .toISOString()
    //       .split('T')[0],
    //     endDate: new Date(today.getFullYear(), 7, 31)
    //       .toISOString()
    //       .split('T')[0],
    //     minPurchaseAmount: '1000',
    //     maxUsed: 200,
    //     isActive: true,
    //   },
    //   {
    //     code: 'SAVE200',
    //     name: 'Save 200 Baht',
    //     description: 'Save 200 baht on purchases over 1000 baht',
    //     discountType: PromotionDiscountType.FIXED,
    //     discountValue: '200',
    //     startDate: tomorrow.toISOString().split('T')[0],
    //     endDate: endOfYear.toISOString().split('T')[0],
    //     minPurchaseAmount: '1000',
    //     maxUsed: 300,
    //     isActive: true,
    //   },
    //   {
    //     code: 'LOYALTY15',
    //     name: 'Loyalty Member 15% Off',
    //     description: 'Special discount for loyal customers',
    //     discountType: PromotionDiscountType.PERCENTAGE,
    //     discountValue: '15',
    //     startDate: tomorrow.toISOString().split('T')[0],
    //     endDate: endOfYear.toISOString().split('T')[0],
    //     minPurchaseAmount: null,
    //     maxUsed: 500,
    //     isActive: true,
    //   },
    //   {
    //     code: 'GROUPBOOKING25',
    //     name: 'Group Booking Discount 25%',
    //     description: 'Get 25% off for group bookings of 5 or more',
    //     discountType: PromotionDiscountType.PERCENTAGE,
    //     discountValue: '25',
    //     startDate: tomorrow.toISOString().split('T')[0],
    //     endDate: endOfYear.toISOString().split('T')[0],
    //     minPurchaseAmount: '2500',
    //     maxUsed: 150,
    //     isActive: true,
    //   },
    // ],
    'Web Connection Spa - Patong Branch': [
      {
        code: 'WCP_WELCOME30',
        name: 'Welcome to WCP 30% Off',
        description:
          'Special welcome discount for new customers at Patong branch',
        discountType: PromotionDiscountType.PERCENTAGE,
        discountValue: '30',
        startDate: tomorrow.toISOString().split('T')[0],
        endDate: nextMonth.toISOString().split('T')[0],
        minPurchaseAmount: '600',
        maxUsed: 120,
        isActive: true,
      },
      {
        code: 'WCP_THAI25',
        name: 'Thai Wellness Special 25%',
        description:
          'Discount on traditional Thai massage and wellness packages',
        discountType: PromotionDiscountType.PERCENTAGE,
        discountValue: '25',
        startDate: tomorrow.toISOString().split('T')[0],
        endDate: endOfYear.toISOString().split('T')[0],
        minPurchaseAmount: '800',
        maxUsed: 200,
        isActive: true,
      },
      {
        code: 'WCP_FACIAL300',
        name: 'Facial Care Special - Save 300',
        description: 'Save 300 baht on facial and beauty treatments',
        discountType: PromotionDiscountType.FIXED,
        discountValue: '300',
        startDate: tomorrow.toISOString().split('T')[0],
        endDate: endOfYear.toISOString().split('T')[0],
        minPurchaseAmount: '1200',
        maxUsed: 180,
        isActive: true,
      },
      {
        code: 'WCP_PACKAGE35',
        name: 'Package Booking 35% Off',
        description: 'Get 35% off on spa packages at Patong location',
        discountType: PromotionDiscountType.PERCENTAGE,
        discountValue: '35',
        startDate: tomorrow.toISOString().split('T')[0],
        endDate: endOfYear.toISOString().split('T')[0],
        minPurchaseAmount: '1500',
        maxUsed: 150,
        isActive: true,
      },
      {
        code: 'WCP_RELAX400',
        name: 'Relaxation Package - Save 400',
        description: 'Save 400 baht on relaxation and aromatherapy packages',
        discountType: PromotionDiscountType.FIXED,
        discountValue: '400',
        startDate: tomorrow.toISOString().split('T')[0],
        endDate: endOfYear.toISOString().split('T')[0],
        minPurchaseAmount: '1800',
        maxUsed: 100,
        isActive: true,
      },
    ],
    'Web Connection Spa - Karon Branch': [
      {
        code: 'WCK_WELCOME35',
        name: 'Welcome to WCK 35% Off',
        description:
          'Special welcome discount for new customers at Karon branch',
        discountType: PromotionDiscountType.PERCENTAGE,
        discountValue: '35',
        startDate: tomorrow.toISOString().split('T')[0],
        endDate: nextMonth.toISOString().split('T')[0],
        minPurchaseAmount: '700',
        maxUsed: 110,
        isActive: true,
      },
      {
        code: 'WCK_DEEP20',
        name: 'Deep Recovery Therapy 20% Off',
        description: 'Deep tissue and recovery therapy special discount',
        discountType: PromotionDiscountType.PERCENTAGE,
        discountValue: '20',
        startDate: tomorrow.toISOString().split('T')[0],
        endDate: endOfYear.toISOString().split('T')[0],
        minPurchaseAmount: '1000',
        maxUsed: 250,
        isActive: true,
      },
      {
        code: 'WCK_WELLNESS500',
        name: 'Holistic Wellness - Save 500',
        description: 'Save 500 baht on holistic wellness and healing packages',
        discountType: PromotionDiscountType.FIXED,
        discountValue: '500',
        startDate: tomorrow.toISOString().split('T')[0],
        endDate: endOfYear.toISOString().split('T')[0],
        minPurchaseAmount: '1500',
        maxUsed: 120,
        isActive: true,
      },
      {
        code: 'WCK_COUPLES40',
        name: 'Couples Special 40% Off',
        description: 'Romantic couples packages at special 40% discount',
        discountType: PromotionDiscountType.PERCENTAGE,
        discountValue: '40',
        startDate: tomorrow.toISOString().split('T')[0],
        endDate: endOfYear.toISOString().split('T')[0],
        minPurchaseAmount: '2000',
        maxUsed: 100,
        isActive: true,
      },
      {
        code: 'WCK_PREMIUM600',
        name: 'Premium Therapy - Save 600',
        description:
          'Save 600 baht on premium healing and therapeutic treatments',
        discountType: PromotionDiscountType.FIXED,
        discountValue: '600',
        startDate: tomorrow.toISOString().split('T')[0],
        endDate: endOfYear.toISOString().split('T')[0],
        minPurchaseAmount: '2500',
        maxUsed: 80,
        isActive: true,
      },
    ],
  };

  // Seed promotions for each branch
  for (const branch of branches) {
    const branchPromotions = branchPromotionsConfig[branch.name];

    if (!branchPromotions) {
      console.log(`No promotions config found for branch '${branch.name}'`);
      continue;
    }

    for (const promotionData of branchPromotions) {
      const existingPromotion = await promotionRepo.findOne({
        where: { code: promotionData.code, branch: { id: branch.id } },
      });

      if (!existingPromotion) {
        const promotion = promotionRepo.create({
          code: promotionData.code,
          name: promotionData.name,
          description: promotionData.description,
          discountType: promotionData.discountType,
          discountValue: promotionData.discountValue,
          startDate: promotionData.startDate,
          endDate: promotionData.endDate,
          minPurchaseAmount: promotionData.minPurchaseAmount,
          maxUsed: promotionData.maxUsed,
          branch,
          used: 0,
        });
        await promotionRepo.save(promotion);
        console.log(
          `Promotion '${promotionData.name}' (${promotionData.code}) created for branch '${branch.name}'`,
        );
      } else {
        console.log(
          `Promotion '${promotionData.code}' already exists for branch '${branch.name}'`,
        );
      }
    }
  }
}
