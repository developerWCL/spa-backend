import { dataSource } from '../../config/typeorm';
import { Branch } from '../../entities/branch.entity';

export async function updateBranchCodes() {
  const branchRepository = dataSource.getRepository(Branch);

  const branchCodeMap: { [key: string]: string } = {
    'Patong Phuket': 'OS-PPT',
    'Deevana Patong Resort & Spa': 'OS-DPR',
    'Ramada by Wyndham Phuket Deevana Patong': 'OS-RPD',
    'Deevana Plaza Phuket Patong': 'OS-DPP',
    'Deevana Plaza Krabi Aonang': 'OS-DPK',
  };

  try {
    const branches = await branchRepository.find();

    for (const branch of branches) {
      const branchName = branch.name;
      const newCode = branchCodeMap[branchName];

      if (newCode) {
        console.log(`Updating ${branch.name} code to ${newCode}`);
        await branchRepository.update(
          { id: branch.id },
          { branchCode: newCode },
        );
      } else {
        console.log(`⚠️  No code mapping found for branch: ${branch.name}`);
      }
    }

    console.log('✅ Branch codes updated successfully!');
  } catch (error) {
    console.error('❌ Error updating branch codes:', error);
    throw error;
  }
}
