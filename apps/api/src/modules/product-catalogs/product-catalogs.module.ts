import { Module } from '@nestjs/common';
import { ProductCatalogsController } from './product-catalogs.controller';
import { ProductCatalogsService } from './product-catalogs.service';

@Module({
  controllers: [ProductCatalogsController],
  providers: [ProductCatalogsService]
})
export class ProductCatalogsModule {}
