/* eslint-disable @typescript-eslint/no-unused-vars */
import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import { TestingModule, Test } from '@nestjs/testing';
import { MongooseModule } from '@nestjs/mongoose';
import * as request from 'supertest';
import { ProductsModule } from '../../src/products/products.module';
import { CreateProductDto } from '../../src/products/dto/create-product.dto';
import mongoose from 'mongoose';

describe('[Feature] Product - /products', () => {
  let app: INestApplication;
  const testDbUri = 'mongodb://localhost:27017/test-db';
  let productId: string;

  // داده تستی
  const product = {
    name: 'Test Product',
    description: 'This is a test product',
    price: 99.99,
    quantity: 1,
    category: ['Electronics'],
    status: ['in Stock'],
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ProductsModule,
        MongooseModule.forRoot(testDbUri), // اتصال به پایگاه داده in-memory
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
        transformOptions: {
          enableImplicitConversion: true,
        },
      }),
    );
    await app.init();
  });

  it('Create [POST /]', () => {
    return request(app.getHttpServer())
      .post('/products')
      .send(product as CreateProductDto)
      .expect(HttpStatus.CREATED)
      .then(({ body }) => {
        const expectedProduct = expect.objectContaining({
          ...product,
          _id: expect.any(String),
        });
        productId = body._id; // ذخیره ID محصول برای تست‌های بعدی
        expect(body).toEqual(expectedProduct);
      });
  });

  it('Get all [GET /]', () => {
    return request(app.getHttpServer())
      .get('/products')
      .expect(HttpStatus.OK)
      .then(({ body }) => {
        expect(Array.isArray(body)).toBe(true);
        expect(body).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              _id: productId,
              ...product,
            }),
          ]),
        );
      });
  });

  it('Get one [GET /:id]', () => {
    return request(app.getHttpServer())
      .get(`/products/${productId}`)
      .expect(HttpStatus.OK)
      .then(({ body }) => {
        expect(body).toEqual(
          expect.objectContaining({
            _id: productId,
            ...product,
          }),
        );
      });
  });

  it('Update one [PATCH /:id]', () => {
    const updatedProduct = {
      ...product,
      name: 'Updated Product Name',
    };

    return request(app.getHttpServer())
      .patch(`/products/${productId}`)
      .send(updatedProduct)
      .expect(HttpStatus.OK)
      .then(({ body }) => {
        expect(body).toEqual(
          expect.objectContaining({
            _id: productId,
            ...updatedProduct,
          }),
        );
      });
  });

  it('Delete one [DELETE /:id]', () => {
    return request(app.getHttpServer())
      .delete(`/products/${productId}`)
      .expect(HttpStatus.OK)
      .then(({ body }) => {
        expect(body).toEqual({ deleted: true });
      });
  });

  afterAll(async () => {
    if (app) await app.close();
    await mongoose.disconnect();
  });
});
