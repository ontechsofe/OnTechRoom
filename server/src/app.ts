import 'reflect-metadata';
import logger from "./Util/Log";
import {bootstrapMicroframework} from 'microframework-w3tec';
import {iocLoader} from "./Loaders/iocLoader";
import {expressLoader} from "./Loaders/expressLoader";
import {swaggerLoader} from "./Loaders/swaggerLoader";
import {monitorLoader} from "./Loaders/monitorLoader";
import {homeLoader} from "./Loaders/homeLoader";

bootstrapMicroframework({
    loaders: [
        iocLoader,
        expressLoader,
        swaggerLoader,
        monitorLoader,
        homeLoader
    ]
})
    .then(() => {
        logger.info("[START] Server is running!");
    })
    .catch((err: Error) => {
        logger.error('[ERROR] THE SERVER HAS CRASHED: ' + err + "\n" + err.stack)
    });
