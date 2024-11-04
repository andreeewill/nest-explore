import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { MetaOption } from '../meta-option.entity';
import { CreatePostMetaOptionsDto } from '../dtos/create-post-meta-options.dto';

@Injectable()
export class MetaOptionsService {
  constructor(
    @InjectRepository(MetaOption)
    private readonly metaOptionRepository: Repository<MetaOption>,
  ) {}

  public async create(createPostMetaOptionDto: CreatePostMetaOptionsDto) {
    const metaOption = this.metaOptionRepository.create(
      createPostMetaOptionDto,
    );
    return await this.metaOptionRepository.save(metaOption);
  }
}
