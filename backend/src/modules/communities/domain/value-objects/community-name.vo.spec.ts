import { CommunityName } from './community-name.vo';

describe('CommunityName Value Object', () => {
  describe('create', () => {
    it('should create a valid community name', () => {
      const name = 'Test Community';
      const communityName = CommunityName.create(name);

      expect(communityName).toBeDefined();
      expect(communityName.toString()).toBe(name);
    });

    it('should throw error when name is empty', () => {
      expect(() => CommunityName.create('')).toThrow(
        'Community name cannot be empty',
      );
    });

    it('should throw error when name is only whitespace', () => {
      expect(() => CommunityName.create('   ')).toThrow(
        'Community name cannot be empty',
      );
    });

    it('should throw error when name exceeds 100 characters', () => {
      const longName = 'a'.repeat(101);
      expect(() => CommunityName.create(longName)).toThrow(
        'Community name cannot exceed 100 characters',
      );
    });

    it('should accept name with exactly 100 characters', () => {
      const name = 'a'.repeat(100);
      const communityName = CommunityName.create(name);

      expect(communityName.toString()).toBe(name);
    });

    it('should trim whitespace from name', () => {
      const nameWithSpaces = '  Test Community  ';
      const communityName = CommunityName.create(nameWithSpaces);

      expect(communityName.toString()).toBe('Test Community');
    });

    it('should accept name with special characters', () => {
      const name = 'Test-Community_123 & Friends!';
      const communityName = CommunityName.create(name);

      expect(communityName.toString()).toBe(name);
    });

    it('should accept name with unicode characters', () => {
      const name = 'Communauté Test 测试社区';
      const communityName = CommunityName.create(name);

      expect(communityName.toString()).toBe(name);
    });

    it('should accept name with exactly 1 character', () => {
      const name = 'A';
      const communityName = CommunityName.create(name);

      expect(communityName.toString()).toBe(name);
    });
  });

  describe('toString', () => {
    it('should return the string value', () => {
      const name = 'Test Community';
      const communityName = CommunityName.create(name);

      expect(communityName.toString()).toBe(name);
    });

    it('should return trimmed value', () => {
      const communityName = CommunityName.create('  Test  ');

      expect(communityName.toString()).toBe('Test');
    });
  });

  describe('equals', () => {
    it('should return true for same value', () => {
      const name1 = CommunityName.create('Test Community');
      const name2 = CommunityName.create('Test Community');

      expect(name1.equals(name2)).toBe(true);
    });

    it('should return false for different values', () => {
      const name1 = CommunityName.create('Test Community');
      const name2 = CommunityName.create('Different Community');

      expect(name1.equals(name2)).toBe(false);
    });

    it('should return true for same value with different whitespace trimming', () => {
      const name1 = CommunityName.create('Test Community');
      const name2 = CommunityName.create('  Test Community  ');

      expect(name1.equals(name2)).toBe(true);
    });

    it('should be case-sensitive', () => {
      const name1 = CommunityName.create('Test Community');
      const name2 = CommunityName.create('test community');

      expect(name1.equals(name2)).toBe(false);
    });

    it('should return false when comparing with similar names', () => {
      const name1 = CommunityName.create('Test Community');
      const name2 = CommunityName.create('Test Communities');

      expect(name1.equals(name2)).toBe(false);
    });
  });

  describe('Edge Cases', () => {
    it('should handle names with multiple spaces', () => {
      const name = 'Test    Community';
      const communityName = CommunityName.create(name);

      expect(communityName.toString()).toBe(name);
    });

    it('should handle names with hyphens and underscores', () => {
      const name = 'Test-Community_Group';
      const communityName = CommunityName.create(name);

      expect(communityName.toString()).toBe(name);
    });

    it('should handle numbers in name', () => {
      const name = 'Community 2024';
      const communityName = CommunityName.create(name);

      expect(communityName.toString()).toBe(name);
    });
  });
});
