import { db } from "../database/db.js";
import {
  allUsers,
  createUsers,
  user,
  usernameCheck,
  usersLogin,
} from "./queries.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { generateAccessToken } from "../middleware.js";
dotenv.config();

export const getAllUsers = async (req, res) => {
  try {
    const results = await db.query(allUsers);
    res.status(200).json(results.rows);
  } catch (error) {
    console.error(error);
  }
};

export const getUser = async (req, res) => {
  try {
    const username = req.params.username;
    const password = req.params.password;
    const results = await db.query(user, [username, password]);
    res.status(201).json(results.rows[0]);
  } catch (err) {
    console.error(err);
  }
};

export const createUser = async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const user = {
      username: req.body.username,
      password: hashedPassword,
      phone: req.body.phone,
      email: req.body.email,
    };
    const usernameChecks = await db.query(usernameCheck, [user.username]);
    if (usernameChecks.rowCount === 0) {
      const results = await db.query(createUsers, [
        user.username,
        user.password,
        user.phone,
        user.email,
      ]);
      console.log(results.rows[0]);
      return res.status(201).json("User Created");
    }
    if (usernameChecks.rows[0].username === user.username) {
      return res.json("username taken");
    }
  } catch (err) {
    console.error(err);
  }
};

export const userLogin = async (req, res) => {
  try {
    const username = req.params.username;
    const password = req.params.password;

    const user = await db.query(usersLogin, [username]);
    console.log(user.rows[0]);
    if (user.rowCount === 0) {
      return res.status(404).json("Username not found");
    }
    if (await bcrypt.compare(password, user.rows[0].password)) {
      const accessToken = jwt.sign(username, process.env.ACCESS_TOKEN_SECRET);
      return res.status(201).json({ accessToken: accessToken });
    } else {
      return res.status(404).json("Incorrect Username or Password.");
    }
  } catch (err) {
    console.error(err);
  }
};

export const tokenCheck = async (req, res) => {
  const accessToken = req.body.token;
  if (accessToken == null) return res.status(401);
  if (!accessToken.includes(accessToken)) return res.status(403);
  jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) return res.status(403);
    const accessToken = generateAccessToken(user);
    res.json({ accessToken: accessToken });
  });
};

export const usersLikedProperties = async (req, res, next) => {
  try {
    console.log("here");
  } catch (err) {}
};
