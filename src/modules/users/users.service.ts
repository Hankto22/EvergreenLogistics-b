import prisma from '../../config/prisma.js';
import { NotFoundError, InternalServerError, BadRequestError } from '../../errors/customErrors.js';
import { validateUUID } from '../../utils/uuid.js';

interface UserResponse {
    Id: string;
    FullName: string;
    Email: string;
    PasswordHash: string;
    Role: string;
    IsActive: boolean;
    CreatedAt?: Date;
    UpdatedAt?: Date;
}

//get all users
export const getAllUsersService = async (): Promise<UserResponse[]> => {
    const users = await prisma.user.findMany();
    return users.map(user => ({
        Id: user.id,
        FullName: user.fullName,
        Email: user.email,
        PasswordHash: user.passwordHash,
        Role: user.role,
        IsActive: user.isActive,
        CreatedAt: user.createdAt,
        UpdatedAt: user.updatedAt || undefined,
    }));
}

//get user by Id
export const getUserByIdService = async (id: string): Promise<UserResponse> => {
  validateUUID(id);
  try {
    const user = await prisma.user.findUnique({
      where: { id },
    });
    if (!user) {
      throw new NotFoundError('User not found');
    }
    return {
      Id: user.id,
      FullName: user.fullName,
      Email: user.email,
      PasswordHash: user.passwordHash,
      Role: user.role,
      IsActive: user.isActive,
      CreatedAt: user.createdAt,
      UpdatedAt: user.updatedAt || undefined,
    };
  } catch (error: any) {
    console.log('Error in getUserByIdService:', error);
    if (error.code === 'P2025') {
      throw new NotFoundError('User not found');
    }
    if (error.code === 'P2023') {
      throw new BadRequestError('Invalid UUID format');
    }
    throw new InternalServerError('Failed to retrieve user');
  }
}

//get user by email
export const getUserByEmailService = async (email: string): Promise<UserResponse> => {
  const user = await prisma.user.findUnique({
    where: { email },
  });
  if (!user) {
    throw new NotFoundError('User not found');
  }
  return {
    Id: user.id,
    FullName: user.fullName,
    Email: user.email,
    PasswordHash: user.passwordHash,
    Role: user.role,
    IsActive: user.isActive,
    CreatedAt: user.createdAt,
    UpdatedAt: user.updatedAt || undefined,
  };
}

//create user
export const createUserService = async (first_name: string, last_name: string, email: string, phone_number: string, password: string, user_type: string): Promise<UserResponse | null> => {
    const fullName = `${first_name} ${last_name}`;
    const user = await prisma.user.create({
        data: {
            fullName,
            email,
            passwordHash: password,
            role: user_type,
        },
    });
    return {
        Id: user.id,
        FullName: user.fullName,
        Email: user.email,
        PasswordHash: user.passwordHash,
        Role: user.role,
        IsActive: user.isActive,
        CreatedAt: user.createdAt,
        UpdatedAt: user.updatedAt || undefined,
    };
};

//update user by Id
export const updateUserService = async (id: string, fullName: string, email: string): Promise<UserResponse> => {
  validateUUID(id);
  try {
    const user = await prisma.user.update({
      where: { id },
      data: {
        fullName,
        email,
        updatedAt: new Date(),
      },
    });
    return {
      Id: user.id,
      FullName: user.fullName,
      Email: user.email,
      PasswordHash: user.passwordHash,
      Role: user.role,
      IsActive: user.isActive,
      CreatedAt: user.createdAt,
      UpdatedAt: user.updatedAt || undefined,
    };
  } catch (error: any) {
    console.log('Error in updateUserService:', error);
    if (error.code === 'P2025') {
      throw new NotFoundError('User not found');
    }
    if (error.code === 'P2023') {
      throw new BadRequestError('Invalid UUID format');
    }
    throw new InternalServerError('Failed to update user');
  }
}

//delete user by Id
export const deleteUserService = async (id: string): Promise<void> => {
  validateUUID(id);
  try {
    await prisma.user.delete({
      where: { id },
    });
  } catch (error: any) {
    console.log('Error in deleteUserService:', error);
    if (error.code === 'P2025') {
      throw new NotFoundError('User not found');
    }
    if (error.code === 'P2023') {
      throw new BadRequestError('Invalid UUID format');
    }
    throw new InternalServerError('Failed to delete user');
  }
}


// Removed getUsers function as it's not used