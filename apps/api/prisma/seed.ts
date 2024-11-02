import { faker } from '@faker-js/faker'
import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function seed() {
  await prisma.user.deleteMany()
  await prisma.organization.deleteMany()

  const passwordHash = await hash('123456', 1) // 'password',

  const [user, anotherUser, anotherUser2] =
    await prisma.user.createManyAndReturn({
      data: [
        {
          name: 'John doe',
          email: 'john@acme.com',
          avatarUrl: 'https://github.com/cauenishijima.png',
          passwordHash,
        },
        {
          name: faker.person.firstName(),
          email: faker.internet.email(),
          avatarUrl: faker.image.avatarGitHub(),
          passwordHash,
        },
        {
          name: faker.person.firstName(),
          email: faker.internet.email(),
          avatarUrl: faker.image.avatarGitHub(),
          passwordHash,
        },
      ],
    })

  await prisma.organization.create({
    data: {
      name: 'Acme Inc. (Admin)',
      domain: 'acme.com',
      slug: 'acme-admin',
      avatarUrl: faker.image.avatarGitHub(),
      shouldAttachUserByDomain: true,
      ownerId: user.id,
      banks: {
        createMany: {
          data: [
            {
              code: 1,
              name: faker.finance.accountName(),
              type: 'BANK',
              initialDate: faker.date.past({ years: 3 }),
              initialBalance: faker.finance.amount({
                dec: 2,
                min: 100,
                max: 99999.99,
              }),
            },
            {
              code: 2,
              name: faker.finance.accountName(),
              type: 'BANK',
              initialDate: faker.date.past({ years: 3 }),
              initialBalance: faker.finance.amount({
                dec: 2,
                min: 100,
                max: 99999.99,
              }),
            },
          ],
        },
      },
      members: {
        createMany: {
          data: [
            {
              userId: user.id,
              role: 'ADMIN',
            },
            {
              userId: anotherUser.id,
              role: 'MEMBER',
            },
            {
              userId: anotherUser2.id,
              role: 'MEMBER',
            },
          ],
        },
      },
    },
  })

  await prisma.organization.create({
    data: {
      name: 'Acme Inc. (Member)',
      slug: 'acme-member',
      avatarUrl: faker.image.avatarGitHub(),
      ownerId: anotherUser.id,
      banks: {
        createMany: {
          data: [
            {
              code: 1,
              name: faker.finance.accountName(),
              type: 'BANK',
              initialDate: faker.date.past({ years: 3 }),
              initialBalance: faker.finance.amount({
                dec: 2,
                min: 100,
                max: 99999.99,
              }),
            },
            {
              code: 2,
              name: faker.finance.accountName(),
              type: 'BANK',
              initialDate: faker.date.past({ years: 3 }),
              initialBalance: faker.finance.amount({
                dec: 2,
                min: 100,
                max: 99999.99,
              }),
            },
          ],
        },
      },
      members: {
        createMany: {
          data: [
            {
              userId: user.id,
              role: 'MEMBER',
            },
            {
              userId: anotherUser.id,
              role: 'ADMIN',
            },
            {
              userId: anotherUser2.id,
              role: 'MEMBER',
            },
          ],
        },
      },
    },
  })

  await prisma.organization.create({
    data: {
      name: 'Acme Inc. (Billing)',
      slug: 'acme-billing',
      avatarUrl: faker.image.avatarGitHub(),
      ownerId: anotherUser.id,
      banks: {
        createMany: {
          data: [
            {
              code: 1,
              name: faker.finance.accountName(),
              type: 'BANK',
              initialDate: faker.date.past({ years: 3 }),
              initialBalance: faker.finance.amount({
                dec: 2,
                min: 100,
                max: 99999.99,
              }),
            },
            {
              code: 2,
              name: faker.finance.accountName(),
              type: 'BANK',
              initialDate: faker.date.past({ years: 3 }),
              initialBalance: faker.finance.amount({
                dec: 2,
                min: 100,
                max: 99999.99,
              }),
            },
          ],
        },
      },
      members: {
        createMany: {
          data: [
            {
              userId: user.id,
              role: 'BILLING',
            },
            {
              userId: anotherUser.id,
              role: 'ADMIN',
            },
            {
              userId: anotherUser2.id,
              role: 'MEMBER',
            },
          ],
        },
      },
    },
  })
}

seed().then(() => {
  console.log('Database Seeded')
})
