import { PrismaClient } from '../src/generated/prisma'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seeding...')

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 12)
  
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@lagiah.com' },
    update: {},
    create: {
      email: 'admin@lagiah.com',
      password: hashedPassword,
      name: 'System Administrator',
      role: 'ADMIN',
      isActive: true,
    },
  })

  // Create staff user
  const staffPassword = await bcrypt.hash('staff123', 12)
  
  const staffUser = await prisma.user.upsert({
    where: { email: 'staff@lagiah.com' },
    update: {},
    create: {
      email: 'staff@lagiah.com',
      password: staffPassword,
      name: 'Staff Member',
      role: 'STAFF',
      isActive: true,
    },
  })

  // Create viewer user
  const viewerPassword = await bcrypt.hash('viewer123', 12)
  
  const viewerUser = await prisma.user.upsert({
    where: { email: 'viewer@lagiah.com' },
    update: {},
    create: {
      email: 'viewer@lagiah.com',
      password: viewerPassword,
      name: 'Viewer User',
      role: 'VIEWER',
      isActive: true,
    },
  })

  // Create sample domains
  const sampleDomains = [
    {
      name: 'example.com',
      registrar: 'GoDaddy',
      status: 'ACTIVE' as const,
      registeredAt: new Date('2023-01-15'),
      expiresAt: new Date('2025-01-15'),
      nameservers: ['ns1.example.com', 'ns2.example.com'],
      notes: 'Main company domain',
      createdBy: adminUser.id,
    },
    {
      name: 'testsite.org',
      registrar: 'Namecheap',
      status: 'ACTIVE' as const,
      registeredAt: new Date('2023-06-10'),
      expiresAt: new Date('2024-12-10'),
      nameservers: ['ns1.testsite.org', 'ns2.testsite.org'],
      notes: 'Client testing domain',
      createdBy: staffUser.id,
    },
  ]

  for (const domain of sampleDomains) {
    await prisma.domain.upsert({
      where: { name: domain.name },
      update: {},
      create: domain,
    })
  }

  // Create sample hosting
  const sampleHosting = [
    {
      name: 'Shared Hosting - Basic',
      provider: 'cPanel Provider',
      status: 'ACTIVE' as const,
      planName: 'Basic Plan',
      resources: {
        storage: '10GB',
        bandwidth: 'Unlimited',
        databases: 10,
        emails: 100,
      },
      cpanelUrl: 'https://cpanel.provider.com:2083',
      username: 'user123',
      password: 'encrypted_password_here', // In real app, this would be encrypted
      expiresAt: new Date('2025-03-15'),
      notes: 'Shared hosting for small websites',
      createdBy: adminUser.id,
    },
    {
      name: 'VPS Hosting - Standard',
      provider: 'DigitalOcean',
      status: 'ACTIVE' as const,
      planName: 'Droplet 2GB',
      resources: {
        cpu: '1 vCPU',
        ram: '2GB',
        storage: '50GB SSD',
        bandwidth: '2TB',
      },
      expiresAt: new Date('2025-02-20'),
      notes: 'VPS for medium traffic websites',
      createdBy: staffUser.id,
    },
  ]

  for (const hosting of sampleHosting) {
    await prisma.hosting.create({
      data: hosting,
    })
  }

  // Create sample VPS
  const sampleVPS = [
    {
      name: 'Production Server',
      provider: 'Vultr',
      status: 'ACTIVE' as const,
      ipAddress: '192.168.1.100',
      specs: {
        cpu: '4 vCPU',
        ram: '8GB',
        storage: '160GB SSD',
        bandwidth: '4TB',
      },
      sshPort: 22,
      username: 'root',
      cpanelUrl: 'https://cpanel.vultr.com:2083',
      expiresAt: new Date('2025-04-10'),
      notes: 'Main production server',
      createdBy: adminUser.id,
    },
  ]

  for (const vps of sampleVPS) {
    await prisma.vPS.create({
      data: vps,
    })
  }

  // Create sample websites
  const sampleWebsites = [
    {
      name: 'Company Website',
      url: 'https://example.com',
      status: 'ACTIVE' as const,
      cms: 'WordPress',
      cmsVersion: '6.0',
      phpVersion: '8.1',
      sslStatus: 'ACTIVE' as const,
      sslExpiry: new Date('2025-01-15'),
      backupStatus: 'ACTIVE' as const,
      lastBackup: new Date(),
      notes: 'Main company website',
      createdBy: adminUser.id,
      domainId: (await prisma.domain.findFirst({ where: { name: 'example.com' } }))?.id,
      hostingId: (await prisma.hosting.findFirst({ where: { name: 'Shared Hosting - Basic' } }))?.id,
    },
    {
      name: 'Client Portal',
      url: 'https://portal.testsite.org',
      status: 'ACTIVE' as const,
      cms: 'Custom',
      cmsVersion: null,
      phpVersion: '8.0',
      sslStatus: 'ACTIVE' as const,
      sslExpiry: new Date('2024-12-10'),
      backupStatus: 'ACTIVE' as const,
      lastBackup: new Date(),
      notes: 'Client portal website',
      createdBy: staffUser.id,
      domainId: (await prisma.domain.findFirst({ where: { name: 'testsite.org' } }))?.id,
      vpsId: (await prisma.vPS.findFirst({ where: { name: 'Production Server' } }))?.id,
    },
  ]

  for (const website of sampleWebsites) {
    await prisma.website.create({
      data: website,
    })
  }

  // Create sample settings
  const sampleSettings = [
    {
      key: 'app_name',
      value: 'Domain Management System',
      type: 'string',
      category: 'general',
    },
    {
      key: 'notifications_enabled',
      value: 'true',
      type: 'boolean',
      category: 'notifications',
    },
    {
      key: 'expiry_alert_days',
      value: '30,14,7',
      type: 'string',
      category: 'notifications',
    },
    {
      key: 'max_whois_requests_per_hour',
      value: '100',
      type: 'number',
      category: 'api',
    },
  ]

  for (const setting of sampleSettings) {
    await prisma.setting.upsert({
      where: { key: setting.key },
      update: {},
      create: setting,
    })
  }

  console.log('✅ Database seeding completed!')
  console.log(`👤 Admin user: admin@lagiah.com / admin123`)
  console.log(`👤 Staff user: staff@lagiah.com / staff123`)
  console.log(`👤 Viewer user: viewer@lagiah.com / viewer123`)
  console.log(`🌐 Sample domains: example.com, testsite.org`)
  console.log(`🏠 Sample hosting accounts created`)
  console.log(`🖥️  Sample VPS created`)
  console.log(`⚙️  App settings configured`)
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:')
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 
