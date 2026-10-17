import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';

export class ReplyReviewDto {
  @ApiProperty({
    description: "Haven's reply to the review",
    example: "Thanks for the feedback, we're glad you loved it!",
  })
  @IsString()
  @MinLength(1)
  @MaxLength(2000)
  reply!: string;
}
