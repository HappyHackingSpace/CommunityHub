import { CommunityDescription } from './community-description.vo';

describe('CommunityDescription Value Object', () => {
  describe('create', () => {
    it('should create a valid community description', () => {
      const description = 'This is a test community description';
      const communityDesc = CommunityDescription.create(description);

      expect(communityDesc).toBeDefined();
      expect(communityDesc.toString()).toBe(description);
    });

    it('should throw error when description is empty', () => {
      expect(() => CommunityDescription.create('')).toThrow(
        'Community description cannot be empty',
      );
    });

    it('should throw error when description is only whitespace', () => {
      expect(() => CommunityDescription.create('   ')).toThrow(
        'Community description cannot be empty',
      );
    });

    it('should throw error when description exceeds 1000 characters', () => {
      const longDescription = 'a'.repeat(1001);
      expect(() => CommunityDescription.create(longDescription)).toThrow(
        'Community description cannot exceed 1000 characters',
      );
    });

    it('should accept description with exactly 1000 characters', () => {
      const description = 'a'.repeat(1000);
      const communityDesc = CommunityDescription.create(description);

      expect(communityDesc.toString()).toBe(description);
    });

    it('should trim whitespace from description', () => {
      const descWithSpaces = '  Test description  ';
      const communityDesc = CommunityDescription.create(descWithSpaces);

      expect(communityDesc.toString()).toBe('Test description');
    });

    it('should accept description with special characters', () => {
      const description = 'Community & Friends! @#$%^&*()_+-=[]{}|;:,.<>?';
      const communityDesc = CommunityDescription.create(description);

      expect(communityDesc.toString()).toBe(description);
    });

    it('should accept multi-line description', () => {
      const description = 'Line 1\nLine 2\nLine 3';
      const communityDesc = CommunityDescription.create(description);

      expect(communityDesc.toString()).toBe(description);
    });

    it('should accept description with unicode characters', () => {
      const description = 'Description avec caractères spéciaux: ñ, ü, ç 中文 日本語';
      const communityDesc = CommunityDescription.create(description);

      expect(communityDesc.toString()).toBe(description);
    });

    it('should accept description with exactly 1 character', () => {
      const description = 'A';
      const communityDesc = CommunityDescription.create(description);

      expect(communityDesc.toString()).toBe(description);
    });
  });

  describe('toString', () => {
    it('should return the string value', () => {
      const description = 'Test community description';
      const communityDesc = CommunityDescription.create(description);

      expect(communityDesc.toString()).toBe(description);
    });

    it('should return trimmed value', () => {
      const communityDesc = CommunityDescription.create('  Test  ');

      expect(communityDesc.toString()).toBe('Test');
    });

    it('should preserve internal whitespace', () => {
      const description = 'This  has   multiple    spaces';
      const communityDesc = CommunityDescription.create(description);

      expect(communityDesc.toString()).toBe(description);
    });
  });

  describe('equals', () => {
    it('should return true for same value', () => {
      const desc1 = CommunityDescription.create('Test description');
      const desc2 = CommunityDescription.create('Test description');

      expect(desc1.equals(desc2)).toBe(true);
    });

    it('should return false for different values', () => {
      const desc1 = CommunityDescription.create('Test description');
      const desc2 = CommunityDescription.create('Different description');

      expect(desc1.equals(desc2)).toBe(false);
    });

    it('should return true for same value with different whitespace trimming', () => {
      const desc1 = CommunityDescription.create('Test description');
      const desc2 = CommunityDescription.create('  Test description  ');

      expect(desc1.equals(desc2)).toBe(true);
    });

    it('should be case-sensitive', () => {
      const desc1 = CommunityDescription.create('Test Description');
      const desc2 = CommunityDescription.create('test description');

      expect(desc1.equals(desc2)).toBe(false);
    });

    it('should return false when comparing with similar descriptions', () => {
      const desc1 = CommunityDescription.create('Test community');
      const desc2 = CommunityDescription.create('Test community description');

      expect(desc1.equals(desc2)).toBe(false);
    });
  });

  describe('Edge Cases', () => {
    it('should handle descriptions with multiple newlines', () => {
      const description = 'Line 1\n\n\nLine 2';
      const communityDesc = CommunityDescription.create(description);

      expect(communityDesc.toString()).toBe(description);
    });

    it('should handle descriptions with tabs', () => {
      const description = 'Test\tdescription\twith\ttabs';
      const communityDesc = CommunityDescription.create(description);

      expect(communityDesc.toString()).toBe(description);
    });

    it('should handle descriptions with HTML-like content', () => {
      const description = 'Community <about> test & friends';
      const communityDesc = CommunityDescription.create(description);

      expect(communityDesc.toString()).toBe(description);
    });

    it('should handle very long valid descriptions', () => {
      const description = 'a'.repeat(999);
      const communityDesc = CommunityDescription.create(description);

      expect(communityDesc.toString()).toBe(description);
    });
  });
});
