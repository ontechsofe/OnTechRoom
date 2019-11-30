import { MicroframeworkLoader, MicroframeworkSettings } from 'microframework-w3tec';
import { Container } from 'typedi';
import { useContainer as routingUseContainer } from 'routing-controllers';
import { useContainer as classValidatorUseContainer } from 'class-validator';
import logger from "../Util/Log";

export const iocLoader: MicroframeworkLoader = (settings: MicroframeworkSettings | undefined) => {
    logger.info("[START] Loading Controllers")
    routingUseContainer(Container);
    classValidatorUseContainer(Container);
};
