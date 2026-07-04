import { Community } from './community.entity';
import { CommunityVisibility } from '../enums/community-visibility.enum';
import { CommunityName } from '../value-objects/community-name.vo';
import { CommunityDescription } from '../value-objects/community-description.vo';

describe('Community Entity', () => {
  const validProps = {
    name: 'Test Community',
    description: 'A test community for testing',
    visibility: CommunityVisibility.PUBLIC,
    founderId: 'founder-123',
    logoUrl: 'https://example.com/logo.png',
    websiteUrl: 'https://example.com',
    tenantId: 12345,
  };

  describe('create', () => {
    it('should create a valid community', () => {
      const community = Community.create(validProps);

      expect(community).toBeDefined();
      expect(community.id).toBeDefined();
      expect(community.name.toString()).toBe(validProps.name);
      expect(community.description.toString()).toBe(validProps.description);
      expect(community.visibility).toBe(validProps.visibility);
      expect(community.founderId).toBe(validProps.founderId);
      expect(community.logoUrl).toBe(validProps.logoUrl);
      expect(community.websiteUrl).toBe(validProps.websiteUrl);
      expect(community.tenantId).toBe(validProps.tenantId);
    });

    it('should generate unique ID for each community', () => {
      const community1 = Community.create(validProps);
      const community2 = Community.create(validProps);

      expect(community1.id).not.toBe(community2.id);
    });

    it('should throw error when name is empty', () => {
      expect(() =>
        Community.create({
          ...validProps,
          name: '',
        }),
      ).toThrow('Community name cannot be empty');
    });

    it('should throw error when description is empty', () => {
      expect(() =>
        Community.create({
          ...validProps,
          description: '',
        }),
      ).toThrow('Community description cannot be empty');
    });

    it('should create community with optional fields omitted', () => {
      const props = {
        name: 'Test Community',
        description: 'Test description',
        visibility: CommunityVisibility.PRIVATE,
        founderId: 'founder-123',
      };

      const community = Community.create(props);

      expect(community).toBeDefined();
      expect(community.logoUrl).toBeUndefined();
      expect(community.websiteUrl).toBeUndefined();
      expect(community.tenantId).toBeUndefined();
    });

    it('should set createdAt and updatedAt dates', () => {
      const beforeCreate = new Date();
      const community = Community.create(validProps);
      const afterCreate = new Date();

      expect(community.createdAt).toBeInstanceOf(Date);
      expect(community.updatedAt).toBeInstanceOf(Date);
      expect(community.createdAt.getTime()).toBeGreaterThanOrEqual(
        beforeCreate.getTime(),
      );
      expect(community.createdAt.getTime()).toBeLessThanOrEqual(
        afterCreate.getTime(),
      );
    });
  });

  describe('getters', () => {
    let community: Community;

    beforeEach(() => {
      community = Community.create(validProps);
    });

    it('should return name value object', () => {
      expect(community.name).toBeInstanceOf(CommunityName);
      expect(community.name.toString()).toBe(validProps.name);
    });

    it('should return description value object', () => {
      expect(community.description).toBeInstanceOf(CommunityDescription);
      expect(community.description.toString()).toBe(validProps.description);
    });

    it('should return visibility', () => {
      expect(community.visibility).toBe(CommunityVisibility.PUBLIC);
    });

    it('should return founderId', () => {
      expect(community.founderId).toBe(validProps.founderId);
    });

    it('should return optional properties', () => {
      expect(community.logoUrl).toBe(validProps.logoUrl);
      expect(community.websiteUrl).toBe(validProps.websiteUrl);
      expect(community.tenantId).toBe(validProps.tenantId);
    });
  });

  describe('update', () => {
    let community: Community;

    beforeEach(() => {
      community = Community.create(validProps);
    });

    it('should update name', () => {
      const newName = 'Updated Community';
      community.update({ name: newName });

      expect(community.name.toString()).toBe(newName);
    });

    it('should update description', () => {
      const newDesc = 'Updated description';
      community.update({ description: newDesc });

      expect(community.description.toString()).toBe(newDesc);
    });

    it('should update visibility', () => {
      community.update({ visibility: CommunityVisibility.PRIVATE });

      expect(community.visibility).toBe(CommunityVisibility.PRIVATE);
    });

    it('should update logoUrl', () => {
      const newLogoUrl = 'https://example.com/new-logo.png';
      community.update({ logoUrl: newLogoUrl });

      expect(community.logoUrl).toBe(newLogoUrl);
    });

    it('should update websiteUrl', () => {
      const newWebsiteUrl = 'https://newexample.com';
      community.update({ websiteUrl: newWebsiteUrl });

      expect(community.websiteUrl).toBe(newWebsiteUrl);
    });

    it('should update multiple properties at once', () => {
      const updates = {
        name: 'New Name',
        description: 'New Description',
        visibility: CommunityVisibility.RESTRICTED,
      };

      community.update(updates);

      expect(community.name.toString()).toBe(updates.name);
      expect(community.description.toString()).toBe(updates.description);
      expect(community.visibility).toBe(updates.visibility);
    });

    it('should update updatedAt timestamp', () => {
      const beforeUpdate = new Date();
      community.update({ name: 'Updated' });
      const afterUpdate = new Date();

      expect(community.updatedAt.getTime()).toBeGreaterThanOrEqual(
        beforeUpdate.getTime(),
      );
      expect(community.updatedAt.getTime()).toBeLessThanOrEqual(
        afterUpdate.getTime(),
      );
    });

    it('should preserve non-updated properties', () => {
      const originalFounderId = community.founderId;
      community.update({ name: 'New Name' });

      expect(community.founderId).toBe(originalFounderId);
    });

    it('should throw error when updating name with empty string', () => {
      expect(() => community.update({ name: '' })).toThrow(
        'Community name cannot be empty',
      );
    });

    it('should throw error when updating description with empty string', () => {
      expect(() => community.update({ description: '' })).toThrow(
        'Community description cannot be empty',
      );
    });

    it('should handle partial updates', () => {
      community.update({ name: 'Only Name' });

      expect(community.name.toString()).toBe('Only Name');
      expect(community.description.toString()).toBe(validProps.description);
    });
  });

  describe('canBeModifiedBy', () => {
    let community: Community;

    beforeEach(() => {
      community = Community.create({
        ...validProps,
        founderId: 'founder-123',
      });
    });

    it('should return true when user is founder', () => {
      expect(community.canBeModifiedBy('founder-123')).toBe(true);
    });

    it('should return false when user is not founder', () => {
      expect(community.canBeModifiedBy('other-user-456')).toBe(false);
    });

    it('should be case-sensitive', () => {
      expect(community.canBeModifiedBy('Founder-123')).toBe(false);
    });
  });

  describe('restore', () => {
    it('should restore community from persistence', () => {
      const communityId = 'test-id-123';
      const createdAt = new Date('2024-01-01');
      const updatedAt = new Date('2024-01-02');

      const props = {
        name: CommunityName.create('Test Community'),
        description: CommunityDescription.create('Test description'),
        visibility: CommunityVisibility.PUBLIC,
        founderId: 'founder-123',
      };

      const community = Community.restore(communityId, props, createdAt, updatedAt);

      expect(community.id).toBe(communityId);
      expect(community.name).toBe(props.name);
      expect(community.createdAt).toBe(createdAt);
      expect(community.updatedAt).toBe(updatedAt);
    });

    it('should allow modifications to restored community', () => {
      const communityId = 'test-id-123';
      const createdAt = new Date('2024-01-01');

      const props = {
        name: CommunityName.create('Original Name'),
        description: CommunityDescription.create('Original description'),
        visibility: CommunityVisibility.PUBLIC,
        founderId: 'founder-123',
      };

      const community = Community.restore(communityId, props, createdAt);
      community.update({ name: 'Updated Name' });

      expect(community.name.toString()).toBe('Updated Name');
    });
  });

  describe('Visibility Scenarios', () => {
    it('should create PUBLIC community', () => {
      const community = Community.create({
        ...validProps,
        visibility: CommunityVisibility.PUBLIC,
      });

      expect(community.visibility).toBe(CommunityVisibility.PUBLIC);
    });

    it('should create PRIVATE community', () => {
      const community = Community.create({
        ...validProps,
        visibility: CommunityVisibility.PRIVATE,
      });

      expect(community.visibility).toBe(CommunityVisibility.PRIVATE);
    });

    it('should create RESTRICTED community', () => {
      const community = Community.create({
        ...validProps,
        visibility: CommunityVisibility.RESTRICTED,
      });

      expect(community.visibility).toBe(CommunityVisibility.RESTRICTED);
    });

    it('should transition visibility from PUBLIC to PRIVATE', () => {
      const community = Community.create({
        ...validProps,
        visibility: CommunityVisibility.PUBLIC,
      });

      community.update({ visibility: CommunityVisibility.PRIVATE });

      expect(community.visibility).toBe(CommunityVisibility.PRIVATE);
    });
  });

  describe('Edge Cases', () => {
    it('should handle community with max length name', () => {
      const maxName = 'a'.repeat(100);
      const community = Community.create({
        ...validProps,
        name: maxName,
      });

      expect(community.name.toString()).toBe(maxName);
    });

    it('should handle community with max length description', () => {
      const maxDesc = 'a'.repeat(1000);
      const community = Community.create({
        ...validProps,
        description: maxDesc,
      });

      expect(community.description.toString()).toBe(maxDesc);
    });

    it('should handle community with special characters in name', () => {
      const specialName = 'Community-2024 & Friends!';
      const community = Community.create({
        ...validProps,
        name: specialName,
      });

      expect(community.name.toString()).toBe(specialName);
    });
  });
});
