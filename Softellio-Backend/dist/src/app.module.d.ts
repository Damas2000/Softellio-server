import { MiddlewareConsumer, OnModuleInit } from '@nestjs/common';
import { FrontendBootstrapService } from './frontend/frontend-bootstrap.service';
export declare class AppModule implements OnModuleInit {
    private frontendBootstrapService;
    private readonly logger;
    constructor(frontendBootstrapService: FrontendBootstrapService);
    configure(consumer: MiddlewareConsumer): void;
    onModuleInit(): Promise<void>;
    private shouldRunBootstrap;
}
