import { Model } from "objection"

export class Settings extends Model {

    name!: string
    key!: string
    value!: string

    static get tableName() {
        return 'settings';
    }
}