"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authContract = void 0;
const core_1 = require("@ts-rest/core");
const zod_1 = require("zod");
const erp_1 = require("../schemas/erp");
const c = (0, core_1.initContract)();
exports.authContract = c.router({
    login: {
        method: 'POST',
        path: '/auth/login',
        responses: {
            200: erp_1.AuthResponseSchema,
            401: zod_1.z.object({ message: zod_1.z.string() }),
        },
        body: erp_1.AuthLoginSchema,
        summary: 'Login to the PEC ERP',
    },
    signup: {
        method: 'POST',
        path: '/auth/signup',
        responses: {
            201: erp_1.AuthResponseSchema,
            400: zod_1.z.object({ message: zod_1.z.string() }),
            409: zod_1.z.object({ message: zod_1.z.string() }),
        },
        body: erp_1.AuthSignupSchema,
        summary: 'Sign up for a new account',
    },
});
