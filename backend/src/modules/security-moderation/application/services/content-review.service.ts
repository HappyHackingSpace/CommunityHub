import { Injectable } from '@nestjs/common';

@Injectable()
export class ContentReviewService {
  private prohibitedKeywords: Set<string> = new Set([
    'badword1',
    'badword2',
    'badword3',
  ]);

  async reviewContent(content: string): Promise<{ isFlagged: boolean; reasons: string[] }> {
    const reasons: string[] = [];
    const lowerContent = content.toLowerCase();

    for (const keyword of this.prohibitedKeywords) {
      if (lowerContent.includes(keyword.toLowerCase())) {
        reasons.push(`Contains prohibited keyword: ${keyword}`);
      }
    }

    const isFlagged = reasons.length > 0;
    return { isFlagged, reasons };
  }

  addProhibitedKeyword(keyword: string): void {
    this.prohibitedKeywords.add(keyword.toLowerCase());
  }

  removeProhibitedKeyword(keyword: string): void {
    this.prohibitedKeywords.delete(keyword.toLowerCase());
  }

  getProhibitedKeywords(): string[] {
    return Array.from(this.prohibitedKeywords);
  }
}
