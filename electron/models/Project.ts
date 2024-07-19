import { Model } from "objection"

export class Project extends Model {

    id!: number
    name!: string
    machine_name!: string
    group_id!: number
    created!: Date

    static get tableName() {
        return 'project';
    }
}