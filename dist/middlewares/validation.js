"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateUserRequest = void 0;
const express_validator_1 = require("express-validator");
const handleValidationErrors = (req, res, next) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};
const validateUserRequest = () => [
    (0, express_validator_1.body)("name").isString().notEmpty().withMessage("Name must be a string"),
    (0, express_validator_1.body)("addressLine1").isString().notEmpty().withMessage("addressLine1 must be a string"),
    (0, express_validator_1.body)("city").isString().notEmpty().withMessage("city must be a string"),
    (0, express_validator_1.body)("country").isString().notEmpty().withMessage("country must be a string"),
    handleValidationErrors, // Reuse the handleValidationErrors middleware
];
exports.validateUserRequest = validateUserRequest;
