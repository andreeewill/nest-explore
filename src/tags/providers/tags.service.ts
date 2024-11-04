import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

import { Tag } from '../tag.entity';
import { CreateTagDto } from '../dtos/create-tag.dto';

@Injectable()
export class TagsService {
  constructor(
    @InjectRepository(Tag)
    private readonly tagsRepository: Repository<Tag>,
  ) {}

  public async create(createTagDto: CreateTagDto) {
    const tag = this.tagsRepository.create(createTagDto);

    return await this.tagsRepository.save(tag);
  }

  public async findMultipleTags(tags: number[]) {
    const results = await this.tagsRepository.find({ where: { id: In(tags) } });

    return results;
  }

  /**
   * Delete particular tag by it's id
   * @param id
   */
  public async delete(id: number) {
    await this.tagsRepository.delete(id);

    return { deleted: true, id };
  }

  /**
   * Soft delete particular tag by it's ID
   * @param id Tag's ID
   * @returns
   */
  public async softRemove(id: number) {
    await this.tagsRepository.softDelete(id);

    return { deleted: true, id };
  }
}
