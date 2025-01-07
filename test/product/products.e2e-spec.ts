/* eslint-disable @typescript-eslint/no-unused-vars */
import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import { TestingModule, Test } from '@nestjs/testing';
import { MongooseModule } from '@nestjs/mongoose';
import * as request from 'supertest';
import { ProductsModule } from '../../src/products/products.module';
import { CreateProductDto } from '../../src/products/dto/create-product.dto';
import mongoose from 'mongoose';
import { AuthModule } from '../../src/auth/auth.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';


describe('[Feature] Product - /products', () => {
  let app: INestApplication;
  const testDbUri = 'mongodb://localhost:27017/test-db';
  let productId: string;
  let jwtToken: string;

 
  const product = {
    name: 'Test Product',
    description: 'This is a test product',
    price: 99.99,
    quantity: 1,
    category: ['electronics'],
    status: ['In Stock'],
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        AuthModule,
        ProductsModule,
        ConfigModule.forRoot(),
        MongooseModule.forRoot(testDbUri),
      ],
      providers: [
        {
          provide: ConfigService,
          useValue: { get: jest.fn().mockReturnValue('@M!n2568') },
        },
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

    // const userModel = moduleFixture.get('UserModel');
    // await userModel.deleteMany({});

    // await userModel.create({
    //   name: 'amin',
    //   username: 'aminR',
    //   email: 'amin@yahoo.com',
    //   password: await bcrypt.hash('Amin12345', 10), // رمز عبور هش شده
    //   roles:"admin",
    //   address:"ney-shahrak",
    //   confirmPassword:"Amin12345"
    // });

    // const response = await request(app.getHttpServer())
    // .post('/auth/login')
    // .send({ usernameOrEmail: 'aminR', password: 'Amin12345' });
    // console.log('Response status:', response.status);
    // console.log('Login response:', response.body.access_token.token);

    // jwtToken = response.body.access_token.token;
    // console.log('the token is :', jwtToken);


    // console.log('Server URL:', app.getHttpServer().url);

    // const dbConnection = await mongoose.connect(testDbUri);
    // console.log('Database connected: ', dbConnection.connection.readyState);
  });

  it('Create [POST /]', () => {
    return request(app.getHttpServer())
      .post('/products')
      .set('Authorization', 'bearer ' + `${jwtToken}`)
      .send(product as CreateProductDto)
      .expect(HttpStatus.CREATED)
      .then(({ body }) => {
        console.log('Response Body:', body);
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
      // .set('Authorization', 'Bearer ' + `${jwtToken}`)
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
      // .set('Authorization', 'Bearer ' + `${jwtToken}`)
      .delete(`/products/${productId}`)
      .expect(HttpStatus.OK)
      .then(({ body }) => {
        expect(body).toEqual({ message: `Product with ID "${productId}" has been deleted.`});
      });
  });

  afterAll(async () => {
    if (app) await app.close();
    await mongoose.disconnect();
  });
});
