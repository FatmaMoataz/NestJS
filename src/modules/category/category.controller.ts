import { Controller, Get } from '@nestjs/common';
import { CategoryService } from './category.service';

@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get()
  categories(): { message: string } {
    // const categories: string[] = this.categoryService.categories();
    return { message: 'done' };
  }
}
