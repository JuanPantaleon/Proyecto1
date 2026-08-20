import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../../prisma/prisma.service';
import { UnauthorizedException } from '@nestjs/common';

describe('AuthService', () => {
  let service: AuthService;
  let prisma: PrismaService;

  const mockPrisma = {
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
    },
  };

  const mockClerkClient = {
    users: {
      getUser: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get<PrismaService>(PrismaService);
    jest.clearAllMocks();
  });

  describe('syncUserFromClerk', () => {
    const clerkUser = {
      id: 'clerk-123',
      emailAddresses: [{ emailAddress: 'test@test.com' }],
      firstName: 'Test',
      lastName: 'User',
      imageUrl: 'https://example.com/avatar.jpg',
    };

    it('should create new user if not exists', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.user.create.mockResolvedValue({
        id: 'user-1',
        clerkId: 'clerk-123',
        email: 'test@test.com',
        firstName: 'Test',
        lastName: 'User',
        imageUrl: 'https://example.com/avatar.jpg',
        currentWeightKg: 0,
        heightCm: 0,
        streakDays: 0,
        role: 'USER',
      });

      const result = await service.syncUserFromClerk(clerkUser);

      expect(mockPrisma.user.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          clerkId: 'clerk-123',
          email: 'test@test.com',
          firstName: 'Test',
          lastName: 'User',
          role: 'USER',
        }),
      });
      expect(result.clerkId).toBe('clerk-123');
    });

    it('should update existing user', async () => {
      const existingUser = { id: 'user-1', clerkId: 'clerk-123', email: 'old@test.com' };
      mockPrisma.user.findUnique.mockResolvedValue(existingUser);
      mockPrisma.user.update.mockResolvedValue({
        ...existingUser,
        email: 'test@test.com',
        firstName: 'Test',
        lastName: 'User',
        imageUrl: 'https://example.com/avatar.jpg',
      });

      const result = await service.syncUserFromClerk(clerkUser);

      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: expect.objectContaining({
          clerkId: 'clerk-123',
          email: 'test@test.com',
          firstName: 'Test',
          lastName: 'User',
        }),
      });
      expect(result.email).toBe('test@test.com');
    });

    it('should adopt a seed user by email and reassign its clerkId', async () => {
      const seedUser = { id: 'user-seed', clerkId: 'clerk_seed_owner_x', email: 'test@test.com' };
      mockPrisma.user.findUnique.mockResolvedValueOnce(null).mockResolvedValueOnce(seedUser);
      mockPrisma.user.update.mockResolvedValue({
        ...seedUser,
        clerkId: clerkUser.id,
      });

      const result = await service.syncUserFromClerk(clerkUser);

      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-seed' },
        data: expect.objectContaining({ clerkId: 'clerk-123' }),
      });
      expect(result.clerkId).toBe('clerk-123');
    });

    it('should handle missing optional fields', async () => {
      const clerkUserMinimal = {
        id: 'clerk-123',
        emailAddresses: [{ emailAddress: 'test@test.com' }],
        firstName: null,
        lastName: null,
        imageUrl: null,
      };
      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.user.create.mockResolvedValue({
        id: 'user-1',
        clerkId: 'clerk-123',
        email: 'test@test.com',
        firstName: null,
        lastName: null,
        imageUrl: null,
        currentWeightKg: 0,
        heightCm: 0,
        streakDays: 0,
        role: 'USER',
      });

      const result = await service.syncUserFromClerk(clerkUserMinimal);

      expect(result.firstName).toBeNull();
      expect(result.lastName).toBeNull();
    });
  });

  describe('getUserByClerkId', () => {
    it('should return user by clerkId', async () => {
      const user = { id: 'user-1', clerkId: 'clerk-123' };
      mockPrisma.user.findUnique.mockResolvedValue(user);

      const result = await service.getUserByClerkId('clerk-123');

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { clerkId: 'clerk-123' },
      });
      expect(result).toEqual(user);
    });

    it('should return null if not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      const result = await service.getUserByClerkId('clerk-999');

      expect(result).toBeNull();
    });
  });

  describe('updateUserProfile', () => {
    it('should update user weight and height', async () => {
      const user = { id: 'user-1', clerkId: 'clerk-123', currentWeightKg: 70, heightCm: 170 };
      mockPrisma.user.findUnique.mockResolvedValue(user);
      mockPrisma.user.update.mockResolvedValue({
        ...user,
        currentWeightKg: 80,
        heightCm: 175,
      });

      const result = await service.updateUserProfile('clerk-123', {
        currentWeightKg: 80,
        heightCm: 175,
      });

      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { clerkId: 'clerk-123' },
        data: { currentWeightKg: 80, heightCm: 175 },
      });
      expect(result.currentWeightKg).toBe(80);
      expect(result.heightCm).toBe(175);
    });

    it('should throw UnauthorizedException if user not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(service.updateUserProfile('clerk-999', { currentWeightKg: 80 }))
        .rejects.toThrow(UnauthorizedException);
    });

    it('should allow partial updates', async () => {
      const user = { id: 'user-1', clerkId: 'clerk-123', currentWeightKg: 70, heightCm: 170 };
      mockPrisma.user.findUnique.mockResolvedValue(user);
      mockPrisma.user.update.mockResolvedValue({
        ...user,
        currentWeightKg: 80,
      });

      const result = await service.updateUserProfile('clerk-123', { currentWeightKg: 80 });

      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { clerkId: 'clerk-123' },
        data: { currentWeightKg: 80 },
      });
      expect(result.heightCm).toBe(170);
    });
  });

  describe('handleClerkWebhook', () => {
    it('should handle user.created event', async () => {
      const event = {
        type: 'user.created',
        data: {
          id: 'clerk-123',
          emailAddresses: [{ emailAddress: 'test@test.com' }],
          firstName: 'Test',
          lastName: 'User',
        },
      };
      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.user.create.mockResolvedValue({ id: 'user-1' });

      await service.handleClerkWebhook(event);

      expect(mockPrisma.user.create).toHaveBeenCalled();
    });

    it('should handle user.updated event', async () => {
      const event = {
        type: 'user.updated',
        data: { id: 'clerk-123', emailAddresses: [{ emailAddress: 'new@test.com' }] },
      };
      mockPrisma.user.findUnique.mockResolvedValue({ id: 'user-1' });
      mockPrisma.user.update.mockResolvedValue({ id: 'user-1' });

      await service.handleClerkWebhook(event);

      expect(mockPrisma.user.update).toHaveBeenCalled();
    });

    it('should handle user.deleted event', async () => {
      const event = { type: 'user.deleted', data: { id: 'clerk-123' } };
      mockPrisma.user.delete.mockResolvedValue({});

      await service.handleClerkWebhook(event);

      expect(mockPrisma.user.delete).toHaveBeenCalledWith({
        where: { clerkId: 'clerk-123' },
      });
    });

    it('should ignore unknown event types', async () => {
      const event = { type: 'unknown.event', data: {} };

      await service.handleClerkWebhook(event);

      expect(mockPrisma.user.create).not.toHaveBeenCalled();
      expect(mockPrisma.user.update).not.toHaveBeenCalled();
      expect(mockPrisma.user.delete).not.toHaveBeenCalled();
    });
  });
});