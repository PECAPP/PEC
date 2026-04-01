export declare const apiContract: {
    auth: {
        login: {
            method: "POST";
            summary: "Login to the PEC ERP";
            body: import("zod").ZodObject<{
                email: import("zod").ZodString;
                password: import("zod").ZodString;
            }, "strip", import("zod").ZodTypeAny, {
                email: string;
                password: string;
            }, {
                email: string;
                password: string;
            }>;
            path: "/auth/login";
            responses: {
                200: import("zod").ZodObject<{
                    user: import("zod").ZodObject<{
                        id: import("zod").ZodString;
                        email: import("zod").ZodString;
                        fullName: import("zod").ZodString;
                        role: import("zod").ZodString;
                    }, "strip", import("zod").ZodTypeAny, {
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
                    token: import("zod").ZodString;
                }, "strip", import("zod").ZodTypeAny, {
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
                401: import("zod").ZodObject<{
                    message: import("zod").ZodString;
                }, "strip", import("zod").ZodTypeAny, {
                    message: string;
                }, {
                    message: string;
                }>;
            };
        };
        signup: {
            method: "POST";
            summary: "Sign up for a new account";
            body: import("zod").ZodObject<{
                fullName: import("zod").ZodString;
                email: import("zod").ZodString;
                password: import("zod").ZodString;
                role: import("zod").ZodDefault<import("zod").ZodEnum<["student", "faculty", "college_admin"]>>;
            }, "strip", import("zod").ZodTypeAny, {
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
                201: import("zod").ZodObject<{
                    user: import("zod").ZodObject<{
                        id: import("zod").ZodString;
                        email: import("zod").ZodString;
                        fullName: import("zod").ZodString;
                        role: import("zod").ZodString;
                    }, "strip", import("zod").ZodTypeAny, {
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
                    token: import("zod").ZodString;
                }, "strip", import("zod").ZodTypeAny, {
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
                400: import("zod").ZodObject<{
                    message: import("zod").ZodString;
                }, "strip", import("zod").ZodTypeAny, {
                    message: string;
                }, {
                    message: string;
                }>;
                409: import("zod").ZodObject<{
                    message: import("zod").ZodString;
                }, "strip", import("zod").ZodTypeAny, {
                    message: string;
                }, {
                    message: string;
                }>;
            };
        };
    };
};
export * from './auth.contract';
