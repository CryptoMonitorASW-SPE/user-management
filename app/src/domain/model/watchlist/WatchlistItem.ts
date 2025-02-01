import { v4 as uuidv4 } from 'uuid'

export class WatchlistItem {
  public itemId: string
  public addedAt: Date

  constructor(
    itemId: string | undefined,
    public cryptoId: string,
    addedAt: Date | undefined
  ) {
    this.itemId = itemId ? itemId : uuidv4()
    this.addedAt = addedAt ? addedAt : new Date()
  }

  toJSON() {
    return {
      itemId: this.itemId,
      cryptoId: this.cryptoId,
      addedAt: this.addedAt.toISOString()
    }
  }
}
