"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const express_1 = __importDefault(require("express"));
const nodemailer_1 = __importDefault(require("nodemailer"));
const otp_generator_1 = __importDefault(require("otp-generator"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const app = (0, express_1.default)();
app.use((0, cookie_parser_1.default)());
const port = 3000;
const auth_1 = require("./utils/auth");
app.set('view engine', 'hbs');
app.use(express_1.default.urlencoded({ extended: true }));
app.use(express_1.default.json());
const path_1 = __importDefault(require("path"));
app.use(express_1.default.static(path_1.default.join(__dirname, 'public')));
app.get("/", (req, res) => {
    res.render("home");
});
app.post('/sendOTP', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let { firstName, lastName, mobile, email, password } = req.body;
    // Generate OTP
    const otp = otp_generator_1.default.generate(6, { lowerCaseAlphabets: false, upperCaseAlphabets: false, specialChars: false, digits: true });
    // Create a user with the generated OTP
    const user = yield prisma.user.create({
        data: {
            firstName: firstName,
            lastName: lastName,
            mobile: mobile,
            email: email,
            password: password,
            token: otp,
            isVerified: false
        }
    });
    let token = (0, auth_1.createJwtToken)(user);
    res.cookie("token", token);
    // Send email with OTP
    const transporter = nodemailer_1.default.createTransport({
        service: 'gmail',
        auth: {
            user: 'akashx1550@gmail.com',
            pass: 'lyxq pzoi idlv gjcb'
        }
    });
    const mailOptions = {
        from: 'Akash',
        to: email,
        subject: 'Your OTP',
        text: `Your OTP is: ${otp}`
    };
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error occurred:', error);
            res.status(500).send('Failed to send OTP');
        }
        else {
            console.log('Email sent:', info.response);
            res.render("matching");
        }
    });
}));
app.post('/verifyOTP', auth_1.verifyToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.user.id;
    // Fetch the user by email
    const user = yield prisma.user.findUnique({
        where: {
            id: id,
        },
    });
    if (!user) {
        return res.status(404).send('User not found');
    }
    const { enteredOTP } = req.body;
    // Compare the entered OTP with the expected OTP
    if (enteredOTP === user.token) {
        res.status(200).send('OTP verified successfully');
    }
    else {
        res.status(400).send('Invalid OTP');
    }
}));
app.listen(port, () => {
    console.log(`Server started at http://localhost:${port}`);
});
