import {Application} from 'express';
import {MicroframeworkLoader, MicroframeworkSettings} from 'microframework-w3tec';
import {createExpressServer} from 'routing-controllers';

import {env} from '../env';
import logger from "../Util/Log";
// Controllers
import {RoomController} from "../api/Controllers/RoomController";
import {AuthenticationController} from "../api/Controllers/AuthenticationController";
import {CalendarController} from "../api/Controllers/CalendarController";
import {BookingController} from "../api/Controllers/BookingController";
// Middleware
import {LogMiddleware} from "../Middleware/LogMiddleware";
import {SecurityMiddleware} from "../Middleware/SecurityMiddleware";
import {ErrorMiddleware} from "../Middleware/ErrorMiddleware";

export const expressLoader: MicroframeworkLoader = (settings: MicroframeworkSettings | undefined) => {
    if (settings) {
        logger.info("[START] Loading Express")

        const expressApp: Application = createExpressServer({
            cors: true,
            classTransformer: true,
            routePrefix: env.app.routePrefix,
            defaultErrorHandler: false,
            controllers: [
                RoomController,
                AuthenticationController,
                CalendarController,
                BookingController
            ],
            middlewares: [
                LogMiddleware,
                SecurityMiddleware,
                ErrorMiddleware
            ]
        });

        if (!env.isTest) {
            const server = expressApp
                .listen(env.app.port, () => logger.info('[START] Server Listening'));
            settings.setData('express_server', server);
        }
        settings.setData('express_app', expressApp);
    }
};
