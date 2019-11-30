import {Body, JsonController, Post} from 'routing-controllers';
import {AuthenticationService} from "../Services/AuthenticationService";
import {InvalidLoginError} from "../Errors/InvalidLoginError";
import {JSONSchema} from "class-validator-jsonschema";
import {IsString} from "class-validator";


@JSONSchema({
    description: "This is the body!",
    example: {
        id: '',
        password: ''
    }
})
export class AuthenticationDataBody {
    @IsString()
    public id: string;
    @IsString()
    public password: string;
}

@JsonController('/auth')
export class AuthenticationController {

    constructor(
        private authenticationService: AuthenticationService
    ) {
    }

    @Post('/login')
    public async authenticateUser(@Body() data: AuthenticationDataBody) {
        try {
            return await this.authenticationService.login(data.id, data.password);
        }
        catch (e) {
            return new InvalidLoginError();
        }
    }
}
