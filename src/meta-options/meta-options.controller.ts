import { Body, Controller, Post } from '@nestjs/common';
import { MetaOptionsService } from './providers/meta-options.service';
import { CreatePostMetaOptionsDto } from './dtos/create-post-meta-options.dto';
import { ApiTags } from '@nestjs/swagger';

@Controller('meta-options')
@ApiTags('Meta Options')
export class MetaOptionsController {
  constructor(private readonly metaOptionsService: MetaOptionsService) {}

  @Post()
  public create(@Body() createPostMetaOptionDto: CreatePostMetaOptionsDto) {
    return this.metaOptionsService.create(createPostMetaOptionDto);
  }
}
