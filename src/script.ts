import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
import express from 'express';
import nodemailer from 'nodemailer';
import otpGenerator from 'otp-generator';
import cookieParser from 'cookie-parser';
const app = express();
app.use(cookieParser());
const port = 3000;
import { verifyToken, createJwtToken } from './utils/auth';
app.set('view engine', 'hbs');
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
import path from 'path'
app.use(express.static(path.join(__dirname, 'public')));

app.get("/", (req, res) => {

    res.render("home");
})

app.post('/sendOTP', async (req, res) => {
    let { firstName, lastName, mobile, email, password } = req.body;

    // Generate OTP
    const otp = otpGenerator.generate(6, { lowerCaseAlphabets: false, upperCaseAlphabets: false, specialChars: false, digits: true });

    // Create a user with the generated OTP
    const user = await prisma.user.create({
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

    let token = createJwtToken(user);
    res.cookie("token", token);

    // Send email with OTP
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'aditi2003goyal@gmail.com',
            pass: 'uahw pwuu izny wefp'
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
        } else {
            console.log('Email sent:', info.response);
            res.render("matching");
        }
    });
});



app.post('/verifyOTP', verifyToken, async (req, res) => {
    const id = req.user.id;

    // Fetch the user by email
    const user = await prisma.user.findUnique({
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
    } else {
        res.status(400).send('Invalid OTP');
    }
});


app.listen(port, () => {
    console.log(`Server started at http://localhost:${port}`)
});
