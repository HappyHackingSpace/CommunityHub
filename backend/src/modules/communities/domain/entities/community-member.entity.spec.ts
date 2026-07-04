import { CommunityMember } from './community-member.entity';
import { CommunityMemberStatus } from '../enums/community-member-status.enum';

describe('CommunityMember Entity', () => {
  const validProps = {
    communityId: 'community-123',
    userId: 'user-456',
  };

  describe('create', () => {
    it('should create a pending member', () => {
      const member = CommunityMember.create(validProps);

      expect(member).toBeDefined();
      expect(member.id).toBeDefined();
      expect(member.communityId).toBe(validProps.communityId);
      expect(member.userId).toBe(validProps.userId);
      expect(member.status).toBe(CommunityMemberStatus.PENDING);
      expect(member.appliedAt).toBeInstanceOf(Date);
    });

    it('should generate unique ID for each member', () => {
      const member1 = CommunityMember.create(validProps);
      const member2 = CommunityMember.create(validProps);

      expect(member1.id).not.toBe(member2.id);
    });

    it('should set appliedAt date', () => {
      const beforeCreate = new Date();
      const member = CommunityMember.create(validProps);
      const afterCreate = new Date();

      expect(member.appliedAt.getTime()).toBeGreaterThanOrEqual(
        beforeCreate.getTime(),
      );
      expect(member.appliedAt.getTime()).toBeLessThanOrEqual(
        afterCreate.getTime(),
      );
    });

    it('should not set approvedAt initially', () => {
      const member = CommunityMember.create(validProps);

      expect(member.approvedAt).toBeUndefined();
      expect(member.approvedBy).toBeUndefined();
    });
  });

  describe('approve', () => {
    let member: CommunityMember;

    beforeEach(() => {
      member = CommunityMember.create(validProps);
    });

    it('should approve pending member', () => {
      const adminId = 'admin-123';
      member.approve(adminId);

      expect(member.status).toBe(CommunityMemberStatus.ACTIVE);
      expect(member.approvedAt).toBeInstanceOf(Date);
      expect(member.approvedBy).toBe(adminId);
    });

    it('should throw error when approving non-pending member', () => {
      member.approve('admin-123');

      expect(() => member.approve('admin-456')).toThrow(
        'Only pending members can be approved',
      );
    });

    it('should set approvedAt timestamp', () => {
      const beforeApprove = new Date();
      member.approve('admin-123');
      const afterApprove = new Date();

      expect(member.approvedAt.getTime()).toBeGreaterThanOrEqual(
        beforeApprove.getTime(),
      );
      expect(member.approvedAt.getTime()).toBeLessThanOrEqual(
        afterApprove.getTime(),
      );
    });

    it('should update updatedAt timestamp', () => {
      const beforeApprove = new Date();
      member.approve('admin-123');
      const afterApprove = new Date();

      expect(member.updatedAt.getTime()).toBeGreaterThanOrEqual(
        beforeApprove.getTime(),
      );
      expect(member.updatedAt.getTime()).toBeLessThanOrEqual(
        afterApprove.getTime(),
      );
    });
  });

  describe('reject', () => {
    let member: CommunityMember;

    beforeEach(() => {
      member = CommunityMember.create(validProps);
    });

    it('should reject pending member', () => {
      member.reject();

      expect(member.status).toBe(CommunityMemberStatus.REMOVED);
    });

    it('should throw error when rejecting non-pending member', () => {
      member.reject();

      expect(() => member.reject()).toThrow(
        'Only pending members can be rejected',
      );
    });

    it('should throw error when rejecting approved member', () => {
      member.approve('admin-123');

      expect(() => member.reject()).toThrow(
        'Only pending members can be rejected',
      );
    });

    it('should update updatedAt timestamp', () => {
      const beforeReject = new Date();
      member.reject();
      const afterReject = new Date();

      expect(member.updatedAt.getTime()).toBeGreaterThanOrEqual(
        beforeReject.getTime(),
      );
      expect(member.updatedAt.getTime()).toBeLessThanOrEqual(
        afterReject.getTime(),
      );
    });
  });

  describe('suspend', () => {
    let member: CommunityMember;

    beforeEach(() => {
      member = CommunityMember.create(validProps);
      member.approve('admin-123');
    });

    it('should suspend active member', () => {
      member.suspend();

      expect(member.status).toBe(CommunityMemberStatus.SUSPENDED);
    });

    it('should throw error when suspending non-active member', () => {
      const pendingMember = CommunityMember.create(validProps);

      expect(() => pendingMember.suspend()).toThrow(
        'Only active members can be suspended',
      );
    });

    it('should throw error when suspending already suspended member', () => {
      member.suspend();

      expect(() => member.suspend()).toThrow(
        'Only active members can be suspended',
      );
    });

    it('should update updatedAt timestamp', () => {
      const beforeSuspend = new Date();
      member.suspend();
      const afterSuspend = new Date();

      expect(member.updatedAt.getTime()).toBeGreaterThanOrEqual(
        beforeSuspend.getTime(),
      );
      expect(member.updatedAt.getTime()).toBeLessThanOrEqual(
        afterSuspend.getTime(),
      );
    });
  });

  describe('reactivate', () => {
    let member: CommunityMember;

    beforeEach(() => {
      member = CommunityMember.create(validProps);
      member.approve('admin-123');
      member.suspend();
    });

    it('should reactivate suspended member', () => {
      member.reactivate();

      expect(member.status).toBe(CommunityMemberStatus.ACTIVE);
    });

    it('should throw error when reactivating non-suspended member', () => {
      const activeMember = CommunityMember.create(validProps);
      activeMember.approve('admin-123');

      expect(() => activeMember.reactivate()).toThrow(
        'Only suspended members can be reactivated',
      );
    });

    it('should throw error when reactivating pending member', () => {
      const pendingMember = CommunityMember.create(validProps);

      expect(() => pendingMember.reactivate()).toThrow(
        'Only suspended members can be reactivated',
      );
    });

    it('should update updatedAt timestamp', () => {
      const beforeReactivate = new Date();
      member.reactivate();
      const afterReactivate = new Date();

      expect(member.updatedAt.getTime()).toBeGreaterThanOrEqual(
        beforeReactivate.getTime(),
      );
      expect(member.updatedAt.getTime()).toBeLessThanOrEqual(
        afterReactivate.getTime(),
      );
    });
  });

  describe('remove', () => {
    let member: CommunityMember;

    beforeEach(() => {
      member = CommunityMember.create(validProps);
    });

    it('should remove pending member', () => {
      member.remove();

      expect(member.status).toBe(CommunityMemberStatus.REMOVED);
    });

    it('should remove active member', () => {
      member.approve('admin-123');
      member.remove();

      expect(member.status).toBe(CommunityMemberStatus.REMOVED);
    });

    it('should remove suspended member', () => {
      member.approve('admin-123');
      member.suspend();
      member.remove();

      expect(member.status).toBe(CommunityMemberStatus.REMOVED);
    });
  });

  describe('status checks', () => {
    it('isPending should return true for pending member', () => {
      const member = CommunityMember.create(validProps);

      expect(member.isPending()).toBe(true);
    });

    it('isPending should return false for approved member', () => {
      const member = CommunityMember.create(validProps);
      member.approve('admin-123');

      expect(member.isPending()).toBe(false);
    });

    it('isActive should return true for approved member', () => {
      const member = CommunityMember.create(validProps);
      member.approve('admin-123');

      expect(member.isActive()).toBe(true);
    });

    it('isActive should return false for pending member', () => {
      const member = CommunityMember.create(validProps);

      expect(member.isActive()).toBe(false);
    });

    it('isActive should return false for suspended member', () => {
      const member = CommunityMember.create(validProps);
      member.approve('admin-123');
      member.suspend();

      expect(member.isActive()).toBe(false);
    });

    it('isActive should return false for removed member', () => {
      const member = CommunityMember.create(validProps);
      member.remove();

      expect(member.isActive()).toBe(false);
    });
  });

  describe('restore', () => {
    it('should restore member from persistence', () => {
      const memberId = 'test-member-id';
      const createdAt = new Date('2024-01-01');
      const updatedAt = new Date('2024-01-02');

      const props = {
        communityId: 'community-123',
        userId: 'user-456',
        status: CommunityMemberStatus.ACTIVE,
        appliedAt: new Date('2024-01-01'),
        approvedAt: new Date('2024-01-01'),
        approvedBy: 'admin-123',
      };

      const member = CommunityMember.restore(memberId, props, createdAt, updatedAt);

      expect(member.id).toBe(memberId);
      expect(member.communityId).toBe(props.communityId);
      expect(member.userId).toBe(props.userId);
      expect(member.status).toBe(CommunityMemberStatus.ACTIVE);
      expect(member.createdAt).toBe(createdAt);
      expect(member.updatedAt).toBe(updatedAt);
    });
  });

  describe('State Transitions', () => {
    it('should allow transition PENDING -> ACTIVE', () => {
      const member = CommunityMember.create(validProps);
      member.approve('admin-123');

      expect(member.status).toBe(CommunityMemberStatus.ACTIVE);
    });

    it('should allow transition PENDING -> REMOVED', () => {
      const member = CommunityMember.create(validProps);
      member.reject();

      expect(member.status).toBe(CommunityMemberStatus.REMOVED);
    });

    it('should allow transition ACTIVE -> SUSPENDED', () => {
      const member = CommunityMember.create(validProps);
      member.approve('admin-123');
      member.suspend();

      expect(member.status).toBe(CommunityMemberStatus.SUSPENDED);
    });

    it('should allow transition SUSPENDED -> ACTIVE', () => {
      const member = CommunityMember.create(validProps);
      member.approve('admin-123');
      member.suspend();
      member.reactivate();

      expect(member.status).toBe(CommunityMemberStatus.ACTIVE);
    });

    it('should allow transition to REMOVED from any status', () => {
      const member = CommunityMember.create(validProps);
      member.approve('admin-123');
      member.suspend();
      member.remove();

      expect(member.status).toBe(CommunityMemberStatus.REMOVED);
    });
  });
});
