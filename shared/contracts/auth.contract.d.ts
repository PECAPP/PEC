import { z } from 'zod';
export declare const authContract: {
    login: {
        method: "POST";
        summary: "Login to the PEC ERP";
        body: z.ZodObject<{
            email: z.ZodString;
            password: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            email: string;
            password: string;
        }, {
            email: string;
            password: string;
        }>;
        path: "/auth/login";
        responses: {
            200: z.ZodObject<{
                user: z.ZodObject<{
                    id: z.ZodString;
                    email: z.ZodString;
                    fullName: z.ZodString;
                    role: z.ZodString;
                }, "strip", z.ZodTypeAny, {
                    id: string;
                    fullName: string;
                    email: string;
                    role: string;
                }, {
                    id: string;
                    fullName: string;
                    email: string;
                    role: string;
                }>;
                token: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                user: {
                    id: string;
                    fullName: string;
                    email: string;
                    role: string;
                };
                token: string;
            }, {
                user: {
                    id: string;
                    fullName: string;
                    email: string;
                    role: string;
                };
                token: string;
            }>;
            401: z.ZodObject<{
                message: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                message: string;
            }, {
                message: string;
            }>;
        };
    };
    signup: {
        method: "POST";
        summary: "Sign up for a new account";
        body: z.ZodObject<{
            fullName: z.ZodString;
            email: z.ZodString;
            password: z.ZodString;
            role: z.ZodDefault<z.ZodEnum<["student", "faculty", "college_admin"]>>;
        }, "strip", z.ZodTypeAny, {
            fullName: string;
            email: string;
            password: string;
            role: "student" | "faculty" | "college_admin";
        }, {
            fullName: string;
            email: string;
            password: string;
            role?: "student" | "faculty" | "college_admin" | undefined;
        }>;
        path: "/auth/signup";
        responses: {
            201: z.ZodObject<{
                user: z.ZodObject<{
                    id: z.ZodString;
                    email: z.ZodString;
                    fullName: z.ZodString;
                    role: z.ZodString;
                }, "strip", z.ZodTypeAny, {
                    id: string;
                    fullName: string;
                    email: string;
                    role: string;
                }, {
                    id: string;
                    fullName: string;
                    email: string;
                    role: string;
                }>;
                token: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                user: {
                    id: string;
                    fullName: string;
                    email: string;
                    role: string;
                };
                token: string;
            }, {
                user: {
                    id: string;
                    fullName: string;
                    email: string;
                    role: string;
                };
                token: string;
            }>;
            400: z.ZodObject<{
                message: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                message: string;
            }, {
                message: string;
            }>;
            409: z.ZodObject<{
                message: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                message: string;
            }, {
                message: string;
            }>;
        };
    };
};
