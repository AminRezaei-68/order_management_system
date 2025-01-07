import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { Product } from './schemas/product.schema';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PaginationQueryDto } from 'src/common/dtos/pagination-query.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name) private readonly productModel: Model<Product>,
  ) {}

  async findAll(paginationQueryDto: PaginationQueryDto) {
    const { limit = 10, offset = 0 } = paginationQueryDto;
    const products = await this.productModel
      .find()
      .skip(offset)
      .limit(limit)
      .exec();

    return products.map((product) => {
      const productObj = product.toObject();
      return {
        ...productObj,
        availableQuantity: productObj.quantity - productObj.reservedQuantity,
      };
    });
  }

  async findOne(id: string) {
    if (!mongoose.isValidObjectId(id)) {
      throw new BadRequestException('Invalid product ID');
    }

    const product = await this.productModel.findById(id).exec();

    if (!product) {
      throw new NotFoundException(`The product with ${id} does not exist.`);
    }

    return {
      ...product.toObject(),
      availableQuantity: product.quantity - product.reservedQuantity,
    };
  }

  async create(createProductDto: CreateProductDto) {
    const { name, brand } = createProductDto;

    const existingProduct = await this.productModel
      .findOne({ name: name })
      .exec();
    if (existingProduct && existingProduct.brand === brand) {
      throw new BadRequestException(`You can't create repetitive product`);
    }

    const product = new this.productModel({ ...createProductDto });
    return await product.save();
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    if (!mongoose.isValidObjectId(id)) {
      throw new BadRequestException('Invalid product ID');
    }
    const product = await this.productModel.findById(id).exec();

    if (!product) {
      throw new NotFoundException(`The product with ${id} does not exist.`);
    }

    if (updateProductDto.name) {
      const existingName = await this.productModel
        .findOne({
          name: updateProductDto.name,
        })
        .exec();

      if (existingName && existingName.brand === updateProductDto.brand) {
        throw new BadRequestException(`You can't create repetitive product`);
      }
    }

    if (updateProductDto.brand) {
      const existingBrand = await this.productModel
        .findOne({
          brand: updateProductDto.brand,
        })
        .exec();
      if (existingBrand && existingBrand.name === updateProductDto.name) {
        throw new BadRequestException(`You can't create repetitive product`);
      }
    }

    Object.assign(product, updateProductDto);
    const updatedProduct = await product.save();

    return updatedProduct;
  }

  async remove(id: string) {
    if (!mongoose.isValidObjectId(id)) {
      throw new BadRequestException('Invalid product ID');
    }
    const product = await this.productModel.findByIdAndDelete(id).exec();

    if (!product) {
      throw new NotFoundException(`The product with ${id} does not exist.`);
    }

    return { message: `Product with ID "${id}" has been deleted.` };
  }
}
