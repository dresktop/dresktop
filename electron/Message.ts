export class Message {

    // Response is success or error
    success: boolean;

    // Message of success or error
    message: string;

    // Data in case of success
    data: any;

    constructor(success: boolean, message: string, data: any = null) {

        this.success = success;
        this.message = message;

        if (data) {
            this.data = data;
        }
    }
}