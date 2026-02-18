import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, DataSource, EntityManager } from 'typeorm';
import { Package } from 'src/entities/packages.entity';
import { SubService } from 'src/entities/sub_services.entity';
import { PackageTranslation } from 'src/entities/package_translation.entity';
import { Branch } from 'src/entities/branch.entity';
import { Media } from 'src/entities/media.entity';
import { EntityStatus } from 'src/entities/enums/entity-status.enum';
import {
  paginate,
  getPaginationQueryTypeORM,
} from 'src/shared/pagination.util';
import { PaginationParams } from 'src/shared/pagination.types';
import { CreatePackageDto, UpdatePackageDto } from './packages.types';

@Injectable()
export class PackagesService {
  constructor(
    @InjectRepository(Package)
    private packageRepo: Repository<Package>,
    @InjectRepository(SubService)
    private subServiceRepo: Repository<SubService>,
    @InjectRepository(PackageTranslation)
    private packageTranslationRepo: Repository<PackageTranslation>,
    @InjectRepository(Branch)
    private branchRepo: Repository<Branch>,
    @InjectRepository(Media)
    private mediaRepo: Repository<Media>,
    private dataSource: DataSource,
  ) {}

  async create(dto: CreatePackageDto) {
    return this.dataSource.transaction(async (manager: EntityManager) => {
      // Validate branch exists
      const branch = await manager.findOne(Branch, {
        where: { id: dto.branchId },
      });
      if (!branch) {
        throw new NotFoundException(`Branch with ID ${dto.branchId} not found`);
      }

      // Validate and filter sub-services (only active)
      if (!dto.subServiceIds || dto.subServiceIds.length === 0) {
        throw new BadRequestException(
          'Package must have at least 1 sub-service',
        );
      }

      if (dto.subServiceIds.length > 10) {
        throw new BadRequestException(
          'Package can have at most 10 sub-services',
        );
      }

      const subServices = await manager.find(SubService, {
        where: {
          id: In(dto.subServiceIds),
          status: EntityStatus.ACTIVE,
        },
      });

      if (subServices.length === 0) {
        throw new BadRequestException(
          'No active sub-services found with provided IDs',
        );
      }

      if (subServices.length < dto.subServiceIds.length) {
        const foundIds = new Set(subServices.map((s) => s.id));
        const missingIds = dto.subServiceIds.filter((id) => !foundIds.has(id));
        throw new BadRequestException(
          `Some sub-services are inactive or not found: ${missingIds.join(', ')}`,
        );
      }

      // Create package
      const pkg = new Package();
      pkg.branch = branch;
      pkg.name = dto.name;
      pkg.price = dto.price;
      pkg.startDate = new Date(dto.startDate);
      pkg.endDate = new Date(dto.endDate);
      pkg.status = dto.status || EntityStatus.ACTIVE;
      pkg.subServices = subServices;

      const savedPackage = await manager.save(pkg);

      // Handle media associations
      if (dto.mediaIds && dto.mediaIds.length > 0) {
        const mediaList = await manager.find(Media, {
          where: { id: In(dto.mediaIds) },
        });

        for (const media of mediaList) {
          media.package = savedPackage;
          await manager.save(media);
        }
      }

      // Create translations
      if (dto.translations && dto.translations.length > 0) {
        const translations = dto.translations.map((t) => {
          const translation = new PackageTranslation();
          translation.package = savedPackage;
          translation.languageCode = t.languageCode;
          translation.name = t.name;
          translation.description = t.description;
          return translation;
        });
        await manager.save(translations);
      }

      return manager.findOne(Package, {
        where: { id: savedPackage.id },
        relations: ['subServices', 'translations', 'media', 'branch'],
      });
    });
  }

  async findAll(
    branchId: string,
    filters?: {
      search?: string;
      status?: EntityStatus;
    },
    paginationParams?: PaginationParams,
  ) {
    const query = this.packageRepo
      .createQueryBuilder('pkg')
      .leftJoinAndSelect('pkg.subServices', 'subServices')
      .leftJoinAndSelect('subServices.service', 'service')
      .leftJoinAndSelect('pkg.translations', 'translations')
      .leftJoinAndSelect('pkg.media', 'media')
      .leftJoinAndSelect('pkg.branch', 'branch')
      .where('pkg.branchId = :branchId', { branchId });

    if (filters?.search) {
      query.andWhere('pkg.name ILIKE :search', {
        search: `%${filters.search}%`,
      });
    }

    if (filters?.status) {
      query.andWhere('pkg.status = :status', { status: filters.status });
    }

    query.orderBy('pkg.createdAt', 'DESC');

    const paginationQuery = getPaginationQueryTypeORM(paginationParams);
    const [data, total] = await query
      .skip(paginationQuery.skip)
      .take(paginationQuery.take)
      .getManyAndCount();

    return paginate(paginationParams || {}, total, data);
  }

