import { Model } from "objection"

export class Environment extends Model {

    id!: number;
    name!: string;
    machine_name!: string;
    project_id!: number;
    type!: string;
    user!: string;
    ssh_key_path!: string;
    uri!: string;
    host!: string;
    root!: string;
    drush_path!: string;
    production_mode!: boolean;

    static get tableName() {
        return 'environment';
    }
}