import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

import { Role } from '@/domain/model/role';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', unique: true, nullable: false })
  username: string;

  @Column({ type: 'varchar', unique: true, nullable: false })
  email: string;

  @Column({ type: 'varchar', nullable: false })
  password: string;

  @Column({ type: 'varchar', default: Role.Customer })
  role: Role;

  @CreateDateColumn({ name: 'createdate' })
  createdDate: Date;
}

