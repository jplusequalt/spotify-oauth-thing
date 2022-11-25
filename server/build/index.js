"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const express_session_1 = __importDefault(require("express-session"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const logging_1 = require("./middleware/logging");
const login_1 = require("./routes/login");
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
app.use((0, express_session_1.default)({
    secret: 'this is a test',
    resave: true,
    saveUninitialized: true
}));
app.use(logging_1.logging);
app.use('/', login_1.loginRouter);
app.listen(process.env.PORT, () => {
    console.log(`App listening on port ${process.env.PORT}`);
});
