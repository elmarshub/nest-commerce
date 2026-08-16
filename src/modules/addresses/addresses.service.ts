import { PrismaService } from '@/prisma/prisma.service';
import { Address } from '@generated/prisma/client';
import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { AddressResponseDto } from './dto/address-response.dto';

@Injectable()
export class AddressesService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: string): Promise<AddressResponseDto[]> {
    const addresses = await this.prisma.address.findMany({
      where: { userId },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });

    return addresses.map((address) => this.formatAddress(address));
  }

  async create(
    userId: string,
    data: CreateAddressDto,
  ): Promise<AddressResponseDto> {
    const existingCount = await this.prisma.address.count({
      where: { userId },
    });

    // The first address a user adds is always the default, regardless of
    // what was passed, so there's never a state with addresses but no default.
    const isDefault = existingCount === 0 || data.isDefault === true;

    const address = await this.prisma.$transaction(async (tx) => {
      if (isDefault) {
        await tx.address.updateMany({
          where: { userId, isDefault: true },
          data: { isDefault: false },
        });
      }

      return await tx.address.create({
        data: { ...data, userId, isDefault },
      });
    });

    return this.formatAddress(address);
  }

  async update(
    userId: string,
    id: string,
    data: UpdateAddressDto,
  ): Promise<AddressResponseDto> {
    await this.getOwnedAddress(userId, id);

    const address = await this.prisma.$transaction(async (tx) => {
      if (data.isDefault === true) {
        await tx.address.updateMany({
          where: { userId, isDefault: true },
          data: { isDefault: false },
        });
      }

      return await tx.address.update({
        where: { id },
        data,
      });
    });

    return this.formatAddress(address);
  }

  async remove(userId: string, id: string): Promise<{ message: string }> {
    const existing = await this.getOwnedAddress(userId, id);

    await this.prisma.$transaction(async (tx) => {
      await tx.address.delete({ where: { id } });

      // If the default address was just deleted, promote the most recently
      // added remaining one so the user always has a default when possible.
      if (existing.isDefault) {
        const next = await tx.address.findFirst({
          where: { userId },
          orderBy: { createdAt: 'desc' },
        });

        if (next) {
          await tx.address.update({
            where: { id: next.id },
            data: { isDefault: true },
          });
        }
      }
    });

    return { message: 'Address deleted successfully' };
  }

  private async getOwnedAddress(userId: string, id: string): Promise<Address> {
    const address = await this.prisma.address.findUnique({ where: { id } });

    if (!address || address.userId !== userId) {
      throw new NotFoundException('Address not found');
    }

    return address;
  }

  private formatAddress(address: Address): AddressResponseDto {
    return {
      id: address.id,
      label: address.label,
      fullName: address.fullName,
      line1: address.line1,
      line2: address.line2,
      city: address.city,
      state: address.state,
      postalCode: address.postalCode,
      country: address.country,
      phone: address.phone,
      isDefault: address.isDefault,
      createdAt: address.createdAt,
      updatedAt: address.updatedAt,
    };
  }
}
