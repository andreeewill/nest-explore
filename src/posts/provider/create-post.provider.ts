import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { CreatePostDto } from '../dtos/create-post.dto';
import { UsersService } from 'src/users/providers/users.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from '../post.entity';
import { TagsService } from 'src/tags/providers/tags.service';
import { ActiveUserData } from 'src/auth/interfaces/active-user-data.interface';

@Injectable()
export class CreatePostProvider {
  constructor(
    @InjectRepository(Post)
    private readonly postsRepository: Repository<Post>,

    private readonly usersService: UsersService,

    private readonly tagsService: TagsService,
  ) {}

  public async create(createPostDto: CreatePostDto, user: ActiveUserData) {
    let author = undefined;
    let tags = undefined;

    try {
      // Find author from DB based on authorId
      author = await this.usersService.findOneById(user.sub);

      // Find tags
      tags = await this.tagsService.findMultipleTags(createPostDto.tags);
    } catch (error) {
      throw new ConflictException(error);
    }
    console.log({ tags });
    if (createPostDto.tags.length !== tags.length) {
      throw new BadRequestException('Please check your tag IDs');
    }

    // Create post
    const post = this.postsRepository.create({
      ...createPostDto,
      author,
      tags,
    });

    try {
      return await this.postsRepository.save(post);
    } catch (error) {
      throw new ConflictException(error, {
        description: 'Ensure post slug is unique and not a duplicate',
      });
    }
  }
}
