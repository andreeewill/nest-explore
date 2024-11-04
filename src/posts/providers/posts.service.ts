import {
  BadRequestException,
  Injectable,
  RequestTimeoutException,
} from '@nestjs/common';
import { Repository } from 'typeorm';

import { UsersService } from 'src/users/providers/users.service';
import { CreatePostDto } from '../dtos/create-post.dto';
import { Post } from '../post.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { MetaOption } from 'src/meta-options/meta-option.entity';
import { TagsService } from 'src/tags/providers/tags.service';
import { PatchPostDto } from '../dtos/patch-post.dto';
import { GetPostsDto } from '../dtos/get-posts.dto';
import { PaginationProvider } from 'src/common/pagination/providers/pagination.provider';
import { Paginated } from 'src/common/pagination/interfaces/paginated.interface';
import { CreatePostProvider } from '../provider/create-post.provider';
import { ActiveUserData } from 'src/auth/interfaces/active-user-data.interface';

@Injectable()
export class PostsService {
  constructor(
    /**
     * Services
     */
    private readonly usersService: UsersService,
    private readonly tagsService: TagsService,

    /**
     * Repository
     */
    @InjectRepository(Post)
    private readonly postsRepository: Repository<Post>,

    @InjectRepository(MetaOption)
    private readonly metaOptionsRepository: Repository<MetaOption>,

    /**
     * Inject paginationProivder
     */
    private readonly paginationProvider: PaginationProvider,

    /**
     * Inject createPostProvider
     */
    private readonly createPostProvider: CreatePostProvider,
  ) {}

  /**
   * Get all posts in the DB fro particular user ID in paginated format
   *
   * @param postQuery - hh
   * @param userId - ID of the user
   * @returns
   */
  public async findAll(
    postQuery: GetPostsDto,
    userId: number,
  ): Promise<Paginated<Post>> {
    const posts = await this.paginationProvider.paginateQuery(
      postQuery, // this contains limit and page
      this.postsRepository,
    );

    return posts;
  }

  /**
   * Creating new posts
   */
  public async create(createPostDto: CreatePostDto, user: ActiveUserData) {
    return await this.createPostProvider.create(createPostDto, user);
  }

  /**
   * Delete post
   *
   * @param id Post's ID
   */
  public async delete(id: number) {
    // Delete the post (there is on delete cascase on meta options, so when post id deleted, then the corresponding meta options will be deleted automatically)
    await this.postsRepository.delete(id);

    // confirmation
    return { deleted: true, id };
  }

  /**
   * Update posts's details
   *
   * @param patchPostDto
   * @returns
   */
  public async update(patchPostDto: PatchPostDto) {
    let tags = null;
    let post = undefined;

    // Find the tags
    try {
      tags = await this.tagsService.findMultipleTags(patchPostDto.tags);
    } catch (error) {
      throw new RequestTimeoutException(
        'Unable to process your request at the moment, please try later',
      );
    }

    /**
     * Number of tag(s) should be equal
     */
    if (!tags || tags.length !== patchPostDto.tags.length) {
      throw new BadRequestException(
        'Please check your tag Ids and ensure they are correct',
      );
    }

    // find the post
    try {
      post = await this.postsRepository.findOneBy({ id: patchPostDto.id });
    } catch (error) {
      throw new RequestTimeoutException(
        'Unable to process your request at the moment, please try later',
      );
    }

    if (!post) {
      throw new BadRequestException('the posts ID does not exist');
    }

    // Update the properties
    post.title = patchPostDto.title ?? post.title;
    post.content = patchPostDto.content ?? post.content;
    post.status = patchPostDto.status ?? post.status;
    post.postType = patchPostDto.postType ?? post.postType;
    post.slug = patchPostDto.slug ?? post.slug;
    post.featuredImageUrl =
      patchPostDto.featuredImageUrl ?? post.featuredImageUrl;
    post.publishOn = patchPostDto.publishOn ?? post.publishOn;

    // Assign new tags
    post.tags = tags;

    // save and return
    try {
      await this.postsRepository.save(post);
    } catch (error) {
      throw new RequestTimeoutException(
        'Unable to process your request at the moment, please try later',
      );
    }

    return post;
  }
}
