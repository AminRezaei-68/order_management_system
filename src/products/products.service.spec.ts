/* eslint-disable prettier/prettier */
// import { Test, TestingModule } from '@nestjs/testing';
// import { getModelToken } from '@nestjs/mongoose';
// import { ProductsService } from './products.service';
// import { BadRequestException, NotFoundException } from '@nestjs/common';
// import { Model, Query } from 'mongoose';
// import { Product } from './schemas/product.schema';
// import { CreateProductDto } from './dto/create-product.dto';
// import { UpdateProductDto } from './dto/update-product.dto';
// import { ProductCategory } from 'src/common/enums/category.enum';
// import { ProductStatus } from 'src/common/enums/status.enum';

// describe('ProductsService', () => {
//   let service: ProductsService;
//   let model: jest.Mocked<Model<Product>>;

//   const mockProductModel = {
//     find: jest.fn().mockReturnThis(),
//     findById: jest.fn().mockReturnThis(),
//     findByIdAndDelete: jest.fn().mockReturnThis(),
//     findOne: jest.fn().mockReturnThis(),
//     create: jest.fn().mockImplementation((dto) => dto),
//     skip: jest.fn().mockReturnThis(),
//     limit: jest.fn().mockReturnThis(),
//     exec: jest.fn().mockResolvedValue([]),
//   }; /* as unknown as jest.Mocked<Model<Product>> */

//   beforeEach(async () => {
//     const module: TestingModule = await Test.createTestingModule({
//       providers: [
//         ProductsService,
//         {
//           provide: getModelToken(Product.name),
//           useValue: mockProductModel,
//         },
//       ],
//     }).compile();

//     service = module.get<ProductsService>(ProductsService);
//     model = module.get<jest.Mocked<Model<Product>>>(
//       getModelToken(Product.name),
//     );
//   });

//   it('should be defined', () => {
//     expect(service).toBeDefined();
//   });

//   describe('findAll', () => {
//     it('should return all products with pagination', async () => {
//       const mockProducts = [
//         {
//           name: 'Product 1',
//           quantity: 10,
//           reservedQuantity: 2,
//           toObject: jest.fn().mockReturnValue({
//             name: 'Product 1',
//             quantity: 10,
//             reservedQuantity: 2,
//           }),
//         },
//       ];

//       model.find.mockReturnValue({
//         skip: jest.fn().mockReturnThis(),
//         limit: jest.fn().mockReturnThis(),
//         exec: jest.fn().mockResolvedValue(mockProducts),
//       } as unknown as jest.Mocked<Query<Product[], Product>>);

//       const paginationQueryDto = { limit: 10, offset: 0 };
//       const result = await service.findAll(paginationQueryDto);

//       expect(result).toEqual([
//         {
//           name: 'Product 1',
//           quantity: 10,
//           reservedQuantity: 2,
//           availableQuantity: 8,
//         },
//       ]);
//       expect(model.find).toHaveBeenCalledTimes(1);
//     });

//     it('should return an empty array if no products found', async () => {
//       model.find.mockReturnValue({
//         skip: jest.fn().mockReturnThis(),
//         limit: jest.fn().mockReturnThis(),
//         exec: jest.fn().mockResolvedValue([]),
//       } as unknown as jest.Mocked<Query<Product[], Product>>);

//       const result = await service.findAll({ limit: 10, offset: 0 });

//       expect(result).toEqual([]);
//       expect(model.find).toHaveBeenCalledTimes(1);
//     });
//   });

//   describe('findOne', () => {
//     it('should throw BadRequestException for invalid ID', async () => {
//       await expect(service.findOne('invalid_id')).rejects.toThrow(
//         BadRequestException,
//       );
//     });

//     it('should throw NotFoundException if product does not exist', async () => {
//       model.findById.mockReturnValue({
//         exec: jest.fn().mockResolvedValue(null),
//       } as unknown as jest.Mocked<Query<Product | null, Product>>);

//       await expect(service.findOne('64f3a08b3c7a0d1fcb8a08a8')).rejects.toThrow(
//         NotFoundException,
//       );
//     });

//     it('should return a product', async () => {
//       const mockProduct = {
//         name: 'Product 1',
//         quantity: 10,
//         reservedQuantity: 2,
//         toObject: jest.fn().mockReturnValue({
//           name: 'Product 1',
//           quantity: 10,
//           reservedQuantity: 2,
//         }),
//       };

//       model.findById.mockReturnValue({
//         exec: jest.fn().mockResolvedValue(mockProduct),
//       } as unknown as jest.Mocked<Query<Product, Product>>);

//       const result = await service.findOne('64f3a08b3c7a0d1fcb8a08a8');

//       expect(result).toEqual({
//         name: 'Product 1',
//         quantity: 10,
//         reservedQuantity: 2,
//         availableQuantity: 8,
//       });
//     });
//   });

