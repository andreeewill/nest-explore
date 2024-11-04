import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { PostType } from './enums/postType.enum';
import { PostStatus } from './enums/postStatus.enum';
import { MetaOption } from 'src/meta-options/meta-option.entity';
import { User } from 'src/users/user.entity';
import { Tag } from 'src/tags/tag.entity';

@Entity()
export class Post {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'varchar',
    length: 512,
    nullable: false,
  })
  title: string;

  @Column({
    type: 'enum',
    enum: PostType,
    nullable: false,
    default: PostType.POST,
  })
  postType: PostType;

  @Column({
    type: 'varchar',
    length: 256,
    nullable: false,
    unique: true,
  })
  slug: string;

  @Column({
    type: 'enum',
    enum: PostStatus,
    nullable: false,
    default: PostStatus.DRAFT,
  })
  status: PostStatus;

  @Column({
    type: 'text',
    nullable: true,
  })
  content: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  schema: string;

  @Column({
    type: 'varchar',
    length: 1024,
    nullable: true,
  })
  featuredImageUrl: string;

  @Column({
    type: 'timestamp', // datetime in mysql
    nullable: true,
  })
  publishOn: Date;

  @OneToOne(() => MetaOption, (metaOptions) => metaOptions.post, {
    cascade: true,
    eager: true, // use eager loading
  })
  metaOptions?: MetaOption;

  @ManyToOne(() => User, (user) => user.posts, { eager: true })
  author: User;

  @ManyToMany(() => Tag, (tag) => tag.posts, { eager: true })
  @JoinTable() // cascade will work automatically (on deleting the post, the rows in the pivot table will be removed too)
  tags?: Tag[];
}
