import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class UpdateStaffDayoffReasonToEnumAndAddNote1770091234568 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Drop the existing reason column
    await queryRunner.dropColumn('staff_dayoffs', 'reason');

    // Add new reason column with enum type
    await queryRunner.addColumn(
      'staff_dayoffs',
      new TableColumn({
        name: 'reason',
        type: 'enum',
        enum: [
          'sick_leave',
          'personal',
          'vacation',
          'medical_appointment',
          'family_emergency',
          'other',
        ],
        default: "'other'",
        isNullable: false,
      }),
    );

    // Add note column
    await queryRunner.addColumn(
      'staff_dayoffs',
      new TableColumn({
        name: 'note',
        type: 'text',
        isNullable: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop the note column
    await queryRunner.dropColumn('staff_dayoffs', 'note');

    // Drop the enum reason column
    await queryRunner.dropColumn('staff_dayoffs', 'reason');

    // Add back the original string reason column
    await queryRunner.addColumn(
      'staff_dayoffs',
      new TableColumn({
        name: 'reason',
        type: 'varchar',
        isNullable: true,
      }),
    );
  }
}
