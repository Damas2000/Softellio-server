"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FrontendModule = void 0;
const common_1 = require("@nestjs/common");
const frontend_controller_1 = require("./frontend.controller");
const frontend_bootstrap_service_1 = require("./frontend-bootstrap.service");
const frontend_debug_controller_1 = require("./frontend-debug.controller");
const theme_settings_controller_1 = require("./theme-settings.controller");
const page_layouts_controller_1 = require("./page-layouts.controller");
const frontend_aggregator_controller_1 = require("./frontend-aggregator.controller");
const section_types_controller_1 = require("./section-types.controller");
const theme_settings_service_1 = require("./theme-settings.service");
const page_layouts_service_1 = require("./page-layouts.service");
const frontend_aggregator_service_1 = require("./frontend-aggregator.service");
const section_types_service_1 = require("./section-types.service");
const common_module_1 = require("../common/common.module");
const prisma_module_1 = require("../config/prisma.module");
let FrontendModule = class FrontendModule {
};
exports.FrontendModule = FrontendModule;
exports.FrontendModule = FrontendModule = __decorate([
    (0, common_1.Module)({
        imports: [common_module_1.CommonModule, prisma_module_1.PrismaModule],
        controllers: [
            frontend_controller_1.FrontendController,
            frontend_debug_controller_1.FrontendDebugController,
            theme_settings_controller_1.ThemeSettingsController,
            page_layouts_controller_1.PageLayoutsController,
            frontend_aggregator_controller_1.FrontendAggregatorController,
            section_types_controller_1.SectionTypesController,
        ],
        providers: [
            frontend_bootstrap_service_1.FrontendBootstrapService,
            theme_settings_service_1.ThemeSettingsService,
            page_layouts_service_1.PageLayoutsService,
            frontend_aggregator_service_1.FrontendAggregatorService,
            section_types_service_1.SectionTypesService,
        ],
        exports: [
            frontend_bootstrap_service_1.FrontendBootstrapService,
            theme_settings_service_1.ThemeSettingsService,
            page_layouts_service_1.PageLayoutsService,
            frontend_aggregator_service_1.FrontendAggregatorService,
            section_types_service_1.SectionTypesService,
        ],
    })
], FrontendModule);
//# sourceMappingURL=frontend.module.js.map