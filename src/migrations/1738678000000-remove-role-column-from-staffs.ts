import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class RemoveRoleColumnFromStaffs1738678000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Drop the role column from staffs
    const table = await queryRunner.getTable('staffs');
    if (table?.columns.find((c) => c.name === 'role')) {
      await queryRunner.dropColumn('staffs', 'role');
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Add back the role column
    await queryRunner.addColumn(
      'staffs',
      new TableColumn({
        name: 'role',
        type: 'varchar',
        isNullable: true,
      }),
    );
  }
}
