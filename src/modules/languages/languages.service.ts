import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Language } from 'src/entities/language.entity';

@Injectable()
export class LanguagesService {
  constructor(
    @InjectRepository(Language)
    private languageRepo: Repository<Language>,
  ) {}

  async findAll(onlyActive: boolean = true) {
    const query = this.languageRepo.createQueryBuilder('language');

    if (onlyActive) {
      query.where('language.isActive = :isActive', { isActive: true });
    }

    query
      .andWhere('language.deletedAt IS NULL')
      .orderBy('language.isPrimary', 'DESC')
      .addOrderBy('language.name', 'ASC');

    return await query.getMany();
  }

  async findById(id: string) {
    const language = await this.languageRepo
      .createQueryBuilder('language')
      .where('language.id = :id', { id })
      .andWhere('language.deletedAt IS NULL')
      .getOne();

    if (!language) {
      throw new NotFoundException(`Language with ID ${id} not found`);
    }

    return language;
  }

  async findByCode(code: string) {
    const language = await this.languageRepo
      .createQueryBuilder('language')
      .where('language.code = :code', { code })
      .andWhere('language.deletedAt IS NULL')
      .getOne();

    if (!language) {
      throw new NotFoundException(`Language with code ${code} not found`);
    }

    return language;
  }

  async getPrimaryLanguage() {
    const language = await this.languageRepo
      .createQueryBuilder('language')
      .where('language.isPrimary = :isPrimary', { isPrimary: true })
      .andWhere('language.isActive = :isActive', { isActive: true })
      .andWhere('language.deletedAt IS NULL')
      .getOne();

    if (!language) {
      throw new NotFoundException('No primary language found');
    }

    return language;
  }

  async getActiveLanguages() {
    return await this.findAll(true);
  }
}
