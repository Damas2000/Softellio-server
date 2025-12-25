"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocialMediaMapsModule = void 0;
const common_1 = require("@nestjs/common");
const social_media_maps_service_1 = require("./social-media-maps.service");
const social_media_maps_controller_1 = require("./social-media-maps.controller");
const prisma_module_1 = require("../config/prisma.module");
let SocialMediaMapsModule = class SocialMediaMapsModule {
};
exports.SocialMediaMapsModule = SocialMediaMapsModule;
exports.SocialMediaMapsModule = SocialMediaMapsModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule],
        controllers: [social_media_maps_controller_1.SocialMediaMapsController],
        providers: [social_media_maps_service_1.SocialMediaMapsService],
        exports: [social_media_maps_service_1.SocialMediaMapsService],
    })
], SocialMediaMapsModule);
//# sourceMappingURL=social-media-maps.module.js.map