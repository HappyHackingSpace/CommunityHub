import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { RoleType } from '../../../../domain/enums/role-type.enum';
import { Permission } from '../../../../domain/value-objects/permission.vo';

@Entity('roles')
export class RoleOrmEntity {
  @PrimaryColumn('varchar')
  id: string;

  @Column('enum', { enum: RoleType, unique: true })
  roleType: RoleType;

  @Column('varchar')
  name: string;

  @Column('text')
  description: string;

  @Column('simple-array')
  permissions: Permission[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
