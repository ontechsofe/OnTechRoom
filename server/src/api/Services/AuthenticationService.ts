import {Service} from "typedi";
import {OTRService} from "./OTRService";


@Service()
export class AuthenticationService {

    constructor(
        private otrService: OTRService
    ) {
    }

    public login(username: string, password: string): Promise<any> {
        return this.otrService.checkLoginOnMyCampus(username, password);
    }
}
