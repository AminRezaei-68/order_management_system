import { productSchema } from 'src/products/schemas/product.schema';

productSchema.pre('save', { document: true, query: false }, function (next) {
  const session = this.$session();
  if (session) {
    if (this.quantity === 0) {
      this.status = ['Out of Stock'];
    } else if (this.quantity > 0 && this.status.includes('Out of Stock')) {
      this.status = ['In Stock'];
    }
  }
  next();
});
