import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional, Min } from 'class-validator';

export enum StockOperation {
  SET = 'set',
  INCREMENT = 'increment',
  DECREMENT = 'decrement',
}

export class UpdateStockDto {
  @ApiProperty({
    description: 'Stock quantity to apply, meaning depends on operation',
    example: 10,
  })
  @IsInt()
  @Min(0)
  quantity!: number;

  @ApiProperty({
    description: 'How to apply the quantity to the current stock',
    enum: StockOperation,
    example: StockOperation.SET,
    required: false,
    default: StockOperation.SET,
  })
  @IsOptional()
  @IsEnum(StockOperation)
  operation?: StockOperation = StockOperation.SET;
}
