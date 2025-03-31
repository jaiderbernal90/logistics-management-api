export interface PageRequest {
  page: number;
  limit: number;
}

export interface Page<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export class PageImpl<T> implements Page<T> {
  readonly items: T[];
  readonly total: number;
  readonly page: number;
  readonly limit: number;
  readonly totalPages: number;
  readonly hasNext: boolean;
  readonly hasPrevious: boolean;

  constructor(items: T[], total: number, pageRequest: PageRequest) {
    this.items = items;
    this.total = total;
    this.page = pageRequest.page;
    this.limit = pageRequest.limit;
    this.totalPages = Math.ceil(total / pageRequest.limit);
    this.hasNext = this.page < this.totalPages;
    this.hasPrevious = this.page > 1;
  }

  static empty<T>(pageRequest: PageRequest): Page<T> {
    return new PageImpl<T>([], 0, pageRequest);
  }

  map<R>(mapper: (item: T) => R): Page<R> {
    return new PageImpl<R>(this.items.map(mapper), this.total, {
      page: this.page,
      limit: this.limit,
    });
  }
}
