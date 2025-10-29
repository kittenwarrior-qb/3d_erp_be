import { PrismaClient, MaterialType } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seeding...');

  // 1. Tạo Permissions - Updated for new API structure
  const permissions = [
    // User management
    { name: 'users:create', description: 'Create new users' },
    { name: 'users:read', description: 'View user information' },
    { name: 'users:update', description: 'Update user information' },
    { name: 'users:delete', description: 'Delete users' },

    // Role management
    { name: 'roles:create', description: 'Create new roles' },
    { name: 'roles:read', description: 'View roles' },
    { name: 'roles:update', description: 'Update roles' },
    { name: 'roles:delete', description: 'Delete roles' },

    // Material management
    { name: 'materials:create', description: 'Create new materials' },
    { name: 'materials:read', description: 'View materials' },
    { name: 'materials:update', description: 'Update materials' },
    { name: 'materials:delete', description: 'Delete materials' },

    // Category management
    { name: 'categories:create', description: 'Create new categories' },
    { name: 'categories:read', description: 'View categories' },
    { name: 'categories:update', description: 'Update categories' },
    { name: 'categories:delete', description: 'Delete categories' },

    // Product management
    { name: 'products:create', description: 'Create new products' },
    { name: 'products:read', description: 'View products' },
    { name: 'products:update', description: 'Update products' },
    { name: 'products:delete', description: 'Delete products' },

    // Quote management
    { name: 'quotes:create', description: 'Create new quotes' },
    { name: 'quotes:read', description: 'View quotes' },
    { name: 'quotes:update', description: 'Update quotes' },
    { name: 'quotes:delete', description: 'Delete quotes' },
    { name: 'quotes:approve', description: 'Approve/reject quotes' },

    // System administration
    { name: 'system:audit', description: 'View audit logs' },
    { name: 'system:manage', description: 'System administration' },
    { name: 'system:backup', description: 'Database backup operations' },

    // Advanced permissions
    { name: 'analytics:read', description: 'View analytics and reports' },
    { name: 'settings:update', description: 'Update system settings' },
  ];

  console.log('Creating permissions...');
  for (const permission of permissions) {
    await prisma.permission.upsert({
      where: { name: permission.name },
      update: {},
      create: permission,
    });
  }

  const roles = [
    {
      name: 'ADMIN',
      description: 'Full system access - Administrator',
      permissions: permissions.map((p) => p.name), // All permissions
    },
    {
      name: 'MANAGER',
      description:
        'Management access - Can manage products, quotes, and view analytics',
      permissions: [
        'users:read',
        'materials:create',
        'materials:read',
        'materials:update',
        'categories:create',
        'categories:read',
        'categories:update',
        'products:create',
        'products:read',
        'products:update',
        'quotes:create',
        'quotes:read',
        'quotes:update',
        'quotes:approve',
        'analytics:read',
      ],
    },
    {
      name: 'DESIGNER',
      description: 'Product design and material management',
      permissions: [
        'materials:create',
        'materials:read',
        'materials:update',
        'categories:read',
        'products:create',
        'products:read',
        'products:update',
        'quotes:create',
        'quotes:read',
        'quotes:update',
      ],
    },
    {
      name: 'SALES',
      description: 'Sales team - Quote and customer management',
      permissions: [
        'materials:read',
        'categories:read',
        'products:read',
        'quotes:create',
        'quotes:read',
        'quotes:update',
      ],
    },
    {
      name: 'VIEWER',
      description: 'Read-only access',
      permissions: [
        'materials:read',
        'categories:read',
        'products:read',
        'quotes:read',
      ],
    },
  ];

  console.log('Creating roles...');
  for (const roleData of roles) {
    const role = await prisma.role.upsert({
      where: { name: roleData.name },
      update: { description: roleData.description },
      create: {
        name: roleData.name,
        description: roleData.description,
      },
    });

    console.log(`Assigning permissions to ${roleData.name}...`);
    for (const permissionName of roleData.permissions) {
      const permission = await prisma.permission.findUnique({
        where: { name: permissionName },
      });

      if (permission) {
        await prisma.rolePermission.upsert({
          where: {
            roleId_permissionId: {
              roleId: role.id,
              permissionId: permission.id,
            },
          },
          update: {},
          create: {
            roleId: role.id,
            permissionId: permission.id,
          },
        });
      }
    }
  }

  const adminRole = await prisma.role.findUnique({
    where: { name: 'ADMIN' },
  });

  // 3. Tạo Admin User
  if (adminRole) {
    const hashedPassword = await bcrypt.hash('1', 12);
    await prisma.user.upsert({
      where: { email: 'admin@gmail.com' },
      update: {},
      create: {
        email: 'admin@gmail.com',
        password: hashedPassword,
        fullName: 'System Administrator',
        roleId: adminRole.id,
      },
    });
    console.log('Admin user created: admin@gmail.com / 1');

    // 4. Tạo Sample Categories
    console.log('Creating sample categories...');
    const categories = [
      {
        name: 'Bàn Ghế Ngoài Trời',
        description: 'Nội thất sân vườn và ban công',
      },
      {
        name: 'Bàn Ghế Nội Thất',
        description: 'Nội thất phòng khách và phòng ăn',
      },
      {
        name: 'Tủ Kệ',
        description: 'Tủ quần áo, kệ sách và tủ trang trí',
      },
    ];

    for (const categoryData of categories) {
      await prisma.category.upsert({
        where: { name: categoryData.name },
        update: {},
        create: categoryData,
      });
    }

    console.log('Creating sample materials...');
    const materials = [
      {
        name: 'Gỗ Sồi Tự Nhiên',
        code: 'WOOD_OAK_001',
        type: MaterialType.WOOD,
        unitPrice: 250000,
        unit: 'm²',
        textureUrl: 'https://example.com/textures/oak.jpg',
        colorHex: '#8B4513',
        density: 750,
        description: 'Gỗ sồi tự nhiên chất lượng cao',
        supplier: 'Công ty TNHH Gỗ Việt Nam',
        isActive: true,
      },
      {
        name: 'Thép Không Gỉ 304',
        code: 'METAL_SS304_001',
        type: MaterialType.METAL,
        unitPrice: 180000,
        unit: 'kg',
        colorHex: '#C0C0C0',
        density: 8000,
        description: 'Thép không gỉ grade 304 chống ăn mòn',
        supplier: 'Thép Việt Nam',
        isActive: true,
      },
      {
        name: 'Vải Bọc Ghế',
        code: 'FABRIC_SOFA_001',
        type: MaterialType.FABRIC,
        unitPrice: 350000,
        unit: 'm²',
        colorHex: '#8B4513',
        description: 'Vải bọc ghế cao cấp chống thấm',
        supplier: 'Vải Dệt Sài Gòn',
        isActive: true,
      },
    ];

    for (const materialData of materials) {
      await prisma.material.upsert({
        where: { code: materialData.code },
        update: {},
        create: materialData,
      });
    }

    console.log('Sample data created successfully!');
  }

  console.log('Database seeding completed!');
}

main()
  .catch((e) => {
    console.error('Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
