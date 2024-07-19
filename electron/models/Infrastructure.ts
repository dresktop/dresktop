import { Model } from "objection"

export class Infrastructure extends Model {

    id!: number;
    environment_id!: number;
    file_path!: string;
    services!: string;

    static get tableName() {
        return 'infrastructure';
    }

    // static get virtualAttributes() {
    //     return ['services'];
    // }

    // get services(): any {
    //     return JSON.parse(this.services);
    // }
}