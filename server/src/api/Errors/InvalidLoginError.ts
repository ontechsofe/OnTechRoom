import { HttpError } from 'routing-controllers';

export class InvalidLoginError extends HttpError {
    constructor() {
        super(404, 'Invalid Login!');
    }
}