  async findOne(id: string) {
    const pkg = await this.packageRepo.findOne({
      where: { id },
      relations: ['subServices', 'translations', 'media', 'branch'],
    });

    if (!pkg) {
      throw new NotFoundException(`Package with ID ${id} not found`);
    }

    return pkg;
  }

  async update(id: string, dto: UpdatePackageDto) {
    return this.dataSource.transaction(async (manager: EntityManager) => {
      const pkg = await manager.findOne(Package, {
        where: { id },
        relations: ['subServices', 'translations', 'media'],
      });

      if (!pkg) {
        throw new NotFoundException(`Package with ID ${id} not found`);
      }

      // Update basic fields
      if (dto.name !== undefined) pkg.name = dto.name;
      if (dto.price !== undefined) pkg.price = dto.price;
      if (dto.startDate !== undefined) pkg.startDate = new Date(dto.startDate);
      if (dto.endDate !== undefined) pkg.endDate = new Date(dto.endDate);
      if (dto.status !== undefined) pkg.status = dto.status;

      // Update sub-services if provided
      if (dto.subServiceIds !== undefined) {
        if (dto.subServiceIds.length === 0) {
          throw new BadRequestException(
            'Package must have at least 1 sub-service',
          );
        }

        if (dto.subServiceIds.length > 10) {
          throw new BadRequestException(
            'Package can have at most 10 sub-services',
          );
        }

        const subServices = await manager.find(SubService, {
          where: {
            id: In(dto.subServiceIds),
            status: EntityStatus.ACTIVE,
          },
        });

        if (subServices.length === 0) {
          throw new BadRequestException(
            'No active sub-services found with provided IDs',
          );
        }

        if (subServices.length < dto.subServiceIds.length) {
          const foundIds = new Set(subServices.map((s) => s.id));
          const missingIds = dto.subServiceIds.filter(
            (id) => !foundIds.has(id),
          );
          throw new BadRequestException(
            `Some sub-services are inactive or not found: ${missingIds.join(', ')}`,
          );
        }

        pkg.subServices = subServices;
      }

      const updatedPackage = await manager.save(pkg);

      // Update media if provided
      if (dto.mediaIds !== undefined) {
        // Remove old media associations
        for (const media of pkg.media) {
          media.package = null;
          await manager.save(media);
        }

        // Add new media associations
        if (dto.mediaIds.length > 0) {
          const mediaList = await manager.find(Media, {
            where: { id: In(dto.mediaIds) },
          });

          for (const media of mediaList) {
            media.package = updatedPackage;
            await manager.save(media);
          }
        }
      }

      // Update translations if provided
      if (dto.translations !== undefined) {
        // Remove old translations
        await manager.delete(PackageTranslation, { package: updatedPackage });

        // Add new translations
        if (dto.translations.length > 0) {
          const translations = dto.translations.map((t) => {
            const translation = new PackageTranslation();
            translation.package = updatedPackage;
            translation.languageCode = t.languageCode;
            translation.name = t.name;
            translation.description = t.description;
            return translation;
          });
          await manager.save(translations);
        }
      }

      return manager.findOne(Package, {
        where: { id: updatedPackage.id },
        relations: ['subServices', 'translations', 'media', 'branch'],
      });
    });
  }

  async delete(id: string) {
    const pkg = await this.packageRepo.findOne({
      where: { id },
    });

    if (!pkg) {
      throw new NotFoundException(`Package with ID ${id} not found`);
    }

    await this.packageRepo.softRemove(pkg);
    return { id, message: 'Package deleted successfully' };
  }

  async getActiveSubServices(packageId: string) {
    const pkg = await this.packageRepo.findOne({
      where: { id: packageId },
      relations: ['subServices'],
    });

    if (!pkg) {
      throw new NotFoundException(`Package with ID ${packageId} not found`);
    }

    // Filter only active sub-services
    return pkg.subServices.filter(
      (subService) => subService.status === EntityStatus.ACTIVE,
    );
  }
}
