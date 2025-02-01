import { WatchlistItem } from './WatchlistItem'

export class Watchlist {
  constructor(
    public id: string,
    private items: WatchlistItem[] = []
  ) {}

  public addItem(item: WatchlistItem): void {
    this.items.push(item)
  }

  public removeItem(id: string): void {
    this.items = this.items.filter(item => item.itemId !== id)
  }

  public getItems(): WatchlistItem[] {
    return this.items
  }

  toJSON() {
    return {
      id: this.id,
      items: this.items.map(item => item.toJSON())
    }
  }
}
