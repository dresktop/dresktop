import { Model } from "objection"

export class Logger extends Model {

    id!: number;
    identifier!: string;
    environment_id!: number;
    command!: string;
    result!: string;
    status!: boolean;
    executed!: string;

    static get tableName() {
        return 'logger';
    }
}