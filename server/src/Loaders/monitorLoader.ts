import monitor from 'express-status-monitor';
import { MicroframeworkLoader, MicroframeworkSettings } from 'microframework-w3tec';

import { env } from '../env';
import logger from "../Util/Log";

export const monitorLoader: MicroframeworkLoader = (settings: MicroframeworkSettings | undefined) => {
    if (settings) {
        logger.info("[START] Loading Monitor")
        const expressApp = settings.getData('express_app');
        expressApp.use(monitor());
        expressApp.get(
            env.monitor.route,
            (req, res, next) => next(),
            // @ts-ignore
            monitor().pageRoute
        );
    }
};
