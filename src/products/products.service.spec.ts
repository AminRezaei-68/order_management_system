import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from './products.service';
import { getModelToken } from '@nestjs/mongoose';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import mongoose, { Model, Query } from 'mongoose';
import { Product } from './schemas/product.schema';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { v4 as uuidv4 } from 'uuid';

describe('ProductsService', () => {
  let service: ProductsService;
  let productModel: Model<Product>;
  let mockProductModel: jest.Mock = jest.fn();
  let mockSave: jest.Mock;

  const newId = uuidv4();
  const existingId = uuidv4();

  beforeEach(async () => {
    mockSave = jest.fn().mockResolvedValue({
      _id: newId,
      name: 'Product1',
      brand: 'Brand1',
      price: 99,
      quantity: 10,
      category: ['electronics'],
      status: ['In Stock'],
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: getModelToken(Product.name),
          useValue: {
            find: jest.fn(),
            findById: jest.fn().mockReturnValue({
              exec: jest.fn().mockResolvedValue({
                _id: existingId,
                name: 'Product1',
                brand: 'Brand1',
              }),
            }),
            findOne: jest.fn().mockReturnValue({
              exec: jest.fn().mockResolvedValue(null),
            }),
            findByIdAndDelete: jest.fn(),
            skip: jest.fn().mockReturnThis(),
            limit: jest.fn().mockReturnThis(),
            exec: jest.fn(),
            create: jest.fn().mockResolvedValue(mockSave),
            save: jest.fn(),
            // new: jest.fn().mockImplementation(() => ({
            //   save: mockProductModel,
              
            // })),
          },
        },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
    productModel = module.get<Model<Product>>(getModelToken(Product.name));
  });

  describe('findAll', () => {
    it('should return paginated products with calculated availableQuantity', async () => {
      const mockProducts = [
        {
          toObject: () => ({
            name: 'Product1',
            quantity: 10,
            reservedQuantity: 2,
          }),
        },
        {
          toObject: () => ({
            name: 'Product2',
            quantity: 20,
            reservedQuantity: 5,
          }),
        },
      ];
      jest.spyOn(productModel, 'find').mockReturnValue({
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockProducts),
      } as unknown as Query<any[], any>);

      const result = await service.findAll({ limit: 10, offset: 0 });
      expect(result).toEqual([
        {
          name: 'Product1',
          quantity: 10,
          reservedQuantity: 2,
          availableQuantity: 8,
        },
        {
          name: 'Product2',
          quantity: 20,
          reservedQuantity: 5,
          availableQuantity: 15,
        },
      ]);
    });
  });

  describe('findOne', () => {
    it('should throw BadRequestException for invalid product ID', async () => {
      jest.spyOn(productModel, 'findById').mockResolvedValue(null);
      await expect(service.findOne('invalid-id')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw NotFoundException if product does not exist', async () => {
      jest.spyOn(productModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      } as any);

      await expect(service.findOne('valid-id')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should return a product with availableQuantity', async () => {
      const mockProduct = {
        name: 'Product1',
        quantity: 10,
        reservedQuantity: 2,
        toObject: jest.fn().mockReturnValue({
          name: 'Product1',
          quantity: 10,
          reservedQuantity: 2,
        }),
      };
      jest.spyOn(productModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockProduct),
      } as any);

      const result = await service.findOne('60c72b2f9b1d8e4d88f9790e');
      expect(result).toEqual({
        name: 'Product1',
        quantity: 10,
        reservedQuantity: 2,
        availableQuantity: 8,
      });
    });
  });

  describe('create', () => {
    it('should throw BadRequestException if product with same name and brand exists', async () => {
      jest.spyOn(productModel, 'findOne').mockReturnValue({
        exec: jest.fn().mockResolvedValue({
          name: 'Product1',
          brand: 'Brand1',
        }),
      } as any);

      await expect(
        service.create({
          name: 'Product1',
          brand: 'Brand1',
        } as CreateProductDto),
      ).rejects.toThrow(BadRequestException);
    });

    it('should create and save a new product', async () => {
      jest
        .spyOn(productModel, 'findOne')
        .mockReturnValue({ exec: jest.fn().mockResolvedValue(null) } as any);

        mockProductModel.mockImplementation(() => ({
          save: jest.fn(),
          toObject: jest.fn().mockReturnValue(mockSave),
        }));

        const result = await service.create({
          name: 'Product1',
          brand: 'Brand1',
          price: 99,
          quantity: 10,
          category: ['electronics'],
          status: ['In Stock'],
        } as CreateProductDto);

      expect(mockSave).toHaveBeenCalled();
      expect(result).toEqual({
        _id: newId,
        name: 'Product1',
        brand: 'Brand1',
        price: 99,
        quantity: 10,
        category: ['electronics'],
        status: ['In Stock'],
      });
    });
  });

  describe('update', () => {
    it('should throw BadRequestException for invalid product ID', async () => {
      await expect(
        service.update('invalid-id', {} as UpdateProductDto),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException if product does not exist', async () => {
      const valid_id = new mongoose.Types.ObjectId().toHexString();

      jest
        .spyOn(productModel, 'findById')
        .mockReturnValue({ exec: jest.fn().mockResolvedValue(null) } as any);

      await expect(
        service.update(valid_id, {} as UpdateProductDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should update and save the product', async () => {
      const valid_id = new mongoose.Types.ObjectId().toHexString();
      const mockProduct = {
        _id: valid_id,
        save: jest.fn().mockResolvedValue({ _id: valid_id, name: 'Updated' }),
      };
      jest.spyOn(productModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockProduct),
      } as any);

      const result = await service.update(valid_id, {
        name: 'Updated',
      } as UpdateProductDto);
      expect(mockProduct.save).toHaveBeenCalled();
      expect(result).toEqual({ _id: valid_id, name: 'Updated' });
    });
  });

  describe('remove', () => {
    const valid_id = '60c72b2f9b1d8e4d88f9790e';
    it('should throw BadRequestException for invalid product ID', async () => {
      await expect(service.remove('50c72b2f9b1d8e4d88f9790')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw NotFoundException if product does not exist', async () => {
      jest
        .spyOn(productModel, 'findByIdAndDelete')
        .mockReturnValue({ exec: jest.fn().mockResolvedValue(null) } as any);

      await expect(service.remove(valid_id)).rejects.toThrow(NotFoundException);
    });

    it('should delete the product and return a success message', async () => {
      jest.spyOn(productModel, 'findByIdAndDelete').mockReturnValue({
        exec: jest.fn().mockResolvedValue({ _id: valid_id }),
      } as any);

      const result = await service.remove(valid_id);
      expect(result).toEqual({
        message: `Product with ID "${valid_id}" has been deleted.`,
      });
    });
  });
});
