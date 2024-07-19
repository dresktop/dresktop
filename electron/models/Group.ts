import { Model } from "objection"

export class Group extends Model {

    id!: number;
    name!: string;
    color!: string;

    static get tableName() {
        return 'group';
    }
}