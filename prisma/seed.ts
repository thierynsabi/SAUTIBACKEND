import { PrismaClient, Role, IssueStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  const passwordHash = await bcrypt.hash('password123', 10);

  // --- Regions ---
  const mbeya = await prisma.region.upsert({
    where: { name: 'Mbeya' },
    update: {},
    create: { name: 'Mbeya' },
  });
  const regionIds = { mbeya: mbeya.id };

  // --- Districts ---
  const mbeyaCity = await prisma.district.upsert({
    where: { name_regionId: { name: 'Mbeya City', regionId: regionIds.mbeya } },
    update: {},
    create: { name: 'Mbeya City', regionId: regionIds.mbeya },
  });
  const districtIds = { mbeyaCity: mbeyaCity.id };

  // --- Constituencies ---
  const mbeyaTown = await prisma.constituency.upsert({
    where: { name_districtId: { name: 'Mbeya Town', districtId: districtIds.mbeyaCity } },
    update: {},
    create: { name: 'Mbeya Town', districtId: districtIds.mbeyaCity },
  });
  const constituencyIds = { mbeyaTown: mbeyaTown.id };

  // --- Wards (Mbeya Town wards) ---
  const wardNames = [
    'Iganjo', 'Ilembo', 'Itagano', 'Iwambi', 'Iyela',
    'Mabatini', 'Maendeleo', 'Mwasenga', 'Nsoho', 'Ruanda',
    'Sisya', 'Tembela', 'Uyole',
  ];

  const wardIds: Record<string, string> = {};
  for (const name of wardNames) {
    const ward = await prisma.ward.upsert({
      where: { name_constituencyId: { name, constituencyId: constituencyIds.mbeyaTown } },
      update: {},
      create: { name, constituencyId: constituencyIds.mbeyaTown },
    });
    wardIds[name] = ward.id;
  }
  console.log(`Seeded ${wardNames.length} wards for Mbeya Town.`);

  // --- Users ---
  const adminUser = await prisma.user.upsert({
    where: { phoneNumber: '+255712000000' },
    update: {},
    create: {
      fullName: 'System Admin',
      phoneNumber: '+255712000000',
      passwordHash,
      role: Role.ADMIN,
      wardId: wardIds['Iyela'],
    },
  });

  const mpUser = await prisma.user.upsert({
    where: { phoneNumber: '+255712000001' },
    update: {},
    create: {
      fullName: 'Dkt. Amina Juma',
      phoneNumber: '+255712000001',
      passwordHash,
      role: Role.MP,
      wardId: wardIds['Mabatini'],
    },
  });

  const citizenUsers = [
    { fullName: 'Juma Mushi', phoneNumber: '+255712000002', wardId: wardIds['Iyela'] },
    { fullName: 'Mariam Ali', phoneNumber: '+255712000003', wardId: wardIds['Mabatini'] },
    { fullName: 'Hamza Omari', phoneNumber: '+255712000004', wardId: wardIds['Uyole'] },
    { fullName: 'Neema David', phoneNumber: '+255712000005', wardId: wardIds['Iganjo'] },
    { fullName: 'Salim Abdallah', phoneNumber: '+255712000006', wardId: wardIds['Tembela'] },
  ];

  const citizenIds: Record<string, string> = {};
  for (const c of citizenUsers) {
    const user = await prisma.user.upsert({
      where: { phoneNumber: c.phoneNumber },
      update: {},
      create: { ...c, passwordHash, role: Role.CITIZEN },
    });
    citizenIds[c.fullName] = user.id;
  }
  console.log(`Seeded ${citizenUsers.length} citizen users.`);

  // --- MP Account ---
  await prisma.mpAccount.upsert({
    where: { userId: mpUser.id },
    update: {},
    create: {
      userId: mpUser.id,
      constituencyId: constituencyIds.mbeyaTown,
      bio: 'Mbunge wa Jimbo la Mbeya Town. Najitolea kuhudumia wananchi kwa weledi na uadilifu.',
      phone: '+255712000001',
      email: 'amina.juma@bunge.go.tz',
    },
  });

  // --- Issues ---
  const issuesData = [
    {
      title: 'Barabara ya Mlimani imeharibika',
      description: 'Barabara kuu ya Mlimani ina mashimo makubwa yanayosababisha ajali mara kwa mara.',
      category: 'infrastructure',
      status: IssueStatus.IN_PROGRESS,
      userId: citizenIds['Juma Mushi'],
      wardId: wardIds['Iyela'],
    },
    {
      title: 'Zahanati ya Kata haina dawa',
      description: 'Zahanati yetu ya kata imekuwa bila dawa za msingi kwa zaidi ya mwezi mmoja.',
      category: 'health',
      status: IssueStatus.PENDING,
      userId: citizenIds['Mariam Ali'],
      wardId: wardIds['Mabatini'],
    },
    {
      title: 'Maji yamekatika kwa wiki mbili',
      description: 'Kwa wiki mbili sasa hakuna maji yanayotoka mabombeni. Tunalazimika kununua maji kwa bei ghali.',
      category: 'water',
      status: IssueStatus.IN_PROGRESS,
      userId: citizenIds['Hamza Omari'],
      wardId: wardIds['Uyole'],
    },
    {
      title: 'Shule ya Msingi inahitaji madawati',
      description: 'Wanafunzi zaidi ya 50 wanakaa chini kwenye sakafu kwa kukosa madawati.',
      category: 'education',
      status: IssueStatus.PENDING,
      userId: citizenIds['Neema David'],
      wardId: wardIds['Iganjo'],
    },
    {
      title: 'Takataka hazikusanywi kwa wiki',
      description: 'Mtaa wetu umejaa takataka kwa sababu gari la kukusanya takataka halijakuja kwa zaidi ya wiki mbili.',
      category: 'environment',
      status: IssueStatus.RESOLVED,
      userId: citizenIds['Salim Abdallah'],
      wardId: wardIds['Tembela'],
    },
    {
      title: 'Umeme umekatika mara kwa mara',
      description: 'Kwa mwezi huu tumekosa umeme kwa zaidi ya masaa 6 kila siku. Biashara zetu zinashindwa kufanya kazi.',
      category: 'electricity',
      status: IssueStatus.IN_PROGRESS,
      userId: citizenIds['Juma Mushi'],
      wardId: wardIds['Iyela'],
    },
    {
      title: 'Mifereji ya maji machafu imeziba',
      description: 'Mifereji ya maji machafu katika mtaa wetu imeziba na kusababisha harufu mbaya na magonjwa.',
      category: 'infrastructure',
      status: IssueStatus.PENDING,
      userId: citizenIds['Mariam Ali'],
      wardId: wardIds['Mabatini'],
    },
    {
      title: 'Watu wenye ulemavu wanakosa huduma',
      description: 'Hakuna miundombinu ya watu wenye ulemavu katika ofisi za serikali za kata yetu.',
      category: 'other',
      status: IssueStatus.PENDING,
      userId: citizenIds['Neema David'],
      wardId: wardIds['Iganjo'],
    },
  ];

  for (const data of issuesData) {
    const existing = await prisma.issue.findFirst({
      where: { title: data.title, userId: data.userId },
    });
    if (!existing) {
      const issue = await prisma.issue.create({
        data: { ...data, assignedToId: mpUser.id },
      });
      await prisma.issueStatusHistory.create({
        data: {
          issueId: issue.id,
          oldStatus: IssueStatus.PENDING,
          newStatus: data.status,
          changedById: mpUser.id,
          comment: 'Initial status',
        },
      });
    }
  }
  console.log('Seeded issues with status history.');

  // --- Comments ---
  const issues = await prisma.issue.findMany();
  for (const issue of issues) {
    if (issue.status === IssueStatus.IN_PROGRESS || issue.status === IssueStatus.RESOLVED) {
      const existingComment = await prisma.issueComment.findFirst({
        where: { issueId: issue.id, userId: mpUser.id },
      });
      if (!existingComment) {
        await prisma.issueComment.create({
          data: {
            issueId: issue.id,
            userId: mpUser.id,
            message: 'Nimepokea malalamiko yenu. Ninafuatilia suala hili kwa haraka.',
          },
        });
        await prisma.notification.create({
          data: {
            userId: issue.userId!,
            type: 'MP_RESPONSE',
            title: 'Mbunge Amejibu',
            body: `Dkt. Amina Juma amejibu kwenye tatizo lako "${issue.title}"`,
            data: { issueId: issue.id },
          },
        });
      }
    }
  }
  console.log('Seeded comments and notifications.');

  // --- Votes ---
  for (const issue of issues) {
    const voters = Object.values(citizenIds).filter((id) => id !== issue.userId).slice(0, 3);
    for (const voterId of voters) {
      try {
        await prisma.issueVote.upsert({
          where: { issueId_userId: { issueId: issue.id, userId: voterId } },
          update: {},
          create: { issueId: issue.id, userId: voterId },
        });
      } catch {}
    }
  }
  console.log('Seeded votes.');

  // --- Announcements ---
  const announcements = [
    {
      title: 'Mkutano wa Hadhara',
      content: 'Wananchi wa Jimbo la Mbeya Town, nakaribishwa kwenye mkutano wa hadhara siku ya Jumamosi tarehe 15 Juni 2026 katika Uwanja wa Mabatini.',
      publishedBy: mpUser.id,
    },
    {
      title: 'Uzinduzi wa Mradi wa Maji',
      content: 'Tuna furaha kutangaza kwamba mradi wa maji safi kata ya Iganjo utazinduliwa rasmi tarehe 20 Juni 2026.',
      publishedBy: mpUser.id,
    },
    {
      title: 'Matengenezo ya Barabara Yaanza',
      content: 'TANROADS imethibitisha kuanza matengenezo ya barabara ya Mabatini - Iyela kuanzia tarehe 10 Juni.',
      publishedBy: mpUser.id,
    },
  ];

  for (const a of announcements) {
    const existing = await prisma.announcement.findFirst({
      where: { title: a.title, publishedBy: a.publishedBy },
    });
    if (!existing) {
      await prisma.announcement.create({ data: a });
    }
  }
  console.log('Seeded announcements.');

  // --- Promises ---
  const promises = [
    {
      title: 'Ukarabati wa Barabara za Mji',
      description: 'Kuhakikisha barabara zote kuu za Mbeya Town zinafanyiwa matengenezo kabla ya msimu wa mvua.',
      category: 'infrastructure',
      progressPercentage: 65,
      status: 'ONGOING' as const,
    },
    {
      title: 'Dawa za Zahanati',
      description: 'Kuhakikisha zahanati zote za kata zina dawa za msingi kwa wakati wote.',
      category: 'health',
      progressPercentage: 40,
      status: 'ONGOING' as const,
    },
    {
      title: 'Madawati ya Shule',
      description: 'Kutafuta madawati 500 kwa shule za msingi katika jimbo lote.',
      category: 'education',
      progressPercentage: 100,
      status: 'COMPLETED' as const,
    },
    {
      title: 'Kusambaza Maji Safi',
      description: 'Kuleta miundombinu ya maji safi kwenye kata 5 ambazo hazina huduma ya maji.',
      category: 'water',
      progressPercentage: 25,
      status: 'NOT_STARTED' as const,
    },
    {
      title: 'Taa za Barabarani',
      description: 'Kusakinisha taa za umeme za jua katika maeneo 10 yenye hatari usiku.',
      category: 'electricity',
      progressPercentage: 80,
      status: 'ONGOING' as const,
    },
  ];

  for (const p of promises) {
    const existing = await prisma.promise.findFirst({ where: { title: p.title } });
    if (!existing) {
      await prisma.promise.create({ data: p });
    }
  }
  console.log('Seeded promises.');

  // --- Audit Logs ---
  await prisma.auditLog.create({
    data: {
      userId: adminUser.id,
      action: 'SYSTEM_SEED',
      entityType: 'System',
      newValue: { message: 'Database seeded successfully' },
    },
  });

  console.log('Seeding completed successfully!');
  console.log('---');
  console.log('Admin: +255712000000 / password123');
  console.log('MP: +255712000001 / password123');
  console.log('Citizens: +255712000002-6 / password123');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
