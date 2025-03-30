// CreateDeckDto
export class CreateDeckDto {
    userId: string;
    name?: string;
  }
  
  // UpdateDeckSlotDto
  export class UpdateDeckSlotDto {
    userId: string;
    deckId: number;
    cardId: number;
    slot: number;
  }
  