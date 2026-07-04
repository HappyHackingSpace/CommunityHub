export abstract class BaseEntity {
    protected readonly _id: string;
    protected readonly _createdAt: Date;
    protected _updatedAt: Date;

    constructor(id: string, createdAt: Date, updatedAt?: Date) {
        this._id = id;
        this._createdAt = createdAt;
        this._updatedAt = updatedAt || createdAt;
    }
    
    get id(): string {
        return this._id;
    }
    get createdAt(): Date {
        return this._createdAt;
    }
    get updatedAt(): Date {
        return this._updatedAt;
    }
    set updatedAt(date: Date) {
        this._updatedAt = date;
    }
}