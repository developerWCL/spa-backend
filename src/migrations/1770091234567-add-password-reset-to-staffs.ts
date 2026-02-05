import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddPasswordResetToStaffs1770091234567 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'staffs',
      new TableColumn({
        name: 'password_reset_token',
        type: 'varchar',
        isNullable: true,
      }),
    );

    await queryRunner.addColumn(
      'staffs',
      new TableColumn({
        name: 'password_reset_expires',
        type: 'timestamp',
        isNullable: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('staffs', 'password_reset_expires');
    await queryRunner.dropColumn('staffs', 'password_reset_token');
  }
}