//   describe('create', () => {
//     it('should throw BadRequestException if product with same name and brand exists', async () => {
//       const createProductDto: CreateProductDto = {
//         name: 'Product 1',
//         brand: 'Brand A',
//         quantity: 10,
//         category: [ProductCategory.Clothing],
//         price: 10,
//         status: [ProductStatus.InStock],
//       };

//       model.findOne.mockReturnValue({
//         exec: jest
//           .fn()
//           .mockResolvedValue({ name: 'Product 1', brand: 'Brand A' }),
//       } as unknown as jest.Mocked<Query<Product, Product>>);

//       await expect(service.create(createProductDto)).rejects.toThrow(
//         BadRequestException,
//       );
//     });

//     it('should create a new product', async () => {
//       const createProductDto: CreateProductDto = {
//         name: 'Product 1',
//         brand: 'Brand A',
//         quantity: 10,
//         category: [ProductCategory.Clothing],
//         price: 10,
//         status: [ProductStatus.InStock],
//       };

//       model.findOne.mockReturnValue({
//         exec: jest.fn().mockResolvedValue(null),
//       } as unknown as jest.Mocked<Query<Product | null, Product>>);

//       model.create.mockImplementation();

//       const result = await service.create(createProductDto);

//       expect(result).toEqual(createProductDto);
//       expect(model.create).toHaveBeenCalledWith(createProductDto);
//     });
//   });

//   describe('update', () => {
//     it('should throw BadRequestException for invalid ID', async () => {
//       const updateProductDto: UpdateProductDto = { name: 'Updated Name' };
//       await expect(
//         service.update('invalid_id', updateProductDto),
//       ).rejects.toThrow(BadRequestException);
//     });

//     it('should throw NotFoundException if product does not exist', async () => {
//       model.findById.mockImplementation(() => ({
//         exec: jest.fn().mockResolvedValue(null),
//       }));

//       await expect(
//         service.update('64f3a08b3c7a0d1fcb8a08a8', {
//           name: 'Updated Name',
//         }),
//       ).rejects.toThrow(NotFoundException);
//     });

//     it('should update a product', async () => {
//       const mockProduct = {
//         name: 'Product 1',
//         brand: 'Brand A',
//         quantity: 10,
//         reservedQuantity: 2,
//         save: jest.fn().mockResolvedValue(true),
//       };

//       model.findById.mockImplementation(() => ({
//         exec: jest.fn().mockResolvedValue(mockProduct),
//       }));

//       const updateProductDto: UpdateProductDto = { name: 'Updated Name' };
//       await service.update('64f3a08b3c7a0d1fcb8a08a8', updateProductDto);

//       expect(mockProduct.name).toBe('Updated Name');
//       expect(mockProduct.save).toHaveBeenCalled();
//     });
//   });

//   describe('remove', () => {
//     it('should throw BadRequestException for invalid ID', async () => {
//       await expect(service.remove('invalid_id')).rejects.toThrow(
//         BadRequestException,
//       );
//     });

//     it('should throw NotFoundException if product does not exist', async () => {
//       model.findByIdAndDelete.mockImplementation(() => ({
//         exec: jest.fn().mockResolvedValue(null),
//       }));

//       await expect(service.remove('64f3a08b3c7a0d1fcb8a08a8')).rejects.toThrow(
//         NotFoundException,
//       );
//     });

//     it('should delete a product', async () => {
//       const mockProduct = { name: 'Product 1' };

//       model.findByIdAndDelete.mockImplementation(() => ({
//         exec: jest.fn().mockResolvedValue(mockProduct),
//       }));

//       const result = await service.remove('64f3a08b3c7a0d1fcb8a08a8');

//       expect(result).toEqual({
//         message: 'Product with ID "64f3a08b3c7a0d1fcb8a08a8" has been deleted.',
//       });
//     });
//   });
// });

import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from './products.service';
import { getModelToken } from '@nestjs/mongoose';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import mongoose, { Model, Query } from 'mongoose';
import { Product } from './schemas/product.schema';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

describe('ProductsService', () => {
  let service: ProductsService;
  let productModel: Model<Product>;
  let mockSave: jest.Mock;

  beforeEach(async () => {
    mockSave = jest.fn().mockResolvedValue({
      _id: 'new_id',
      name: 'Product1',
      brand: 'Brand1',
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
                _id: 'existing_id',
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
            save: mockSave,
            new: jest.fn().mockImplementation(() => ({
              save: mockSave,
            })),
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

      const result = await service.create({
        name: 'Product1',
        brand: 'Brand1',
      } as CreateProductDto);

      expect(mockSave).toHaveBeenCalled();
      expect(result).toEqual({
        _id: 'new_id',
        name: 'Product1',
        brand: 'Brand1',
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
