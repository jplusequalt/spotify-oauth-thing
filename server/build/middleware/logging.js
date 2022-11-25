"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logging = void 0;
const logging = (req, res, next) => {
    console.log('Method: ', req.method);
    console.log('URL: ', req.url);
    console.log('Headers: ', req.headers);
    next();
};
exports.logging = logging;
