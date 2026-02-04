import {
  MigrationInterface,
  QueryRunner,
  TableColumn,
  TableForeignKey,
  Table,
} from 'typeorm';

export class ChangeStaffBranchToManyToMany1738677000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Drop the existing foreign key constraint
    const table = await queryRunner.getTable('staffs');
    const branchForeignKey = table?.foreignKeys.find(
      (fk) => fk.columnNames.indexOf('branch_id') !== -1,
    );
    if (branchForeignKey) {
      await queryRunner.dropForeignKey('staffs', branchForeignKey);
    }

    // Drop the branch_id column from staffs
    if (table?.columns.find((c) => c.name === 'branch_id')) {
      await queryRunner.dropColumn('staffs', 'branch_id');
    }

    // Create the staff_branches junction table
    await queryRunner.createTable(
      new Table({
        name: 'staff_branches',
        columns: [
          {
            name: 'staffId',
            type: 'uuid',
            isPrimary: true,
          },
          {
            name: 'branchId',
            type: 'uuid',
            isPrimary: true,
          },
        ],
        foreignKeys: [
          {
            columnNames: ['staffId'],
            referencedColumnNames: ['id'],
            referencedTableName: 'staffs',
            onDelete: 'CASCADE',
          },
          {
            columnNames: ['branchId'],
            referencedColumnNames: ['id'],
            referencedTableName: 'branch',
            onDelete: 'CASCADE',
          },
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop the staff_branches table
    await queryRunner.dropTable('staff_branches');

    // Add back the branch_id column
    await queryRunner.addColumn(
      'staffs',
      new TableColumn({
        name: 'branch_id',
        type: 'uuid',
        isNullable: true,
      }),
    );

    // Add back the foreign key
    await queryRunner.createForeignKey(
      'staffs',
      new TableForeignKey({
        columnNames: ['branch_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'branch',
        onDelete: 'CASCADE',
      }),
    );
  }
}
